const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️  OpenAI API key not found. AI lesson generation will use fallback content.');
    }
  }

  async generateLesson(subject, grade, topic, avatar = 'Professor Nova') {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      console.log(`🤖 Generating AI lesson with OpenAI for: ${topic} (Grade ${grade})`);

      const prompt = this.createLessonPrompt(subject, grade, topic, avatar);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4o-mini', // Using the more cost-effective model
          messages: [
            {
              role: 'system',
              content: `You are ${avatar}, an expert educational AI teacher specializing in creating engaging, age-appropriate lessons for elementary and middle school students. You create comprehensive, educational content that is both informative and engaging.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const aiContent = response.data.choices[0].message.content;
      
      console.log('✅ OpenAI lesson generated successfully');
      
      return this.formatLessonResponse(aiContent, subject, grade, topic, avatar);
      
    } catch (error) {
      console.error('❌ OpenAI API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      }
      if (error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      }
      if (error.response?.status === 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
      }
      
      throw new Error(`AI lesson generation failed: ${error.message}`);
    }
  }

  createLessonPrompt(subject, grade, topic, avatar) {
    const gradeLevel = this.getGradeLevelDescription(grade);
    const subjectContext = this.getSubjectContext(subject);
    
    return `Create an engaging, comprehensive educational lesson about "${topic}" for ${gradeLevel} students in ${subject}.

REQUIREMENTS:
- Write as ${avatar}, an enthusiastic and knowledgeable teacher
- Use age-appropriate language for Grade ${grade} students
- Include real facts and educational content
- Make it engaging with examples and analogies
- Structure: Introduction, main content (3-4 key concepts), and conclusion
- Length: 800-1200 words
- Include interesting facts and real-world connections
- Use encouraging and positive tone

SUBJECT CONTEXT: ${subjectContext}

LESSON STRUCTURE:
1. Engaging introduction that hooks the student's interest
2. 3-4 main learning concepts with clear explanations
3. Real-world examples and applications
4. Fun facts or interesting details
5. Encouraging conclusion that reinforces learning

Please write a complete lesson that would take about 8-12 minutes to read aloud. Make it educational, accurate, and engaging for a Grade ${grade} student.`;
  }

  getGradeLevelDescription(grade) {
    if (grade <= 2) return 'early elementary (Grades K-2)';
    if (grade <= 5) return 'elementary (Grades 3-5)';
    if (grade <= 8) return 'middle school (Grades 6-8)';
    return 'high school (Grades 9-12)';
  }

  getSubjectContext(subject) {
    const contexts = {
      'Science': 'Focus on scientific concepts, natural phenomena, and how things work in nature. Include scientific vocabulary appropriate for the grade level.',
      'Math': 'Focus on mathematical concepts, problem-solving, and real-world applications of math. Use concrete examples and visual analogies.',
      'History': 'Focus on historical events, people, and their impact. Make connections to modern day and help students understand cause and effect.',
      'Geography': 'Focus on places, physical features, cultures, and how geography affects human life. Include maps and spatial thinking.',
      'English': 'Focus on language arts, reading comprehension, writing skills, and literature. Include vocabulary development and communication skills.',
      'Art': 'Focus on artistic techniques, famous artists, art history, and creative expression. Include visual elements and design principles.'
    };
    
    return contexts[subject] || contexts['Science'];
  }

  formatLessonResponse(aiContent, subject, grade, topic, avatar) {
    // Extract key points from the AI-generated content
    const keyPoints = this.extractKeyPoints(aiContent);
    
    // Calculate metrics
    const wordCount = aiContent.split(' ').length;
    const estimatedDuration = Math.ceil(wordCount / 180); // 180 words per minute for educational content
    
    return {
      id: `ai_lesson_${Date.now()}`,
      topic: topic,
      subject: subject,
      grade: grade,
      script: aiContent,
      duration: `${estimatedDuration} min`,
      difficulty: grade <= 3 ? 'Beginner' : grade <= 6 ? 'Intermediate' : 'Advanced',
      avatar: avatar,
      wordCount: wordCount,
      keyPoints: keyPoints,
      createdAt: new Date().toISOString(),
      isAIGenerated: true,
      aiModel: 'gpt-4o-mini'
    };
  }

  extractKeyPoints(content) {
    // Enhanced key point extraction from AI-generated content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = [];
    
    // Look for sentences that contain key educational concepts
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 200) {
        // Look for sentences that start with key phrases or contain important information
        if (trimmed.match(/^(The key|Important|Remember|This means|Scientists|Researchers|Studies show|One important|The main)/i) ||
            trimmed.includes('is important') || trimmed.includes('helps us understand') || 
            trimmed.includes('teaches us') || trimmed.includes('shows us that') ||
            trimmed.includes('demonstrates') || trimmed.includes('reveals') ||
            trimmed.includes('discovered') || trimmed.includes('found that')) {
          keyPoints.push(trimmed);
          if (keyPoints.length >= 6) break;
        }
      }
    }
    
    // If we don't have enough key points, look for sentences with educational keywords
    if (keyPoints.length < 3) {
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length > 40 && trimmed.length < 180) {
          if (trimmed.includes('because') || trimmed.includes('therefore') || 
              trimmed.includes('as a result') || trimmed.includes('this is why') ||
              trimmed.includes('for example') || trimmed.includes('such as')) {
            keyPoints.push(trimmed);
            if (keyPoints.length >= 5) break;
          }
        }
      }
    }
    
    return keyPoints.slice(0, 6);
  }
}

module.exports = new OpenAIService();