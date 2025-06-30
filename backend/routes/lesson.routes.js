const router = require('express').Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  try {
    const { topic, grade, avatar } = req.body;

    console.log(`📝 Generating lesson for topic: "${topic}", grade: ${grade}, avatar: ${avatar}`);

    const prompt = `
Create a clear, engaging lesson for a Grade ${grade} student about "${topic}".
Use simple, age-appropriate language in 4–6 paragraphs. Avoid complex jargon.
End with a short summary.
`;


    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    const script = completion.choices[0].message.content;

    const lesson = {
      id: `lesson_${Date.now()}`,
      topic,
      grade,
      script,
      avatar,
      generatedAt: new Date().toISOString(),
      wordCount: script.split(' ').length,
    };

    res.status(201).json(lesson);
  } catch (err) {
    console.error('❌ OpenAI generation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate AI lesson' });
  }
});

module.exports = router;
