const router = require('express').Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Dynamic complexity prompt generator
const getComplexityPrompt = (grade) => {
  if (grade <= 3) {
    return `Make it very simple, suitable for young kids in grade ${grade}, with basic examples and short sentences.`;
  } else if (grade <= 6) {
    return `Make it moderately detailed, suitable for grade ${grade}, with clear explanations and relatable examples.`;
  } else if (grade <= 8) {
    return `Make it thorough, suitable for grade ${grade}, including detailed explanations, examples, and relevant concepts.`;
  } else {
    return `Make it advanced, comprehensive, and suitable for grade ${grade}, including deep explanations, real-world applications, and challenging ideas.`;
  }
};

router.post('/', async (req, res) => {
  try {
    const { topic, grade, avatar } = req.body;

    console.log(`📝 Generating lesson for topic: "${topic}", grade: ${grade}, avatar: ${avatar}`);

    const complexityPrompt = getComplexityPrompt(grade);

    const prompt = `
Create a clear, engaging lesson for a Grade ${grade} student about "${topic}".
${complexityPrompt}
Use age-appropriate language in 4–6 paragraphs.
End with a short summary.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const script = completion.choices[0].message.content;

    const lesson = {
      id: `lesson_${Date.now()}`,
      topic,
      grade,
      script,
      avatar,
      generatedAt: new Date().toISOString(),
      wordCount: script.split(/\s+/).length,
    };

    res.status(201).json(lesson);
  } catch (err) {
    console.error('❌ OpenAI generation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate AI lesson' });
  }
});

module.exports = router;
