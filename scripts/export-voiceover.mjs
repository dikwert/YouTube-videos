// Writes the voiceover text for each part: one phrase of 3-4 words per line, speaker tags in brackets.
// Output: out/partN_voiceover.txt
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'script', 'dialogue.json'), 'utf8'));
const TAG = {mason: '', future: '[Future Mason] ', gps: '[GPS voice] ', truck: '[Truck driver] ', voice: "[Mason's own voice, from the dark] "};
const TITLE = {1: 'Turn Left', 2: 'The Jeep Inside', 3: 'The Recording', 4: 'Recalculating', 5: 'Turn Right'};

/** Split into phrases of 2-4 words, spread as evenly as possible (never a lone word, unless the line is one word). */
const phrases = (text) => {
  const w = text.split(/\s+/).filter(Boolean);
  const k = Math.ceil(w.length / 4);
  const out = [];
  let i = 0;
  for (let j = 0; j < k; j++) {
    const size = Math.ceil((w.length - i) / (k - j));
    out.push(w.slice(i, i + size).join(' '));
    i += size;
  }
  return out;
};

fs.mkdirSync(OUT, {recursive: true});
for (const n of [1, 2, 3, 4, 5]) {
  const part = data[String(n)];
  const lines = [
    `HIS GPS KNEW HIS NAME - PART ${n}: ${TITLE[n]}`,
    'Cast (ElevenLabs, model eleven_v3): narrator = Callum (N2lVS1w4EtoT3dr4eOWO); Mason and his recording = Liam (TX3LPaxmHKxFdv7VOQHJ); GPS = Sarah (EXAVITQu4vr4xnSDxMaL, radio filter); truck driver = Brian (nPczCjzI2devNBz1zQrb).',
    'Lines are phrases of 3-4 words. Blank lines are pauses. Bracketed tags such as [whispers] are performance notes, not spoken words.',
    '',
  ];
  let last = 0;
  for (const l of part.lines) {
    if (l.s - last > 1.2 && last > 0) lines.push('');
    const tag = TAG[l.who] ?? '';
    const note = l.tag ? `${l.tag} ` : '';
    phrases(l.t).forEach((p, i) => lines.push(i === 0 ? `${tag}${note}${p}` : p));
    last = l.e;
  }
  const file = path.join(OUT, `part${n}_voiceover.txt`);
  fs.writeFileSync(file, lines.join('\n') + '\n');
  console.log('wrote', file);
}
