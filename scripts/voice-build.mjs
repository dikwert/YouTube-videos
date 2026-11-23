// Builds one part's voice from voice/partN.json.
//  1. ElevenLabs text-to-speech with timestamps for each line (responses cached in voice/takes/).
//  2. Processed clips in public/audio/partN/ (low end, compression, light room echo, limiter).
//  3. Subtitle cards timed from the character timestamps, checked against the rules.
//  4. src/script/generated/partN.ts with SUBTITLES and AUDIO, used by the composition.
// Usage: node scripts/voice-build.mjs voice/part1.json
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specPath = path.resolve(ROOT, process.argv[2] ?? 'voice/part1.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const cast = JSON.parse(fs.readFileSync(path.join(ROOT, 'voice', 'cast.json'), 'utf8'));
const partKey = `part${spec.part}`;
const takesDir = path.join(ROOT, 'voice', 'takes');
const tmpDir = path.join(takesDir, '.tmp');
const audioDir = path.join(ROOT, 'public', 'audio', partKey);
const genDir = path.join(ROOT, 'src', 'script', 'generated');
fs.mkdirSync(tmpDir, {recursive: true});
fs.mkdirSync(audioDir, {recursive: true});
fs.mkdirSync(genDir, {recursive: true});

/** Light, role-specific processing: the GPS sounds like a small speaker, the others get low end and a little room. */
const FILTERS = {
  narrator:
    'highpass=f=80,equalizer=f=130:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=3:attack=10:release=120:makeup=2,aecho=0.8:0.6:40:0.15,alimiter=limit=0.95',
  ethan:
    'highpass=f=100,equalizer=f=3000:t=q:w=1.2:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=10:release=120:makeup=2,aecho=0.8:0.6:40:0.15,alimiter=limit=0.95',
  // Older Ethan, whispering: narrow band, a breathy room.
  elder:
    'highpass=f=140,lowpass=f=4000,acompressor=threshold=-22dB:ratio=3:attack=10:release=150:makeup=2,aecho=0.8:0.5:60:0.2,alimiter=limit=0.9',
  // Old camera recording: a small mic, band-limited, a little hiss-like echo.
  ethanvideo:
    'highpass=f=260,lowpass=f=3200,equalizer=f=1200:t=q:w=1:g=2,acompressor=threshold=-16dB:ratio=4:attack=5:release=100:makeup=3,aecho=0.7:0.5:25:0.12,alimiter=limit=0.9',
  gps: 'highpass=f=320,lowpass=f=3400,acompressor=threshold=-18dB:ratio=3:attack=5:release=100:makeup=3,aecho=0.7:0.5:25:0.1,alimiter=limit=0.9',
};

const voiceIdOf = (who) => spec.voices?.[who] ?? cast.chosen?.[who];
const settingsOf = (who) => cast.settings[who] ?? cast.settings.narrator;

/** One text-to-speech call with timestamps; cached by voice, text and settings, so a retry costs nothing. */
const synth = (voiceId, text, settings) => {
  const key = crypto.createHash('sha1').update(JSON.stringify({voiceId, text, model: cast.model, settings})).digest('hex').slice(0, 20);
  const cacheFile = path.join(takesDir, `${key}.json`);
  if (!fs.existsSync(cacheFile)) {
    const bodyFile = path.join(tmpDir, `${key}.body.json`);
    fs.writeFileSync(bodyFile, JSON.stringify({text, model_id: cast.model, voice_settings: settings}));
    const status = execFileSync('curl', [
      '-sS', '--max-time', '240', '-o', cacheFile, '-w', '%{http_code}', '-X', 'POST',
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${cast.format}`,
      '-H', 'Content-Type: application/json', '--data-binary', `@${bodyFile}`,
    ]).toString().trim();
    fs.rmSync(bodyFile, {force: true});
    if (status !== '200') {
      const msg = fs.existsSync(cacheFile) ? fs.readFileSync(cacheFile, 'utf8') : '';
      fs.rmSync(cacheFile, {force: true});
      throw new Error(`text-to-speech returned ${status}: ${msg.slice(0, 300)}`);
    }
  }
  return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
};

/** Start and end time of each word, from the character alignment. Returns null if the words do not line up. */
const wordTimes = (alignment, text) => {
  const chars = alignment.characters;
  const st = alignment.character_start_times_seconds;
  const en = alignment.character_end_times_seconds;
  const starts = [];
  const ends = [];
  let inWord = false;
  let wi = 0;
  for (let i = 0; i < chars.length; i++) {
    if (/\s/.test(chars[i])) {
      if (inWord) {
        ends[wi] = en[i - 1];
        wi++;
        inWord = false;
      }
      continue;
    }
    if (!inWord) {
      starts[wi] = st[i];
      inWord = true;
    }
  }
  if (inWord) {
    ends[wi] = en[chars.length - 1];
    wi++;
  }
  return wi === text.trim().split(/\s+/).length ? {starts, ends} : null;
};

const duration = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

const report = [];
const lines = [];
const cards = [];

for (const line of spec.lines) {
  const voiceId = voiceIdOf(line.who);
  if (!voiceId) throw new Error(`no voice for role "${line.who}" (set it in voice/cast.json or in the spec)`);
  const resp = synth(voiceId, line.text, settingsOf(line.who));
  const raw = path.join(tmpDir, `${line.id}.mp3`);
  fs.writeFileSync(raw, Buffer.from(resp.audio_base64, 'base64'));
  const out = path.join(audioDir, `${line.id}.mp3`);
  const filter = FILTERS[line.who] ?? FILTERS.narrator;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', filter, '-codec:a', 'libmp3lame', '-b:a', '192k', out]);
  fs.rmSync(raw, {force: true});
  const dur = duration(out);
  lines.push({id: line.id, who: line.who, s: line.s, dur, file: `audio/${partKey}/${line.id}.mp3`});

  // Subtitle cards: each card covers its words, timed from the alignment (shifted to the line's start).
  const words = line.text.trim().split(/\s+/);
  const times = wordTimes(resp.alignment, line.text);
  const cardWords = line.cards.map((c) => c.split(' ').length);
  if (cardWords.reduce((a, b) => a + b, 0) !== words.length) {
    throw new Error(`${line.id}: cards cover ${cardWords.reduce((a, b) => a + b, 0)} words, the line has ${words.length}`);
  }
  let k = 0;
  line.cards.forEach((text, ci) => {
    const n = cardWords[ci];
    let s;
    let e;
    if (times) {
      s = line.s + times.starts[k];
      e = line.s + times.ends[k + n - 1];
    } else {
      // Fallback: spread the line's audio by word count.
      const per = dur / words.length;
      s = line.s + k * per;
      e = line.s + (k + n) * per;
    }
    k += n;
    // A red keyword belongs only to the card that contains it.
    cards.push({s, e, text, keys: (line.keys ?? []).filter((k) => text.includes(k)), who: line.who, line: line.id, n});
  });
  report.push({id: line.id, who: line.who, s: line.s, dur, end: line.s + dur, aligned: Boolean(times)});
}

// Cards never overlap each other; a card holds at least 0.35 s, and the next card starts where it ends.
cards.sort((a, b) => a.s - b.s);
for (let i = 0; i < cards.length; i++) {
  const next = cards[i + 1];
  if (cards[i].e - cards[i].s < 0.35) cards[i].e = cards[i].s + 0.35;
  if (next && cards[i].e > next.s) cards[i].e = next.s;
}

// Checks: the line fits before the next line; cards hold 2-4 words; 2-4 red keywords, 15 s apart.
const problems = [];
for (let i = 0; i < report.length; i++) {
  const next = report[i + 1];
  if (next && report[i].end > next.s - 0.05) {
    problems.push(`${report[i].id} ends at ${report[i].end.toFixed(2)} s but ${next.id} starts at ${next.s} s`);
  }
  if (report[i].end > (spec.duration ?? 60)) problems.push(`${report[i].id} runs past the end of the part`);
}
for (const c of cards) {
  if (c.n < 2 || c.n > 4) problems.push(`card "${c.text}" has ${c.n} words (rule: 2-4)`);
}
const keyCards = cards.filter((c) => c.keys.length > 0);
const keyWords = keyCards.reduce((n, c) => n + c.text.split(' ').filter((w) => c.keys.some((k) => k.split(' ').includes(w.replace(/[^A-Z']/g, '')))).length, 0);
if (keyWords < 2 || keyWords > 4) problems.push(`red keywords: ${keyWords} (rule: 2-4 per part)`);
for (let i = 1; i < keyCards.length; i++) {
  if (keyCards[i].s - keyCards[i - 1].s < 15) problems.push(`red keywords ${keyCards[i - 1].text} and ${keyCards[i].text} are closer than 15 s`);
}

// Ambience bed (rain hiss), generated once per part.
let beds = (spec.beds ?? []).map((b) => ({file: b.file, vol: b.vol, loop: Boolean(b.loop)}));
if (spec.bed) {
  const bedFile = path.join(audioDir, 'bed.mp3');
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `anoisesrc=d=${spec.duration ?? 60}:c=pink:r=44100:a=0.5`,
    '-af', 'lowpass=f=1400,highpass=f=80,tremolo=f=0.25:d=0.25,volume=0.6', '-codec:a', 'libmp3lame', '-b:a', '128k', bedFile,
  ]);
  beds = [{file: `audio/${partKey}/bed.mp3`, vol: spec.bed.vol ?? 0.35, loop: false}, ...beds];
}
const sfx = (spec.sfx ?? []).map((x) => ({file: x.file, s: x.s, vol: x.vol ?? 0.6, loop: Boolean(x.loop)}));

const r3 = (v) => Math.round(v * 1000) / 1000;
const ts = `// Generated by scripts/voice-build.mjs from voice/${path.basename(specPath)}. Edit the spec and rebuild.
import type {AudioPlanData, Card} from '../types';

export const SUBTITLES: Card[] = [
${cards
  .map((c) => `  {s: ${r3(c.s)}, e: ${r3(c.e)}, text: ${JSON.stringify(c.text)}${c.keys.length ? `, keys: ${JSON.stringify(c.keys)}` : ''}},`)
  .join('\n')}
];

export const AUDIO: AudioPlanData = {
  lines: [
${lines.map((l) => `    {id: ${JSON.stringify(l.id)}, who: ${JSON.stringify(l.who)}, s: ${r3(l.s)}, dur: ${r3(l.dur)}, file: ${JSON.stringify(l.file)}},`).join('\n')}
  ],
  sfx: [
${sfx.map((x) => `    {file: ${JSON.stringify(x.file)}, s: ${r3(x.s)}, vol: ${x.vol}${x.loop ? ', loop: true' : ''}},`).join('\n')}
  ],
  beds: [
${beds.map((b) => `    {file: ${JSON.stringify(b.file)}, s: 0, vol: ${b.vol}${b.loop ? ', loop: true' : ''}},`).join('\n')}
  ],
};
`;
fs.writeFileSync(path.join(genDir, `${partKey}.ts`), ts);
fs.rmSync(tmpDir, {recursive: true, force: true});

console.log('line        who        start   dur    end    aligned');
for (const r of report) {
  console.log(`${r.id.padEnd(11)} ${r.who.padEnd(10)} ${r.s.toFixed(2).padStart(6)} ${r.dur.toFixed(2).padStart(6)} ${r.end.toFixed(2).padStart(6)}    ${r.aligned}`);
}
console.log(`cards: ${cards.length}, red keywords: ${keyWords}`);
if (problems.length) {
  console.log('PROBLEMS:');
  for (const p of problems) console.log(' - ' + p);
  process.exitCode = 1;
} else {
  console.log('CHECKS OK');
}
