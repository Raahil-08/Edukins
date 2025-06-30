const { execSync } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Generate TTS audio using Coqui TTS Python script.
 * @param {string} avatar - The avatar ID (Cyberstein, Debugjit, Jennerator, Roboldo).
 * @param {string} text - The lesson text to speak.
 * @returns {Promise<Buffer>} - Buffer with generated audio.
 */
async function generateVoice(avatar, text) {
  const speaker = mapAvatarToSpeakerId(avatar);
  const outPath = `/tmp/${uuidv4()}.wav`;

  try {
    console.log(`🎤 Generating audio with Coqui TTS: speaker=${speaker}`);

    const escapedText = text.replace(/"/g, '\\"');
    const cmd = `python3 backend/coqui_tts.py ${speaker} "${escapedText}" ${outPath}`;
    execSync(cmd, { stdio: 'inherit' });

    const audioBuffer = fs.readFileSync(outPath);
    fs.unlinkSync(outPath);

    return audioBuffer;
  } catch (err) {
    console.error('❌ Coqui TTS generation error:', err.message);
    throw new Error('TTS generation failed.');
  }
}

/**
 * Map avatar IDs to Coqui VCTK speaker IDs.
 */
function mapAvatarToSpeakerId(avatar) {
  const map = {
    Cyberstein: 'p231',
    Roboldo: 'p345',
    Debugjit: 'p294',
    Jennerator: 'p326',
  };
  return map[avatar] || 'p231'; // fallback to p231
}

module.exports = { generateVoice };
