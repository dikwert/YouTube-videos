// ElevenLabs voice generation for the series.
// Usage:
//   node scripts/voice.mjs test                  one test phrase per voice -> voice-tests/
//   node scripts/voice.mjs one <role> "<text>" <out.mp3> [--scared]
// The API key is never read or written here: the network proxy injects the saved credential.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'voice', 'voices.json'), 'utf8'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tts-'));

/** Raw speech from ElevenLabs. Returns the path of the mp3 written. */
export const synth = (role, text, outFile, {scared = false} = {}) => {
  const cfg = CONFIG.roles[role];
  if (!cfg) throw new Error(`unknown role ${role}`);
  const settings = scared && CONFIG.roles[`${role}_scared`] ? CONFIG.roles[`${role}_scared`].settings : cfg.settings;
  const body = path.join(TMP, `${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(body, JSON.stringify({text, model_id: CONFIG.model, voice_settings: settings}));
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${cfg.id}?output_format=${CONFIG.format}`;
  execFileSync('curl', ['-sS', '-f', '-X', 'POST', url, '-H', 'Content-Type: application/json', '-H', 'Accept: audio/mpeg', '--data-binary', `@${body}`, '-o', outFile]);
  fs.rmSync(body, {force: true});
  return outFile;
};

const FILTERS = {
  none: null,
  // Natural narrator: light compression, a little warmth below 200 Hz, a faint room slap, loudness normalised.
  room: 'acompressor=threshold=-20dB:ratio=3:attack=10:release=120:makeup=2,equalizer=f=150:t=q:w=1:g=3,aecho=0.8:0.88:40:0.12,loudnorm=I=-16:TP=-1.5:LRA=11',
  // Radio navigator: narrow band, light compression, a little hiss.
  radio: 'highpass=f=350,lowpass=f=3200,acompressor=threshold=-18dB:ratio=4:attack=5:release=60,volume=1.1',
  // Recorded video: soft band, slight crunch.
  tape: 'highpass=f=180,lowpass=f=4000,acrusher=bits=10:mix=0.25,volume=0.95',
  // Voice from the dark corridor: short echoes, dull top end.
  echo: 'aecho=0.8:0.55:60|120:0.35|0.22,lowpass=f=2600,volume=0.9',
};
const NOISE = {radio: 0.012, tape: 0.008};

/** Applies the role's filter (plus faint noise where set). Writes outFile. */
export const applyFilter = (inFile, outFile, filter) => {
  const chain = FILTERS[filter];
  if (!chain) {
    fs.copyFileSync(inFile, outFile);
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
  args.push('-codec:a', 'libmp3lame', '-b:a', '128k', outFile);
  execFileSync('ffmpeg', args);
  return outFile;
};

/** Narrator candidates: one identical script phrase, two takes each, processed with the room chain. */
const narratorRound = (phrase) => {
  const dir = path.join(ROOT, 'voice-tests', 'narrator-candidates');
  fs.mkdirSync(dir, {recursive: true});
  const candidates = CONFIG.narrator_candidates;
  const settings = {stability: 0.35, similarity_boost: 0.80, style: 0.30, use_speaker_boost: true};
  candidates.forEach((cand, i) => {
    for (let take = 1; take <= 2; take++) {
      const raw = path.join(TMP, `cand_${i}_${take}.mp3`);
      synthWith(cand.voice_id, phrase, raw, settings);
      const slug = cand.name.split(' - ')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const out = path.join(dir, `${String(i + 1).padStart(2, '0')}_${slug}_${cand.voice_id}_take${take}.mp3`);
      applyFilter(raw, out, 'room');
      console.log('wrote', path.relative(ROOT, out));
    }
  });
};

/** Synthesis with an explicit voice id and settings (used for candidates). */
export const synthWith = (voiceId, text, outFile, settings, model = CONFIG.model) => {
  const body = path.join(TMP, `${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(body, JSON.stringify({text, model_id: model, voice_settings: settings}));
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${CONFIG.format}`;
  execFileSync('curl', ['-sS', '-f', '-X', 'POST', url, '-H', 'Content-Type: application/json', '-H', 'Accept: audio/mpeg', '--data-binary', `@${body}`, '-o', outFile]);
  fs.rmSync(body, {force: true});
  return outFile;
};

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'narrator-round') {
  narratorRound(rest[0] ?? 'Mason never trusted maps. [pause] Until today.');
} else if (cmd === 'character-round') {
  const dir = path.join(ROOT, 'voice-tests', 'characters');
  fs.mkdirSync(dir, {recursive: true});
  const liam = CONFIG.roles.mason.id;
  const sarah = CONFIG.roles.gps.id;
  const plans = [
    {voice: liam, text: 'Okay, this jungle road looks legit.', settings: {stability: 0.35, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true}, filter: 'room', name: 'mason_liam_normal'},
    {voice: liam, text: '[whispers] Mason... turn left.', settings: {stability: 0.30, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true}, filter: 'room', name: 'mason_liam_scared'},
    {voice: sarah, text: 'Welcome back, Mason.', settings: {stability: 0.35, similarity_boost: 0.8, style: 0.20, use_speaker_boost: true}, filter: 'radio', name: 'gps_sarah_natural'},
    {voice: sarah, text: 'Welcome back, Mason.', settings: {stability: 0.70, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true}, filter: 'radio', name: 'gps_sarah_flat'},
  ];
  for (const p of plans) {
    for (let take = 1; take <= 2; take++) {
      const raw = path.join(TMP, `${p.name}_${take}.mp3`);
      synthWith(p.voice, p.text, raw, p.settings);
      const out = path.join(dir, `${p.name}_take${take}.mp3`);
      applyFilter(raw, out, p.filter);
      console.log('wrote', path.relative(ROOT, out));
    }
  }
} else
if (cmd === 'test') {
  const dir = path.join(ROOT, 'voice-tests');
  fs.mkdirSync(dir, {recursive: true});
  const tests = [
    {role: 'narrator', text: 'Mason never trusted maps. Until today.', out: 'narrator_callum.mp3'},
    {role: 'backup_narrator', text: 'Mason never trusted maps. Until today.', out: 'backup_narrator_brian.mp3'},
    {role: 'mason', text: 'Okay, this jungle road looks legit.', out: 'mason_liam.mp3'},
    {role: 'mason', text: 'Mason... turn left.', out: 'mason_liam_scared.mp3', scared: true},
    {role: 'gps', text: 'Welcome back, Mason.', out: 'gps_sarah_raw.mp3'},
    {role: 'gps', text: 'Welcome back, Mason.', out: 'gps_sarah_radio.mp3', filtered: true},
  ];
  for (const t of tests) {
    const raw = path.join(TMP, `raw_${t.out}`);
    synth(t.role, t.text, raw, {scared: !!t.scared});
    const filter = t.filtered ? CONFIG.roles[t.role].filter : 'none';
    applyFilter(raw, path.join(dir, t.out), filter);
    const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, t.out)]).toString().trim();
    console.log(`${t.out}: ${Number(dur).toFixed(2)} s (${t.role}${t.scared ? ', scared' : ''}${t.filtered ? ', radio filter' : ''})`);
  }
} else if (cmd === 'one') {
  const [role, text, out, flag] = rest;
  const raw = path.join(TMP, 'one.mp3');
  synth(role, text, raw, {scared: flag === '--scared'});
  applyFilter(raw, out, CONFIG.roles[role].filter);
  console.log('wrote', out);
} else {
  console.error('usage: node scripts/voice.mjs test | one <role> "<text>" <out.mp3> [--scared]');
  process.exit(1);
}
