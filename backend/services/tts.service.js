import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Generate voice audio using macOS `say` command.
 * Customizes the voice based on avatar (optional).
 */
export async function generateVoice(avatar, text) {
  try {
    return await macosTTS(avatar, text);
  } catch (err) {
    console.error('❌ macOS TTS failed:', err.message);
    throw new Error('TTS generation failed.');
  }
}

async function macosTTS(avatar, text) {
  const timestamp = Date.now();
  const filePath = `/tmp/tts-${timestamp}.aiff`;

  // Map avatar to macOS voice
  const avatarVoices = {
    Cyberstein: 'Fred',
    Roboldo: 'Daniel',
    Debugjit: 'Samantha',
    Jennerator: 'Alex',
  };

  const voice = avatarVoices[avatar] || 'Samantha';

  // Generate AIFF audio using macOS TTS (no data-format flag)
  const cmd = `say -v "${voice}" -o "${filePath}" "${text.replace(/"/g, '\\"')}"`;
  execSync(cmd);

  // Read the audio file into a buffer
  const buffer = fs.readFileSync(filePath);
  fs.unlinkSync(filePath); // Clean up temp file
  return buffer;
}
