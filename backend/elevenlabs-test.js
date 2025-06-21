import axios from 'axios';

const ELEVEN_API_KEY = 'sk_3eca61838a3bebbf19e0c9e977056f9e8f11d61826e3cfc0'; // Replace with your key
const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Rachel - public voice

const run = async () => {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: "Testing ElevenLabs API key from EDUKINS.",
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    console.log('✅ Success! Received audio with length:', response.data.byteLength, 'bytes');
  } catch (error) {
    console.error('❌ ERROR:', error.response?.status || error.message);
    const msg = Buffer.isBuffer(error.response?.data)
      ? error.response.data.toString()
      : JSON.stringify(error.response?.data, null, 2);
    console.error('📨 Response:', msg);
  }
};

run();
