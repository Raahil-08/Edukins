import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function generateVoice(avatar, text) {
  const speaker = mapAvatarToSpeakerId(avatar);
  const outPath = `/tmp/${uuidv4()}.wav`;

  try {
    // Use the Python Coqui script
    const cmd = `python3 backend/coqui_tts.py ${speaker} "${text.replace(/"/g, '\\"')}" ${outPath}`;
    execSync(cmd, { stdio: 'inherit' });

    // Read audio into a buffer and return
    const audioBuffer = fs.readFileSync(outPath);
    fs.unlinkSync(outPath);
    return audioBuffer;
  } catch (err) {
    console.error('❌ Coqui TTS error:', err.message);
    throw new Error('TTS generation failed.');
  }
}

function mapAvatarToSpeakerId(avatar) {
  const map = {
    Cyberstein: 'p231',
    Debugjit: 'p294',
    Jennerator: 'p326',
    Roboldo: 'p345'
  };
  return map[avatar] || 'p231';
}
