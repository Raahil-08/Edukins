import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api'; // Your actual AI backend port

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
      console.log('🚀 Calling AI backend lesson generation...');
      console.log('📍 URL:', `${BASE_URL}/lesson`);
      console.log('📝 Payload:', { 
        subject: this.getSubjectFromTopic(topic),
        grade: grade,
        topic: topic,
        avatar: avatar
      });

      // Call your actual AI backend endpoint
      const response = await this.client.post('/lesson', { 
        subject: this.getSubjectFromTopic(topic),
        grade: grade,
        topic: topic,
        avatar: avatar
      });
      
      console.log('✅ AI Backend Response:', response.data);
      
      // Transform the response to match our expected format
      const lesson = response.data;
      
      // Extract key points from the AI-generated content
      const keyPoints = this.extractKeyPoints(lesson.script || lesson.content || '');
      
      return {
        id: lesson.id || `ai_generated_${Date.now()}`,
        topic: lesson.topic || topic,
        grade: lesson.grade || grade,
        content: lesson.script || lesson.content || '',
        keyPoints: keyPoints,
        estimatedDuration: lesson.duration || this.estimateDuration(lesson.script || lesson.content || ''),
        difficulty: lesson.difficulty || this.getDifficultyFromGrade(grade),
        generatedAt: new Date().toISOString(),
        wordCount: lesson.script ? lesson.script.split(' ').length : 0,
        avatar: lesson.avatar || avatar,
        isAIGenerated: true
      };
    } catch (error: any) {
      console.error('❌ AI Backend Error:', error);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available, show clear error
        throw new Error('AI backend is not running. Please start your backend server on port 5050.');
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
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      }
      
      throw new Error(`Failed to generate AI lesson: ${error.message}`);
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
        topicLower.includes('fraction') || topicLower.includes('number') || topicLower.includes('calculation') ||
        topicLower.includes('arithmetic') || topicLower.includes('multiplication') || topicLower.includes('division')) {
      return 'Math';
    }
    
    if (topicLower.includes('science') || topicLower.includes('chemistry') || topicLower.includes('physics') || 
        topicLower.includes('biology') || topicLower.includes('solar') || topicLower.includes('planet') ||
        topicLower.includes('animal') || topicLower.includes('plant') || topicLower.includes('chemical') ||
        topicLower.includes('matter') || topicLower.includes('volcano') || topicLower.includes('dinosaur') ||
        topicLower.includes('space') || topicLower.includes('earth') || topicLower.includes('nature')) {
      return 'Science';
    }
    
    if (topicLower.includes('history') || topicLower.includes('ancient') || topicLower.includes('war') || 
        topicLower.includes('civilization') || topicLower.includes('empire') || topicLower.includes('revolution') ||
        topicLower.includes('historical') || topicLower.includes('past') || topicLower.includes('timeline')) {
      return 'History';
    }
    
    if (topicLower.includes('geography') || topicLower.includes('continent') || topicLower.includes('country') || 
        topicLower.includes('ocean') || topicLower.includes('mountain') || topicLower.includes('climate') ||
        topicLower.includes('map') || topicLower.includes('location') || topicLower.includes('region')) {
      return 'Geography';
    }
    
    if (topicLower.includes('english') || topicLower.includes('writing') || topicLower.includes('grammar') || 
        topicLower.includes('reading') || topicLower.includes('literature') || topicLower.includes('story') ||
        topicLower.includes('language') || topicLower.includes('poetry') || topicLower.includes('essay')) {
      return 'English';
    }
    
    if (topicLower.includes('art') || topicLower.includes('drawing') || topicLower.includes('painting') || 
        topicLower.includes('color') || topicLower.includes('artist') || topicLower.includes('creative') ||
        topicLower.includes('design') || topicLower.includes('sculpture')) {
      return 'Art';
    }
    
    // Default to Science for general topics
    return 'Science';
  }

  private extractKeyPoints(content: string): string[] {
    if (!content) return [];
    
    // Enhanced key point extraction from AI-generated content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = [];
    
    // Look for sentences that seem like key points
    for (const sentence of sentences.slice(0, 15)) { // Check more sentences
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 200) {
        // Look for sentences that start with key phrases or contain important information
        if (trimmed.match(/^(First|Second|Third|Next|Finally|Remember|Important|Key|Main|Let's|Here|This|When|Why|How)/i) ||
            trimmed.includes('is important') || trimmed.includes('helps us') || 
            trimmed.includes('we learn') || trimmed.includes('understand') ||
            trimmed.includes('means that') || trimmed.includes('shows us') ||
            trimmed.includes('teaches us') || trimmed.includes('demonstrates')) {
          keyPoints.push(trimmed);
          if (keyPoints.length >= 6) break;
        }
      }
    }
    
    // If we don't have enough key points, extract from paragraph beginnings
    if (keyPoints.length < 3) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
      for (const paragraph of paragraphs.slice(0, 5)) {
        const firstSentence = paragraph.split(/[.!?]/)[0].trim();
        if (firstSentence.length > 30 && firstSentence.length < 150) {
          keyPoints.push(firstSentence);
          if (keyPoints.length >= 5) break;
        }
      }
    }
    
    return keyPoints.slice(0, 6); // Limit to 6 key points
  }

  private estimateDuration(content: string): string {
    if (!content) return '5 min';
    
    const wordCount = content.split(' ').length;
    const estimatedMinutes = Math.ceil(wordCount / 180); // Slightly slower reading for educational content
    return `${estimatedMinutes} min`;
  }

  private getDifficultyFromGrade(grade: number): string {
    if (grade <= 3) return 'Beginner';
    if (grade <= 6) return 'Intermediate';
    return 'Advanced';
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