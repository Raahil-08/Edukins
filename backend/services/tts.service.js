import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// 🔊 Avatar-to-voice mapping using ElevenLabs public voices
const avatarVoices = {
  Cyberstein: 'EXAVITQu4vr4xnSDxMaL', // robotic & strict (Rachel)
  Roboldo: 'ErXwobaYiN019PkySvjV',    // energetic Portuguese (Antoni)
  Debugjit: 'MF3mGyEYCl7XYWbV9V6O',   // chill Punjabi uncle (Arnold)
  Jennerator: 'TxGEqnHWrfWFTfGW9XjX'  // casual American teen (Elli)
};

// 🗣️ Generate TTS audio from text
export const generateVoice = async (avatar, text) => {
  const voiceId = avatarVoices[avatar] || avatarVoices.Cyberstein;

  if (text.length > 500) text = text.slice(0, 300);

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVEN_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return response.data; // 🎧 MP3 audio buffer
  } catch (error) {
    console.error('❌ TTS error:', error.response?.status || error.message);

    const msg = Buffer.isBuffer(error.response?.data)
      ? error.response.data.toString()
      : JSON.stringify(error.response?.data, null, 2);

    console.error('📨 Response:', msg);
    throw new Error('TTS generation failed');
  }
};
