// Generates the Janitor Short narration with ElevenLabs timestamps for the whole script.
// Writes janitor-short/voice/words_raw.json ([{w,s,e}]) and janitor-short/voice/raw_48k.wav (48 kHz mono).
// The API key is injected by the network proxy; it is never written here.
// Usage: node scripts/janitor-voice.mjs [voiceId]
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Mike (cBTYF7NiJbR8Bvmdeuse) cannot be used on this key and plan (401 to add, 402 to synthesize).
// Brian (premade, deep and comforting) is the closest voice that works.
const VOICE_ID = process.argv[2] ?? 'nPczCjzI2devNBz1zQrb';
const MODEL = 'eleven_v3';
const SETTINGS = {stability: 0.35, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true};
const VOICE_DIR = path.join(ROOT, 'janitor-short', 'voice');
const text = fs.readFileSync(path.join(VOICE_DIR, 'script.txt'), 'utf8').trim();
const takesDir = path.join(ROOT, 'voice', 'takes');
fs.mkdirSync(takesDir, {recursive: true});
const key = crypto.createHash('sha1').update(JSON.stringify({VOICE_ID, MODEL, SETTINGS, text})).digest('hex').slice(0, 20);
const cache = path.join(takesDir, `janitor_${key}.json`);

if (!fs.existsSync(cache)) {
  const body = path.join(takesDir, `janitor_${key}.body.json`);
  fs.writeFileSync(body, JSON.stringify({text, model_id: MODEL, voice_settings: SETTINGS}));
  const status = execFileSync('curl', ['-sS', '--max-time', '300', '-o', cache, '-w', '%{http_code}', '-X', 'POST',
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    '-H', 'Content-Type: application/json', '--data-binary', `@${body}`]).toString().trim();
  fs.rmSync(body, {force: true});
  if (status !== '200') {
    const msg = fs.readFileSync(cache, 'utf8');
    fs.rmSync(cache, {force: true});
    throw new Error(`text-to-speech returned ${status}: ${msg.slice(0, 400)}`);
  }
}
const resp = JSON.parse(fs.readFileSync(cache, 'utf8'));
const al = resp.alignment;
const chars = al.characters;
const words = [];
let cur = null;
for (let i = 0; i < chars.length; i++) {
  const c = chars[i];
  if (/\s/.test(c)) {
    if (cur) { words.push(cur); cur = null; }
    continue;
  }
  if (!cur) cur = {w: '', s: al.character_start_times_seconds[i], e: al.character_end_times_seconds[i]};
  cur.w += c;
  cur.e = al.character_end_times_seconds[i];
}
if (cur) words.push(cur);
const expected = text.split(/\s+/).filter(Boolean).length;
if (words.length !== expected) throw new Error(`word count ${words.length} != script ${expected}`);
for (const w of words) { w.s = Math.round(w.s * 1000) / 1000; w.e = Math.round(w.e * 1000) / 1000; }
fs.writeFileSync(path.join(VOICE_DIR, 'words_raw.json'), JSON.stringify(words, null, 1) + '\n');

const mp3 = path.join(takesDir, `janitor_${key}.mp3`);
fs.writeFileSync(mp3, Buffer.from(resp.audio_base64, 'base64'));
const wav = path.join(VOICE_DIR, 'raw_48k.wav');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp3, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', wav]);
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).toString().trim());
console.log(`voice ${VOICE_ID}: ${words.length} words, raw take ${dur.toFixed(2)} s -> ${path.relative(ROOT, wav)}`);
