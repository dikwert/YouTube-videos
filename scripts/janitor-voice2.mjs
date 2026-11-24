// Generates the Janitor Short narration paragraph by paragraph with ElevenLabs multilingual v2 (with timestamps).
// Each paragraph is sent with its neighbours as previous_text / next_text, so the intonation runs across the cut.
// Writes janitor-short/voice/takes/p{i}_t{t}.json (audio_base64 + alignment) and p{i}_t{t}.mp3 (for listening).
// The API key is injected by the network proxy; it is never written here.
// Usage: node scripts/janitor-voice2.mjs            all paragraphs, take 0
//        node scripts/janitor-voice2.mjs 4 2        paragraph 4, take 2 (for regenerating one paragraph)
//        JANITOR_SPEED=1.2 node scripts/janitor-voice2.mjs 0 1   the same, spoken at speed 1.2
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Brian (premade). Mike (cBTYF7NiJbR8Bvmdeuse) is a library voice: 402 on this plan.
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = {stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true};
// JANITOR_SPEED=1.2 makes the model speak about 20% faster, so the fit needs less stretching; unset keeps speed 1.0
const SPEED = process.env.JANITOR_SPEED ? Number(process.env.JANITOR_SPEED) : null;
const VOICE_SETTINGS = SPEED ? {...SETTINGS, speed: SPEED} : SETTINGS;
const FORMAT = 'mp3_44100_128'; // pcm_44100 needs the Pro tier, mp3_44100_192 the Creator tier
const DIR = path.join(ROOT, 'janitor-short', 'voice', 'takes');
const paras = fs.readFileSync(path.join(ROOT, 'janitor-short', 'voice', 'script.txt'), 'utf8')
  .trim().split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
const only = process.argv[2] !== undefined ? [Number(process.argv[2])] : paras.map((_, i) => i);
const take = Number(process.argv[3] ?? 0);
fs.mkdirSync(DIR, {recursive: true});

for (const i of only) {
  const body = {text: paras[i], model_id: MODEL, voice_settings: VOICE_SETTINGS};
  if (i > 0) body.previous_text = paras[i - 1];
  if (i < paras.length - 1) body.next_text = paras[i + 1];
  const bodyFile = path.join(DIR, `p${i}_t${take}.body.json`);
  const out = path.join(DIR, `p${i}_t${take}.json`);
  fs.writeFileSync(bodyFile, JSON.stringify(body));
  const status = execFileSync('curl', ['-sS', '--max-time', '300', '-o', out, '-w', '%{http_code}', '-X', 'POST',
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=${FORMAT}`,
    '-H', 'Content-Type: application/json', '--data-binary', `@${bodyFile}`]).toString().trim();
  fs.rmSync(bodyFile, {force: true});
  if (status !== '200') {
    const msg = fs.readFileSync(out, 'utf8');
    fs.rmSync(out, {force: true});
    console.log(`p${i} take ${take}: HTTP ${status} ${msg.slice(0, 240)}`);
    continue;
  }
  const resp = JSON.parse(fs.readFileSync(out, 'utf8'));
  const al = resp.alignment;
  const words = [];
  let cur = null;
  for (let c = 0; c < al.characters.length; c++) {
    const ch = al.characters[c];
    if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } continue; }
    if (!cur) cur = {w: '', s: al.character_start_times_seconds[c], e: al.character_end_times_seconds[c]};
    cur.w += ch;
    cur.e = al.character_end_times_seconds[c];
  }
  if (cur) words.push(cur);
  const expected = paras[i].split(/\s+/).length;
  const mp3 = path.join(DIR, `p${i}_t${take}.mp3`);
  fs.writeFileSync(mp3, Buffer.from(resp.audio_base64, 'base64'));
  const dur = al.character_end_times_seconds.at(-1);
  console.log(`p${i} take ${take}: HTTP 200, ${words.length}/${expected} words, ${dur.toFixed(2)} s, next:"${(paras[i + 1] ?? '').slice(0, 20)}"`);
}
