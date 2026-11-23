// Generates the sound design procedurally so the project renders without any audio files:
//   public/sfx/<name>.wav   sound effects (only written when missing, so your own files win)
//   public/music.mp3        one 40 s background bed shared by all five parts (only when missing)
//   src/assets.generated.ts which optional files exist (voiceover1-5.mp3, music.mp3)
// Run with: npm run audio
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SR = 44100;
const SFX_DIR = path.join(ROOT, 'public', 'sfx');
const PUBLIC = path.join(ROOT, 'public');

const rngFactory = (seed) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000000) / 1000000;
  };
};

const writeWav = (file, samples) => {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  let peak = 0.0001;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  const g = Math.min(1, 0.9 / peak);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i] * g));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
};

/** Render a sound of `dur` seconds from fn(t, i, rand) -> sample, with a short fade in/out. */
const synth = (dur, fn, seed = 1) => {
  const rand = rngFactory(seed * 9973);
  const n = Math.floor(dur * SR);
  const out = new Float64Array(n);
  const fin = 0.004 * SR;
  const fout = 0.03 * SR;
  for (let i = 0; i < n; i++) {
    let v = fn(i / SR, i, rand);
    if (i < fin) v *= i / fin;
    if (i > n - fout) v *= (n - i) / fout;
    out[i] = v;
  }
  return out;
};

const TAU = Math.PI * 2;

const SOUNDS = {
  chime: [1.3, (t) => 0.5 * Math.sin(TAU * 880 * t) * Math.exp(-3.5 * t) + 0.3 * Math.sin(TAU * 1320 * t) * Math.exp(-4.5 * t) + 0.18 * Math.sin(TAU * 1760 * t) * Math.exp(-6 * t)],
  beep: [0.28, (t) => (Math.sin(TAU * 1200 * t) >= 0 ? 0.35 : -0.35) * (t < 0.2 ? 1 : 0.2)],
  glitch: [0.6, (t, i, r) => (Math.floor(r() * 8) / 8 - 0.5) * 0.9 * Math.exp(-6 * t) + 0.3 * Math.sin(TAU * (2400 - 3000 * t) * t) * Math.exp(-5 * t)],
  branches: [0.9, (t, i, r) => (r() * 2 - 1) * (0.25 + 0.75 * Math.abs(Math.sin(TAU * 7 * t))) * Math.exp(-2.5 * t) + (r() < 0.004 ? 0.8 : 0)],
  drip: [0.7, (t) => Math.sin(TAU * (1800 * Math.exp(-5 * t) + 400) * t) * Math.exp(-8 * t)],
  step: [0.4, (t, i, r) => 0.7 * Math.sin(TAU * 90 * t) * Math.exp(-18 * t) + 0.3 * (r() * 2 - 1) * Math.exp(-30 * t)],
  rust: [1.4, (t, i, r) => (r() * 2 - 1) * (r() < 0.05 ? 1 : 0.1) * Math.exp(-1.2 * t) * 0.7 + (r() < 0.002 ? 0.6 : 0)],
  static: [1.1, (t, i, r) => (r() * 2 - 1) * (0.6 + 0.4 * Math.sin(TAU * 13 * t))],
  rumble: [3.2, (t, i, r) => {
    const env = Math.min(1, t / 0.6) * Math.min(1, (3.2 - t) / 0.8);
    return env * (0.6 * Math.sin(TAU * (40 + 6 * Math.sin(TAU * 0.3 * t)) * t) + 0.2 * (r() * 2 - 1) * 0.5);
  }],
  vines: [1.0, (t, i, r) => {
    const env = Math.sin(Math.PI * Math.min(1, t / 0.9));
    return (r() * 2 - 1) * env * 0.5 + (t > 0.42 && t < 0.5 ? (r() * 2 - 1) * 0.9 : 0);
  }],
  smash: [1.0, (t, i, r) => (r() * 2 - 1) * Math.exp(-6 * t) * 0.9 + 0.6 * Math.sin(TAU * 120 * t) * Math.exp(-10 * t) + (r() < 0.01 ? 0.5 : 0)],
  shriek: [1.8, (t) => {
    const f = 900 + 1500 * Math.min(1, t / 1.2) + 60 * Math.sin(TAU * 9 * t);
    return 0.35 * Math.sin(TAU * f * t) * (1 - Math.max(0, (t - 1.4) * 2)) + 0.12 * Math.sin(TAU * 2 * f * t);
  }],
  boom: [2.8, (t, i, r) => 0.9 * Math.sin(TAU * (25 + 70 * Math.exp(-1.4 * t)) * t) * Math.exp(-1.2 * t) + 0.15 * (r() * 2 - 1) * Math.exp(-2 * t)],
  engine: [3.2, (t, i, r) => {
    const env = Math.min(1, t / 0.2) * Math.min(1, (3.2 - t) / 0.2);
    const wob = 0.8 + 0.2 * Math.sin(TAU * 6 * t);
    return env * wob * (0.45 * Math.sin(TAU * 42 * t) + 0.25 * Math.sin(TAU * 84 * t) + 0.12 * Math.sin(TAU * 126 * t) + 0.05 * (r() * 2 - 1));
  }],
  sputter: [1.6, (t, i, r) => {
    const gate = Math.sin(TAU * (4 + 10 * t) * t) > -0.3 - 0.7 * t ? 1 : 0.05;
    return (1 - t / 1.6) * gate * (0.45 * Math.sin(TAU * 42 * t) + 0.2 * (r() * 2 - 1));
  }],
  truck: [4.0, (t, i, r) => {
    const env = Math.min(1, t / 0.5) * Math.min(1, (4 - t) / 0.5);
    return env * (0.4 * Math.sin(TAU * 38 * t) + 0.2 * Math.sin(TAU * 76 * t) + 0.1 * Math.sin(TAU * 114 * t)) * (0.85 + 0.15 * Math.sin(TAU * 4 * t)) + 0.03 * (r() * 2 - 1);
  }],
  rip: [0.45, (t, i, r) => (r() * 2 - 1) * Math.exp(-5 * t) * (0.5 + 0.5 * Math.sin(TAU * 40 * t))],
  whoosh: [0.9, (t, i, r) => (r() * 2 - 1) * Math.sin(Math.PI * Math.min(1, t / 0.9)) * 0.6],
  birds: [1.6, (t, i, r) => {
    const burst = (t % 0.4) < 0.18 ? 1 : 0;
    return burst * 0.2 * Math.sin(TAU * (2200 + 900 * Math.sin(TAU * 14 * t)) * t) * Math.exp(-6 * (t % 0.4));
  }],
};

const generateSfx = () => {
  fs.mkdirSync(SFX_DIR, {recursive: true});
  let made = 0;
  let seed = 1;
  for (const [name, [dur, fn]] of Object.entries(SOUNDS)) {
    seed++;
    const file = path.join(SFX_DIR, `${name}.wav`);
    if (fs.existsSync(file)) continue;
    writeWav(file, synth(dur, (t, i, r) => fn(t, i, r), seed));
    made++;
  }
  console.log(`sfx: ${made} generated, ${Object.keys(SOUNDS).length - made} kept (existing files)`);
};

/** 40 s ambient bed: slow minor chords, soft pad, low pulse, and a distant bell at the midpoint. Loops cleanly. */
const generateMusic = () => {
  const out = path.join(PUBLIC, 'music.mp3');
  if (fs.existsSync(out)) return 'kept';
  const dur = 40;
  const n = dur * SR;
  const chords = [
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [116.54, 146.83, 174.61, 220.0], // Bb
    [174.61, 220.0, 261.63, 329.63], // F
    [130.81, 164.81, 196.0, 246.94], // C
  ];
  const data = new Float64Array(n);
  const bellAt = Math.floor(20 * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const idx = Math.floor(t / 10) % chords.length;
    const local = (t % 10) / 10;
    const fade = Math.min(1, Math.min(local, 1 - local) * 8);
    const chord = chords[idx];
    let v = 0;
    for (const hz of chord) {
      v += 0.05 * Math.sin(TAU * hz * t) + 0.025 * Math.sin(TAU * hz * 1.003 * t) + 0.012 * Math.sin(TAU * hz * 2 * t);
    }
    v *= 0.55 + 0.45 * Math.sin(TAU * 0.1 * t);
    v += 0.22 * Math.sin(TAU * chord[0] / 2 * t) * (0.7 + 0.3 * Math.sin(TAU * 0.25 * t));
    v += 0.05 * Math.sin(TAU * 55 * t) * (0.5 + 0.5 * Math.sin(TAU * 0.5 * t));
    v *= 0.4 + 0.6 * fade;
    if (i >= bellAt && i < bellAt + 3 * SR) {
      const bt = (i - bellAt) / SR;
      v += 0.2 * Math.sin(TAU * 1046.5 * bt) * Math.exp(-1.6 * bt);
    }
    data[i] = v;
  }
  const wavPath = path.join(PUBLIC, '.music-tmp.wav');
  writeWav(wavPath, data);
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-codec:a', 'libmp3lame', '-b:a', '160k', out]);
    return 'generated';
  } finally {
    fs.rmSync(wavPath, {force: true});
  }
};

const voiceovers = {};
for (let n = 1; n <= 5; n++) {
  voiceovers[n] = fs.existsSync(path.join(PUBLIC, `voiceover${n}.mp3`));
}

generateSfx();
const musicState = generateMusic();
console.log(`music.mp3: ${musicState}`);
const musicExists = fs.existsSync(path.join(PUBLIC, 'music.mp3'));

const gen = `// Written by scripts/generate-audio.mjs. Do not edit by hand.
export const ASSETS = {
  music: ${musicExists},
  voiceover: ${JSON.stringify(voiceovers)} as Record<number, boolean>,
};
`;
fs.writeFileSync(path.join(ROOT, 'src', 'assets.generated.ts'), gen);
console.log('voiceovers present:', Object.entries(voiceovers).map(([k, v]) => `${k}=${v}`).join(' '));
