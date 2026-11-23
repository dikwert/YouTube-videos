// Generates the Pilot Short narration with ElevenLabs timestamps for the whole script.
// Writes pilot-short/voice/words.json ([{w,s,e}]) and public/audio/pilot/voice.wav (48 kHz mono).
// The API key is injected by the network proxy; it is never written here.
// Usage: node scripts/pilot-voice.mjs [voiceId]
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOICE_ID = process.argv[2] ?? 'bIHbv24MWmeRgasZH58o'; // Will (premade). Mike is not usable on this key/plan.
const MODEL = 'eleven_v3';
const SETTINGS = {stability: 0.35, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true};
const text = fs.readFileSync(path.join(ROOT, 'pilot-short/voice/script.txt'), 'utf8').trim();
const takesDir = path.join(ROOT, 'voice', 'takes');
fs.mkdirSync(takesDir, {recursive: true});
const key = crypto.createHash('sha1').update(JSON.stringify({VOICE_ID, MODEL, SETTINGS, text})).digest('hex').slice(0, 20);
const cache = path.join(takesDir, `pilot_${key}.json`);

if (!fs.existsSync(cache)) {
  const body = path.join(takesDir, `pilot_${key}.body.json`);
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
fs.writeFileSync(path.join(ROOT, 'pilot-short/voice/words.json'), JSON.stringify(words, null, 1) + '\n');

const mp3 = path.join(takesDir, `pilot_${key}.mp3`);
fs.writeFileSync(mp3, Buffer.from(resp.audio_base64, 'base64'));
const wav = path.join(ROOT, 'public/audio/pilot/voice.wav');
fs.mkdirSync(path.dirname(wav), {recursive: true});
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp3, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', wav]);
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).toString().trim());
console.log(`words: ${words.length}, speech from ${words[0].s}s to ${words[words.length - 1].e}s, wav duration ${dur.toFixed(2)}s`);
