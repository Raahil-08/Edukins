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

// Generate AI Lesson endpoint
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, grade, topic, avatar } = req.body;

    // Validate input
    if (!subject || !grade || !topic) {
      return res.status(400).json({ 
        message: 'Subject, grade, and topic are required' 
      });
    }

    if (grade < 1 || grade > 12) {
      return res.status(400).json({ 
        message: 'Grade must be between 1 and 12' 
      });
    }

    console.log('🤖 Generating AI lesson:', { subject, grade, topic, avatar });

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Here you would integrate with your actual AI service (OpenAI, Claude, etc.)
    // For now, we'll generate a realistic lesson based on the topic
    const aiGeneratedLesson = await generateAILesson(subject, grade, topic, avatar);

    console.log('✅ AI lesson generated successfully');

    res.json(aiGeneratedLesson);
    
  } catch (error) {
    console.error('❌ AI lesson generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate AI lesson',
      error: error.message 
    });
  }
});

// Get all lessons for user
router.get('/', authenticateToken, (req, res) => {
  try {
    // Return user's lesson history
    const lessons = [
      {
        id: '1',
        topic: 'Solar System',
        subject: 'Science',
        grade: 5,
        createdAt: new Date().toISOString(),
        duration: '12 min'
      }
    ];

    res.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// Get specific lesson by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, fetch from database
    const lesson = {
      id: id,
      topic: 'Sample Lesson',
      subject: 'Science',
      grade: 5,
      script: 'This is a sample lesson content...',
      duration: '10 min',
      createdAt: new Date().toISOString()
    };

    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Failed to fetch lesson' });
  }
});

// AI Lesson Generation Function
async function generateAILesson(subject, grade, topic, avatar) {
  // This is where you'd integrate with your AI service
  // For demonstration, we'll create a realistic lesson structure
  
  const lessonTemplates = {
    Science: {
      intro: `Welcome to our exciting ${subject} lesson about ${topic}! I'm ${avatar}, and I'm thrilled to explore this fascinating topic with you today.`,
      content: generateScienceContent(topic, grade),
    },
    Math: {
      intro: `Hello there! I'm ${avatar}, your math guide for today's adventure into ${topic}. Let's make numbers fun and easy to understand!`,
      content: generateMathContent(topic, grade),
    },
    History: {
      intro: `Greetings, young historian! I'm ${avatar}, and today we're going to travel back in time to learn about ${topic}.`,
      content: generateHistoryContent(topic, grade),
    },
    Geography: {
      intro: `Welcome, explorer! I'm ${avatar}, and today we're going on a journey to discover amazing things about ${topic}.`,
      content: generateGeographyContent(topic, grade),
    },
    English: {
      intro: `Hello, future writer! I'm ${avatar}, and today we're going to explore the wonderful world of ${topic}.`,
      content: generateEnglishContent(topic, grade),
    }
  };

  const template = lessonTemplates[subject] || lessonTemplates.Science;
  const fullScript = `${template.intro}\n\n${template.content}`;
  
  // Calculate realistic metrics
  const wordCount = fullScript.split(' ').length;
  const estimatedDuration = Math.ceil(wordCount / 180); // 180 words per minute for educational content

  return {
    id: `ai_lesson_${Date.now()}`,
    topic: topic,
    subject: subject,
    grade: grade,
    script: fullScript,
    duration: `${estimatedDuration} min`,
    difficulty: grade <= 3 ? 'Beginner' : grade <= 6 ? 'Intermediate' : 'Advanced',
    avatar: avatar || 'Professor Nova',
    wordCount: wordCount,
    keyPoints: extractKeyPoints(fullScript),
    createdAt: new Date().toISOString(),
    isAIGenerated: true
  };
}

// Content generation functions for different subjects
function generateScienceContent(topic, grade) {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('solar') || topicLower.includes('planet') || topicLower.includes('space')) {
    return `Our solar system is an incredible place filled with eight amazing planets, each with its own unique characteristics. Let's start our journey from the Sun, the bright star at the center of our solar system.

The Sun is so massive that it contains 99.8% of all the mass in our solar system! It's like a giant ball of hot gas that gives us light and warmth every day. Without the Sun, there would be no life on Earth.

The first planet closest to the Sun is Mercury. It's the smallest planet and has extreme temperatures - very hot during the day and freezing cold at night. Next comes Venus, often called Earth's twin because it's similar in size, but it's covered in thick, poisonous clouds.

Our home planet Earth is third from the Sun and the only planet we know of that has life. Earth has the perfect conditions - not too hot, not too cold, and plenty of water. Mars, the red planet, comes next. Scientists are very interested in Mars because they think it might have had water long ago.

The outer planets are much larger and are called gas giants. Jupiter is the biggest planet in our solar system - so big that all the other planets could fit inside it! Saturn is famous for its beautiful rings made of ice and rock. Uranus spins on its side like a rolling ball, and Neptune is the windiest planet with storms that can reach 1,200 miles per hour!

Each planet takes a different amount of time to orbit around the Sun. Earth takes one year, but Neptune takes 165 Earth years to complete just one orbit! Isn't that amazing?

Remember, we're all space travelers riding on planet Earth as it zooms through space at 67,000 miles per hour around the Sun!`;
  }
  
  if (topicLower.includes('matter') || topicLower.includes('solid') || topicLower.includes('liquid') || topicLower.includes('gas')) {
    return `Everything around us is made of matter, and matter can exist in three main states: solid, liquid, and gas. Understanding these states helps us make sense of the world around us!

Let's start with solids. Solids have a definite shape and volume. Think about your desk, a rock, or an ice cube. The particles in solids are packed tightly together and vibrate in place, but they don't move around much. That's why solids keep their shape.

Liquids are different! They have a definite volume but take the shape of their container. Water is the most common liquid we see every day. Pour water into a cup, and it becomes cup-shaped. Pour it into a bowl, and it becomes bowl-shaped! The particles in liquids are close together but can slide past each other.

Gases are the most spread out. They don't have a definite shape or volume - they expand to fill whatever container they're in. The air you breathe is made of gases. Gas particles move around freely and quickly, bouncing off each other and the walls of their container.

Here's the exciting part: the same substance can be all three states! Water is a perfect example. When it's cold enough, water becomes ice (solid). At room temperature, it's liquid water. When heated enough, it becomes water vapor (gas).

This changing between states happens because of temperature. When we heat something up, the particles move faster and spread out more. When we cool something down, the particles slow down and get closer together.

You can see this in action when you watch ice melt in a warm room, or when you see steam rising from hot soup. Matter is constantly changing states all around us!`;
  }
  
  // Default science content
  return `Science is all about understanding the amazing world around us through observation, questions, and experiments. Today we're exploring ${topic}, which is a fascinating part of our natural world.

Scientists are like detectives - they ask questions, make observations, and look for patterns to understand how things work. When studying ${topic}, we use the scientific method to learn new things.

The scientific method starts with asking a question about something we observe. Then we make a hypothesis, which is our best guess about the answer. Next, we design an experiment to test our hypothesis. We collect data, analyze what we found, and draw conclusions.

What makes ${topic} so interesting is how it connects to many other areas of science. Everything in nature is connected, and understanding one thing helps us understand many others.

One of the most important things about science is that it's always changing as we learn new things. Scientists around the world are constantly making new discoveries about ${topic} and sharing their findings with others.

The best part about science is that you can be a scientist too! By asking questions, making observations, and thinking critically about the world around you, you're doing exactly what professional scientists do.

Remember, every great scientific discovery started with someone being curious about something they observed. Your curiosity about ${topic} is the first step in your own scientific journey!`;
}

function generateMathContent(topic, grade) {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('fraction')) {
    return `Fractions are everywhere in our daily lives! When you eat half a pizza, share a candy bar with a friend, or measure ingredients for baking, you're using fractions.

A fraction represents a part of a whole. It has two parts: the numerator (top number) and the denominator (bottom number). The denominator tells us how many equal parts the whole is divided into, and the numerator tells us how many of those parts we're talking about.

Let's imagine a delicious chocolate bar divided into 8 equal pieces. If you eat 3 pieces, you've eaten 3/8 of the chocolate bar. The 8 tells us the bar was divided into 8 pieces, and the 3 tells us you ate 3 of those pieces.

Equivalent fractions are fractions that represent the same amount but look different. For example, 1/2 is the same as 2/4 or 4/8. Think of it like this: half a pizza is the same whether you cut the pizza into 2 big pieces or 4 smaller pieces!

Adding fractions with the same denominator is easy - just add the numerators! If you have 2/8 of a pizza and your friend gives you 3/8 more, you now have 5/8 of a pizza.

When fractions have different denominators, we need to find a common denominator first. It's like making sure we're talking about the same-sized pieces before we can add them together.

Fractions help us be more precise in our measurements and help us share things fairly. They're an essential tool for cooking, building, and solving many real-world problems!`;
  }
  
  // Default math content
  return `Mathematics is the language of patterns, numbers, and logical thinking. Today we're exploring ${topic}, which is an important building block in your mathematical journey.

Math is all around us! From counting the steps you take to school, to figuring out how much time you have before bedtime, to sharing snacks equally with friends - we use math constantly without even thinking about it.

When we study ${topic}, we're learning tools that help us solve problems and understand the world better. Math teaches us to think logically, break down complex problems into smaller parts, and find creative solutions.

One of the beautiful things about math is that it follows patterns and rules. Once you understand these patterns, you can use them to solve many different types of problems. It's like having a superpower for problem-solving!

Practice is key in mathematics. Just like learning to ride a bike or play a musical instrument, the more you practice math concepts, the more natural they become. Don't worry if something seems difficult at first - every mathematician started as a beginner!

Remember, making mistakes is part of learning math. Each mistake teaches us something new and helps us understand the concept better. The most important thing is to keep trying and asking questions when you need help.

Math connects to many other subjects too. Scientists use math to understand nature, artists use math to create beautiful designs, and engineers use math to build amazing structures. Your math skills will help you in many areas of life!`;
}

function generateHistoryContent(topic, grade) {
  return `History is the story of people who lived before us and the amazing things they did. When we study ${topic}, we're learning about real people who faced challenges, made discoveries, and shaped the world we live in today.

Think of history like a giant puzzle. Each event, each person, and each discovery is a piece that helps us understand the bigger picture of how our world came to be. The people in history were just like us - they had hopes, dreams, fears, and problems to solve.

What makes ${topic} so fascinating is how it shows us that people throughout history have been incredibly creative and resourceful. They invented tools, built amazing structures, created art, and developed ideas that we still use today.

By studying history, we learn that change happens gradually over time. The world didn't become the way it is overnight - it took thousands of years and millions of people making small and big changes.

History also teaches us about cause and effect. Events in history happened for reasons, and they led to other events. Understanding these connections helps us make sense of why things are the way they are today.

One of the most important lessons from history is that ordinary people can do extraordinary things. Many of the people we study in history started out as regular individuals who decided to make a difference in their communities and the world.

When we learn about ${topic}, we're not just memorizing dates and names - we're learning about human creativity, courage, and the power of working together to solve problems and build better communities.`;
}

function generateGeographyContent(topic, grade) {
  return `Geography is the study of our amazing planet Earth and all the incredible places on it. When we explore ${topic}, we're learning about the physical features of our world and how people live in different environments.

Our Earth is incredibly diverse! From towering mountains to vast oceans, from hot deserts to frozen tundras, our planet has many different landscapes and climates. Each of these environments is home to unique plants, animals, and people who have adapted to live there.

What makes geography exciting is understanding how the physical world affects how people live. People who live near the ocean might be fishermen, while people who live in fertile valleys might be farmers. The geography of a place influences the food people eat, the houses they build, and the jobs they do.

Climate and weather are important parts of geography. Different parts of the world have different weather patterns throughout the year. Some places are hot and dry, others are cold and snowy, and some have rainy and dry seasons.

Geography also helps us understand how people are connected around the world. Rivers and oceans can be highways for trade and travel. Mountains can be barriers that separate communities, or they can be sources of fresh water and minerals.

Maps are the geographer's most important tool. They help us understand where places are located, how far apart they are, and what the land looks like. Learning to read maps is like learning a special language that helps us navigate our world.

Understanding ${topic} helps us appreciate the incredible diversity of our planet and the creative ways people have learned to live in different environments. It also helps us understand how we're all connected as part of one global community.`;
}

function generateEnglishContent(topic, grade) {
  return `Language is one of humanity's greatest inventions! It allows us to share our thoughts, feelings, stories, and ideas with others. Today we're exploring ${topic}, which is an important part of how we communicate and express ourselves.

Reading and writing are like superpowers that let us travel to different worlds, learn from people who lived long ago, and share our own ideas with others. Every time you read a book, you're having a conversation with the author, even if they lived hundreds of years ago!

When we study ${topic}, we're learning the tools that help us become better communicators. Good communication helps us make friends, solve problems, work together, and share what we know with others.

Stories are everywhere in our lives. We tell stories about what happened at school, we read stories in books, and we watch stories in movies. Stories help us understand ourselves and others better. They teach us about different ways of living and thinking.

Writing is a way to capture our thoughts and preserve them. When you write, you're creating something that can be read by others now and in the future. Your words have the power to inform, entertain, persuade, and inspire others.

Reading makes us better writers, and writing makes us better readers. The more we read, the more we learn about how language works and how to express our ideas clearly. The more we write, the better we become at understanding what authors are trying to tell us.

Language is always growing and changing. New words are invented, old words take on new meanings, and different communities develop their own ways of speaking. This makes language a living, breathing part of human culture.

Remember, everyone has important stories to tell and ideas to share. ${topic} gives you the tools to express yourself clearly and understand others better.`;
}

function extractKeyPoints(script) {
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyPoints = [];
  
  // Look for sentences that contain key educational concepts
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 30 && trimmed.length < 150) {
      if (trimmed.match(/^(The|This|When|Scientists|Remember|Understanding|One of)/i) ||
          trimmed.includes('important') || trimmed.includes('helps us') || 
          trimmed.includes('teaches us') || trimmed.includes('shows us')) {
        keyPoints.push(trimmed);
        if (keyPoints.length >= 5) break;
      }
    }
  }
  
  return keyPoints.slice(0, 5);
}

module.exports = router;