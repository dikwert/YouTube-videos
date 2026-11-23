// Builds the voiceover for all five parts from src/script/dialogue.json.
//  1. Two takes per line (eleven_v3, role settings). Raw takes -> voice/takes/partN/
//  2. The take with a natural speaking rate (about 2.8 words/s) is processed with the role's filter -> voice/lines/partN/
//  3. Lines are placed in order; a line that would overlap the previous one is moved just after it, and the captions follow.
//  4. Each part's lines are mixed into public/voiceoverN.mp3 (used by the videos) and out/partN_voice.mp3 (for download).
//  5. dialogue.json is rewritten with the real timings; manifest in voice/manifest.json.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT, CONFIG, synthWith, applyFilter, durationOf} from './voicelib.mjs';

const DIALOGUE_PATH = path.join(ROOT, 'src', 'script', 'dialogue.json');
const dialogue = JSON.parse(fs.readFileSync(DIALOGUE_PATH, 'utf8'));
const PARTS = ['1', '2', '3', '4', '5'];
const roleOf = (l) => (l.who === 'mason' ? (l.scared ? 'mason_scared' : 'mason') : l.who);
const words = (t) => t.split(/\s+/).filter(Boolean).length;
const normWord = (w) => w.toLowerCase().replace(/[^a-z']/g, '');
const manifest = {};

const pickTake = (takes, n) => {
  let best = takes[0];
  let bestDiff = Infinity;
  for (const tk of takes) {
    const diff = Math.abs(n / tk.dur - 2.8);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = tk;
    }
  }
  return best;
};

// 1-2. Generate, choose, process.
for (const p of PARTS) {
  const lines = dialogue[p].lines;
  const takesDir = path.join(ROOT, 'voice', 'takes', `part${p}`);
  const linesDir = path.join(ROOT, 'voice', 'lines', `part${p}`);
  fs.mkdirSync(takesDir, {recursive: true});
  fs.mkdirSync(linesDir, {recursive: true});
  manifest[p] = [];
  lines.forEach((l, i) => {
    const role = roleOf(l);
    const cfg = CONFIG.roles[role];
    const base = `${String(i + 1).padStart(2, '0')}_${role}`;
    const takes = [];
    for (let t = 1; t <= 2; t++) {
      const raw = path.join(takesDir, `${base}_t${t}.mp3`);
      if (!fs.existsSync(raw)) synthWith(cfg.id, (l.tag ? `${l.tag} ` : '') + l.t, raw, cfg.settings);
      takes.push({file: raw, dur: durationOf(raw)});
    }
    const chosen = pickTake(takes, words(l.t));
    const out = path.join(linesDir, `${base}.mp3`);
    applyFilter(chosen.file, out, cfg.filter);
    l._file = out;
    l._dur = durationOf(out);
    l._role = role;
    l._take = path.basename(chosen.file);
    console.log(`part${p} ${base} take=${l._take} dur=${l._dur.toFixed(2)}`);
  });
}

// 3. Placement: keep the planned start unless the previous line is still speaking.
for (const p of PARTS) {
  const lines = dialogue[p].lines;
  let prevEnd = -1;
  for (const l of lines) {
    const planned = l.s;
    const start = Math.max(planned, prevEnd + 0.15);
    const shift = start - planned;
    if (shift > 0.8) console.warn(`part${p}: "${l.t}" moved ${shift.toFixed(2)} s`);
    l.s = Math.round(start * 100) / 100;
    l.e = Math.round((start + l._dur) * 100) / 100;
    prevEnd = l.e;
  }
  if (prevEnd > 59.5) console.warn(`part${p}: speech ends at ${prevEnd.toFixed(2)} s`);
  // Highlights follow their word: re-anchor each to the middle of the line that holds it.
  for (const h of dialogue[p].highlights) {
    const line = lines.find((l) => l.t.split(/\s+/).some((w) => normWord(w) === normWord(h.word)));
    if (line) h.at = Math.round(((line.s + line.e) / 2) * 100) / 100;
  }
}

// 4. Mix per part.
for (const p of PARTS) {
  const lines = dialogue[p].lines;
  const mixed = path.join(ROOT, 'public', `voiceover${p}.mp3`);
  const args = ['-y', '-loglevel', 'error'];
  lines.forEach((l) => args.push('-i', l._file));
  const chains = lines.map((l, i) => {
    const ms = Math.round(l.s * 1000);
    return `[${i}:a]aformat=channel_layouts=stereo,adelay=${ms}|${ms}[a${i}]`;
  });
  const labels = lines.map((_, i) => `[a${i}]`).join('');
  const filter = `${chains.join(';')};${labels}amix=inputs=${lines.length}:normalize=0:dropout_transition=0,apad=whole_dur=60,atrim=end=60,loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
  args.push('-filter_complex', filter, '-map', '[out]', '-codec:a', 'libmp3lame', '-b:a', '192k', mixed);
  execFileSync('ffmpeg', args);
  fs.copyFileSync(mixed, path.join(ROOT, 'out', `part${p}_voice.mp3`));
  manifest[p] = lines.map((l, i) => ({idx: i + 1, who: l.who, role: l._role, start: l.s, end: l.e, take: l._take, text: l.t}));
  console.log(`mixed part${p}: ${lines.length} lines -> public/voiceover${p}.mp3`);
}

// 5. Save the real timings (captions follow them) and the manifest.
for (const p of PARTS) {
  for (const l of dialogue[p].lines) {
    delete l._file;
    delete l._dur;
    delete l._role;
    delete l._take;
  }
}
fs.writeFileSync(DIALOGUE_PATH, JSON.stringify(dialogue, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'voice', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('BUILD COMPLETE');
