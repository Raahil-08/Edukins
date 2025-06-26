import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api'; // Your actual backend port

class ApiService {
  private client;
  private storedToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 60000, // Increased timeout for AI generation (60 seconds)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.storedToken) {
          config.headers.Authorization = `Bearer ${this.storedToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear stored token on 401
          this.storedToken = null;
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    this.storedToken = token;
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      const { token, user } = response.data;
      this.setAuthToken(token);
      return { token, user };
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available, use mock login
        console.warn('Backend not available, using mock authentication');
        const mockToken = 'mock-jwt-token-for-demo';
        const mockUser = {
          id: '1',
          email: email,
          name: email === 'student@edukins.com' ? 'Alex Student' : 'Demo User'
        };
        this.setAuthToken(mockToken);
        return { token: mockToken, user: mockUser };
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(email: string, password: string, name: string) {
    try {
      const response = await this.client.post('/auth/register', { email, password, name });
      const { token, user } = response.data;
      this.setAuthToken(token);
      return { token, user };
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available, use mock registration
        console.warn('Backend not available, using mock registration');
        const mockToken = 'mock-jwt-token-for-demo';
        const mockUser = { id: '2', email, name };
        this.setAuthToken(mockToken);
        return { token: mockToken, user: mockUser };
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async generateLesson(topic: string, grade: number, avatar: string = 'Professor Nova') {
    try {
      console.log('🚀 Calling backend lesson generation API...');
      console.log('📍 URL:', `${BASE_URL}/lesson`);
      console.log('📝 Payload:', { 
        subject: this.getSubjectFromTopic(topic),
        grade: grade,
        topic: topic,
        avatar: avatar
      });

      // Use the correct endpoint structure from your backend
      const response = await this.client.post('/lesson', { 
        subject: this.getSubjectFromTopic(topic),
        grade: grade,
        topic: topic,
        avatar: avatar
      });
      
      console.log('✅ Backend response:', response.data);
      
      // Transform the response to match our expected format
      const lesson = response.data;
      return {
        id: lesson.id || `generated_${Date.now()}`,
        topic: lesson.topic || topic,
        grade: lesson.grade || grade,
        content: lesson.script || lesson.content,
        keyPoints: lesson.keyPoints || this.extractKeyPoints(lesson.script || lesson.content),
        estimatedDuration: lesson.duration || this.estimateDuration(lesson.script || lesson.content),
        difficulty: lesson.difficulty || this.getDifficultyFromGrade(grade),
        generatedAt: new Date().toISOString(),
        wordCount: lesson.script ? lesson.script.split(' ').length : 0,
        avatar: lesson.avatar || avatar
      };
    } catch (error: any) {
      console.error('❌ Backend API Error:', error);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available, use mock generation
        console.warn('⚠️ Backend not available, using mock lesson generation');
        return this.generateMockLesson(topic, grade);
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid lesson parameters');
      }
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error.response?.status === 500) {
        throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
      }
      throw new Error(`Failed to generate lesson: ${error.message}`);
    }
  }

  async generateTTS(text: string, voiceId: string) {
    try {
      const response = await this.client.post('/tts/generate', { 
        text, 
        voiceId,
        format: 'mp3'
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available, fallback to browser TTS
        console.warn('Backend TTS not available, using browser text-to-speech');
        throw new Error('TTS_FALLBACK_TO_BROWSER');
      }
      
      if (error.response?.status === 503) {
        // TTS service unavailable, fallback to browser
        throw new Error('TTS_FALLBACK_TO_BROWSER');
      }
      
      throw new Error(`Failed to generate audio: ${error.message}`);
    }
  }

  async getUserProfile() {
    try {
      const response = await this.client.get('/user/profile');
      return response.data;
    } catch (error: any) {
      console.warn('Backend not available for profile, using mock data');
      return this.getMockProfile();
    }
  }

  async updateUserProfile(data: { name?: string; email?: string }) {
    try {
      const response = await this.client.put('/user/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error('Profile update not available in demo mode');
    }
  }

  // Helper methods
  private getSubjectFromTopic(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('math') || topicLower.includes('algebra') || topicLower.includes('geometry') || 
        topicLower.includes('fraction') || topicLower.includes('number') || topicLower.includes('calculation')) {
      return 'Math';
    }
    
    if (topicLower.includes('science') || topicLower.includes('chemistry') || topicLower.includes('physics') || 
        topicLower.includes('biology') || topicLower.includes('solar') || topicLower.includes('planet') ||
        topicLower.includes('animal') || topicLower.includes('plant') || topicLower.includes('chemical') ||
        topicLower.includes('matter') || topicLower.includes('volcano') || topicLower.includes('dinosaur')) {
      return 'Science';
    }
    
    if (topicLower.includes('history') || topicLower.includes('ancient') || topicLower.includes('war') || 
        topicLower.includes('civilization') || topicLower.includes('empire') || topicLower.includes('revolution')) {
      return 'History';
    }
    
    if (topicLower.includes('geography') || topicLower.includes('continent') || topicLower.includes('country') || 
        topicLower.includes('ocean') || topicLower.includes('mountain') || topicLower.includes('climate')) {
      return 'Geography';
    }
    
    if (topicLower.includes('english') || topicLower.includes('writing') || topicLower.includes('grammar') || 
        topicLower.includes('reading') || topicLower.includes('literature') || topicLower.includes('story')) {
      return 'English';
    }
    
    if (topicLower.includes('art') || topicLower.includes('drawing') || topicLower.includes('painting') || 
        topicLower.includes('color') || topicLower.includes('artist')) {
      return 'Art';
    }
    
    // Default to Science for general topics
    return 'Science';
  }

  private extractKeyPoints(content: string): string[] {
    if (!content) return [];
    
    // Simple extraction of key points from content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = [];
    
    // Look for sentences that seem like key points
    for (const sentence of sentences.slice(0, 10)) { // Limit to first 10 sentences
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 150) {
        // Look for sentences that start with key phrases
        if (trimmed.match(/^(First|Second|Third|Next|Finally|Remember|Important|Key|Main)/i) ||
            trimmed.includes('is important') || trimmed.includes('helps us') || 
            trimmed.includes('we learn') || trimmed.includes('understand')) {
          keyPoints.push(trimmed);
          if (keyPoints.length >= 5) break;
        }
      }
    }
    
    // If we don't have enough key points, add some generic ones
    if (keyPoints.length < 3) {
      keyPoints.push(`Understanding the fundamentals of the topic`);
      keyPoints.push(`Real-world applications and examples`);
      keyPoints.push(`Key concepts and important details`);
    }
    
    return keyPoints.slice(0, 6); // Limit to 6 key points
  }

  private estimateDuration(content: string): string {
    if (!content) return '5 min';
    
    const wordCount = content.split(' ').length;
    const estimatedMinutes = Math.ceil(wordCount / 200); // 200 words per minute reading speed
    return `${estimatedMinutes} min`;
  }

  private getDifficultyFromGrade(grade: number): string {
    if (grade <= 3) return 'Beginner';
    if (grade <= 6) return 'Intermediate';
    return 'Advanced';
  }

  // Mock lesson generation for demo purposes (fallback)
  private generateMockLesson(topic: string, grade: number) {
    const lessonTemplates = [
      {
        template: `Welcome to our exciting lesson about {topic}! Today we'll explore this fascinating subject in a way that's perfect for Grade {grade} students.

{topic} is an important topic that helps us understand the world around us. Let's start by learning the basics and then dive deeper into the most interesting aspects.

First, let's understand what {topic} really means. {topic} involves many different concepts that work together to create something amazing. When we study {topic}, we're learning about fundamental principles that affect our daily lives.

Here are some key points about {topic}:
- It plays a crucial role in our understanding of the world
- There are many practical applications we can observe
- Scientists and researchers continue to make new discoveries
- Understanding {topic} helps us make better decisions

Let's explore some examples of {topic} that you might encounter in everyday life. You've probably seen or experienced {topic} without even realizing it! This makes learning about {topic} both relevant and exciting.

As we continue our exploration of {topic}, remember that learning is a journey. Each new concept builds on what we've already learned, creating a strong foundation for future understanding.

The study of {topic} connects to many other subjects you're learning in school. This interconnectedness shows us how knowledge works together to help us understand our complex and wonderful world.

Keep asking questions about {topic} - curiosity is the key to great learning! The more we explore and investigate, the more fascinating {topic} becomes.`,
        keyPoints: [
          `Understanding the basics of {topic}`,
          `Real-world applications and examples`,
          `How {topic} connects to other subjects`,
          `The importance of {topic} in daily life`,
          `Future discoveries and research in {topic}`
        ]
      }
    ];

    const template = lessonTemplates[0];
    const content = template.template.replace(/{topic}/g, topic).replace(/{grade}/g, grade.toString());
    const keyPoints = template.keyPoints.map(point => point.replace(/{topic}/g, topic));

    // Estimate duration based on content length (average reading speed: 200 words per minute)
    const wordCount = content.split(' ').length;
    const estimatedMinutes = Math.ceil(wordCount / 200);

    return {
      id: `generated_${Date.now()}`,
      topic: topic,
      grade: grade,
      content: content,
      keyPoints: keyPoints,
      estimatedDuration: `${estimatedMinutes} min`,
      difficulty: grade <= 3 ? 'Beginner' : grade <= 5 ? 'Intermediate' : 'Advanced',
      generatedAt: new Date().toISOString(),
      wordCount: wordCount
    };
  }

  private getMockProfile() {
    return {
      id: '1',
      email: 'student@edukins.com',
      name: 'Alex Student',
      grade: 5,
      completedLessons: ['1', '2'],
      totalLessons: 12,
      subjects: ['Science', 'Math', 'English', 'History', 'Geography']
    };
  }
}

export const apiService = new ApiService();