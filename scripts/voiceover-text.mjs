// Writes out/partN_voiceover.txt from voice/partN.json: the spoken text, 3-4 words per line, in order.
// Usage: node scripts/voiceover-text.mjs voice/part1.json [more specs...]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEAKER = {
  narrator: 'NARRATOR',
  ethan: 'ETHAN',
  gps: 'GPS',
  elder: 'ETHAN, OLDER, WHISPERING',
  ethanvideo: 'ETHAN, OLD CAMERA RECORDING',
};

/** Splits words into the fewest lines of 3-4 words, sizes as even as possible. */
const phrases = (words) => {
  const n = words.length;
  if (n <= 4) return [words];
  const k = Math.ceil(n / 4);
  const out = [];
  let i = 0;
  for (let j = 0; j < k; j++) {
    const size = Math.round((n - i) / (k - j));
    out.push(words.slice(i, i + size));
    i += size;
  }
  return out;
};

for (const arg of process.argv.slice(2)) {
  const spec = JSON.parse(fs.readFileSync(path.resolve(ROOT, arg), 'utf8'));
  const warnings = [];
  let text = `${spec.title} - PART ${spec.part} VOICEOVER\n`;
  text += '3-4 words per line, in spoken order. Bracketed lines give the start time (seconds) and the speaker.\n';
  for (const line of spec.lines) {
    text += `\n[${line.s.toFixed(1)} s  ${SPEAKER[line.who] ?? line.who.toUpperCase()}]\n`;
    for (const p of phrases(line.text.trim().split(/\s+/))) {
      if (p.length < 3) warnings.push(`${line.id}: "${p.join(' ')}" has ${p.length} words`);
      text += p.join(' ') + '\n';
    }
  }
  const out = path.join(ROOT, 'out', `part${spec.part}_voiceover.txt`);
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, text);
  console.log(`wrote ${path.relative(ROOT, out)}${warnings.length ? '  WARNINGS: ' + warnings.join('; ') : ''}`);
}
