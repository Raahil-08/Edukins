const router = require('express').Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// 🧠 Create AI Lesson (OpenAI) - Main endpoint matching your HTTP test
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, grade, topic, avatar } = req.body;

    console.log('🚀 Received lesson generation request:', { subject, grade, topic, avatar });

    // Validate input
    if (!topic || !grade) {
      return res.status(400).json({ 
        message: 'Topic and grade are required' 
      });
    }

    if (grade < 1 || grade > 12) {
      return res.status(400).json({ 
        message: 'Grade must be between 1 and 12' 
      });
    }

    // Simulate AI lesson generation delay
    console.log('🤖 Generating AI lesson...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate lesson content based on topic and grade
    const generatedLesson = generateLessonContent(topic, grade, subject, avatar);

    console.log('✅ Lesson generated successfully:', generatedLesson.id);

    res.json({
      message: 'Lesson generated successfully',
      ...generatedLesson
    });
  } catch (error) {
    console.error('❌ Lesson generation error:', error);
    res.status(500).json({ message: 'Failed to generate lesson' });
  }
});

// Legacy endpoint for backward compatibility
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { topic, grade } = req.body;

    // Validate input
    if (!topic || !grade) {
      return res.status(400).json({ 
        message: 'Topic and grade are required' 
      });
    }

    if (grade < 1 || grade > 12) {
      return res.status(400).json({ 
        message: 'Grade must be between 1 and 12' 
      });
    }

    // Simulate AI lesson generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate lesson content based on topic and grade
    const generatedLesson = generateLessonContent(topic, grade);

    res.json({
      message: 'Lesson generated successfully',
      ...generatedLesson
    });
  } catch (error) {
    console.error('Lesson generation error:', error);
    res.status(500).json({ message: 'Failed to generate lesson' });
  }
});

// Get all lessons for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    // Return mock lessons for demo
    const mockLessons = [
      {
        id: '1',
        subject: 'Science',
        grade: 5,
        topic: 'The Solar System',
        avatar: 'Professor Nova',
        duration: '15 min',
        difficulty: 'Intermediate'
      },
      {
        id: '2',
        subject: 'Math',
        grade: 4,
        topic: 'Fractions and Decimals',
        avatar: 'Math Wizard',
        duration: '12 min',
        difficulty: 'Beginner'
      }
    ];

    res.json(mockLessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// Get specific lesson by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Return mock lesson for demo
    const mockLesson = {
      id: id,
      subject: 'Science',
      grade: 5,
      topic: 'The Solar System',
      avatar: 'Professor Nova',
      script: 'Welcome to our exciting journey through the Solar System...',
      duration: '15 min',
      difficulty: 'Intermediate'
    };

    res.json(mockLesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Failed to fetch lesson' });
  }
});

// Get lesson audio
router.get('/:id/audio', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Return mock audio response
    res.status(200).json({ 
      message: 'Audio endpoint - would return audio file in production',
      lessonId: id,
      audioUrl: `http://localhost:5050/api/lesson/${id}/audio/file`
    });
  } catch (error) {
    console.error('Error fetching lesson audio:', error);
    res.status(500).json({ message: 'Failed to fetch lesson audio' });
  }
});

// Helper function to generate lesson content
function generateLessonContent(topic, grade, subject = 'Science', avatar = 'Professor Nova') {
  console.log('📝 Generating content for:', { topic, grade, subject, avatar });

  const lessonTemplates = {
    elementary: {
      template: `Welcome to our exciting lesson about {topic}! I'm {avatar}, and today we'll explore this fascinating subject in a way that's perfect for Grade {grade} students.

{topic} is an important topic that helps us understand the world around us. Let's start by learning the basics and then discover some amazing facts!

What is {topic}?
{topic} is something we can find all around us. When we study {topic}, we learn about how things work and why they are important in our daily lives.

Fun Facts about {topic}:
- {topic} plays a special role in our world
- There are many examples of {topic} that you see every day
- Scientists love studying {topic} because there's always something new to discover
- Understanding {topic} helps us become smarter and more curious

Let's explore some examples of {topic} that you might see at home, at school, or outside. You've probably noticed {topic} without even knowing it! This makes learning about {topic} both fun and useful.

As we learn more about {topic}, remember that every question you ask helps you understand better. The more curious you are about {topic}, the more exciting it becomes!

{topic} connects to many other things you're learning in school. This shows us how everything in learning works together, just like pieces of a puzzle.

Keep exploring and asking questions about {topic} - that's how great learners discover amazing things!`,
      keyPoints: [
        `What {topic} means and why it's important`,
        `Fun facts and examples of {topic}`,
        `How {topic} appears in everyday life`,
        `Ways to explore {topic} further`,
        `Connections between {topic} and other subjects`
      ]
    },
    intermediate: {
      template: `Welcome to our comprehensive lesson about {topic}! I'm {avatar}, and today we'll dive deep into this fascinating subject, exploring concepts that are perfect for Grade {grade} students.

{topic} is a crucial area of study that helps us understand complex systems and relationships in our world. Let's begin by examining the fundamental principles and then explore more advanced concepts.

Understanding {topic}:
{topic} involves multiple interconnected concepts that work together to create fascinating phenomena. When we study {topic}, we're exploring fundamental principles that govern how things work in our universe.

Key Concepts in {topic}:
- The basic principles that define {topic}
- How different elements of {topic} interact with each other
- The role {topic} plays in larger systems
- Real-world applications and examples
- Current research and discoveries in {topic}

Let's examine some detailed examples of {topic} that demonstrate these principles in action. You'll discover that {topic} is not just theoretical - it has practical applications that affect our daily lives in surprising ways.

The study of {topic} requires us to think critically and analytically. We need to observe patterns, make connections, and understand cause-and-effect relationships. This type of thinking is valuable not just for understanding {topic}, but for all areas of learning.

As we explore {topic} further, we'll see how it connects to other subjects like mathematics, science, history, and even art. This interdisciplinary approach helps us develop a more complete understanding of how knowledge works together.

Scientists and researchers continue to make new discoveries about {topic}. This means that our understanding is always growing and evolving. What we learn today builds on the work of countless researchers who came before us.

Remember, mastering {topic} takes time and practice. Don't be discouraged if some concepts seem challenging at first - that's a normal part of learning something new and important.`,
      keyPoints: [
        `Fundamental principles of {topic}`,
        `How different aspects of {topic} work together`,
        `Real-world applications and examples`,
        `Critical thinking skills related to {topic}`,
        `Connections to other academic subjects`,
        `Current research and future discoveries`
      ]
    },
    advanced: {
      template: `Welcome to our advanced exploration of {topic}! I'm {avatar}, and in this comprehensive lesson designed for Grade {grade} students, we'll examine the sophisticated concepts and complex relationships that define this important field of study.

{topic} represents a complex and multifaceted area of knowledge that requires analytical thinking, critical evaluation, and the ability to synthesize information from multiple sources. Our investigation will cover both theoretical foundations and practical applications.

Theoretical Framework of {topic}:
The study of {topic} is built upon a foundation of interconnected theories and principles that have been developed and refined over time. These theoretical frameworks help us understand not just what happens, but why it happens and how we can predict future outcomes.

Advanced Concepts in {topic}:
- Complex systems and their emergent properties
- Cause-and-effect relationships and feedback loops
- Quantitative analysis and data interpretation
- Historical development and evolution of understanding
- Contemporary research methodologies and findings
- Ethical considerations and societal implications

Analytical Approaches to {topic}:
When studying {topic} at an advanced level, we must employ sophisticated analytical tools and methodologies. This includes statistical analysis, comparative studies, experimental design, and critical evaluation of evidence.

The interdisciplinary nature of {topic} requires us to draw upon knowledge from multiple fields. This synthesis of different perspectives provides a more complete and nuanced understanding of complex phenomena.

Current research in {topic} is pushing the boundaries of our knowledge and opening up new possibilities for application and understanding. Researchers are using cutting-edge technologies and innovative methodologies to explore questions that were previously impossible to investigate.

As future leaders and thinkers, your understanding of {topic} will be crucial for addressing the complex challenges facing our world. The analytical skills, critical thinking abilities, and deep knowledge you develop through studying {topic} will serve you well in whatever field you choose to pursue.

The journey of learning about {topic} is ongoing. Even experts in the field continue to learn and discover new aspects of this fascinating subject. Embrace the complexity and challenge - it's through grappling with difficult concepts that we develop our intellectual capabilities.`,
      keyPoints: [
        `Theoretical frameworks and foundational principles`,
        `Advanced analytical methods and approaches`,
        `Interdisciplinary connections and applications`,
        `Current research trends and methodologies`,
        `Ethical implications and societal impact`,
        `Critical thinking and problem-solving skills`,
        `Future directions and emerging questions`
      ]
    }
  };

  // Select template based on grade level
  let template;
  if (grade <= 3) {
    template = lessonTemplates.elementary;
  } else if (grade <= 6) {
    template = lessonTemplates.intermediate;
  } else {
    template = lessonTemplates.advanced;
  }

  // Replace placeholders with actual topic, grade, and avatar
  const content = template.template
    .replace(/{topic}/g, topic)
    .replace(/{grade}/g, grade.toString())
    .replace(/{avatar}/g, avatar);

  const keyPoints = template.keyPoints.map(point => 
    point.replace(/{topic}/g, topic)
  );

  // Estimate duration based on content length (average reading speed: 200 words per minute)
  const wordCount = content.split(' ').length;
  const estimatedMinutes = Math.ceil(wordCount / 200);

  // Determine difficulty based on grade
  let difficulty;
  if (grade <= 3) {
    difficulty = 'Beginner';
  } else if (grade <= 6) {
    difficulty = 'Intermediate';
  } else {
    difficulty = 'Advanced';
  }

  const lesson = {
    id: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    topic: topic,
    grade: grade,
    subject: subject,
    avatar: avatar,
    script: content, // Use 'script' to match your expected format
    content: content, // Also provide 'content' for compatibility
    keyPoints: keyPoints,
    duration: `${estimatedMinutes} min`,
    estimatedDuration: `${estimatedMinutes} min`,
    difficulty: difficulty,
    generatedAt: new Date().toISOString(),
    wordCount: wordCount
  };

  console.log('✅ Generated lesson:', {
    id: lesson.id,
    topic: lesson.topic,
    wordCount: lesson.wordCount,
    duration: lesson.duration
  });

  return lesson;
}

module.exports = router;