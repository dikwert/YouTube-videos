// Shared ElevenLabs helpers. The API key is never read or written here: the network proxy injects the saved credential.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'voice', 'voices.json'), 'utf8'));
export const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tts-'));

/** Speech for an explicit voice id, with a few retries on transient errors. */
export const synthWith = (voiceId, text, outFile, settings, model = CONFIG.model) => {
  const body = path.join(TMP, `${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(body, JSON.stringify({text, model_id: model, voice_settings: settings}));
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${CONFIG.format}`;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      execFileSync('curl', ['-sS', '-f', '--max-time', '120', '-X', 'POST', url, '-H', 'Content-Type: application/json', '-H', 'Accept: audio/mpeg', '--data-binary', `@${body}`, '-o', outFile]);
      fs.rmSync(body, {force: true});
      return outFile;
    } catch (err) {
      lastErr = err;
      if (attempt < 3) execFileSync('sleep', ['2']);
    }
  }
  fs.rmSync(body, {force: true});
  throw lastErr;
};

export const FILTERS = {
  none: null,
  // Natural narrator and characters: light compression, warmth below 200 Hz, a faint room slap, loudness normalised.
  room: 'acompressor=threshold=-20dB:ratio=3:attack=10:release=120:makeup=2,equalizer=f=150:t=q:w=1:g=3,aecho=0.8:0.88:40:0.12',
  // Radio navigator: narrow band, light compression, faint hiss.
  radio: 'highpass=f=350,lowpass=f=3200,acompressor=threshold=-18dB:ratio=4',
  // Recorded video: soft band, slight crunch.
  tape: 'highpass=f=180,lowpass=f=4000,acrusher=bits=10:mix=0.25',
  // Voice from the dark corridor: short echoes, dull top end.
  echo: 'aecho=0.8:0.55:60|120:0.35|0.22,lowpass=f=2600',
};
const NOISE = {radio: 0.010, tape: 0.007};

/** Applies a named filter to a clip. Writes outFile (mp3). */
export const applyFilter = (inFile, outFile, filter) => {
  const chain = FILTERS[filter];
  if (!chain) {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', inFile, '-codec:a', 'libmp3lame', '-b:a', '160k', outFile]);
    return outFile;
  }
  const noise = NOISE[filter];
  const args = ['-y', '-loglevel', 'error', '-i', inFile];
  if (noise) {
    args.push('-f', 'lavfi', '-i', `anoisesrc=color=pink:amplitude=${noise}`);
    args.push('-filter_complex', `[0:a]${chain}[a];[1:a]highpass=f=600[n];[a][n]amix=inputs=2:duration=first:dropout_transition=0[out]`, '-map', '[out]');
  } else {
    args.push('-af', chain);
  }
  args.push('-codec:a', 'libmp3lame', '-b:a', '160k', outFile);
  execFileSync('ffmpeg', args);
  return outFile;
};

export const durationOf = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
