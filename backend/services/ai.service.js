import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function generateLessonScript({ topic, grade, subject, avatar }) {
  const tone = {
    Cyberstein: "strict and thorough like a German professor",
    Roboldo: "fast and enthusiastic with a Portuguese accent",
    Debugjit: "chill and relatable like a Punjabi uncle",
    Jennerator: "casual and emoji-filled like a cool American teen"
  };

  const prompt = `
You are a tutor named ${avatar} helping a grade ${grade} student learn the topic "${topic}" in ${subject}.
Speak in a ${tone[avatar] || 'friendly'} tone.
Break it into 4–6 short, clear, age-appropriate paragraphs.
Use simple words, relatable analogies, and engaging structure.
`;

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  return response.data.choices[0].message.content.trim();
}
