// Validates src/script/dialogue.json against the caption rules:
// - at most 4 highlighted words per part, at least 15 s between highlight moments
// - every highlight word appears in the line that is on screen at its time
// - lines stay inside the 60 s part and do not overlap
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'script', 'dialogue.json'), 'utf8'));
const norm = (w) => w.toLowerCase().replace(/[^a-z']/g, '');
let problems = 0;
for (const part of Object.keys(data).filter((k) => !k.startsWith('_'))) {
  const {lines, highlights} = data[part];
  const errs = [];
  if (highlights.length > 4) errs.push(`${highlights.length} highlights (max 4)`);
  const sorted = [...highlights].sort((a, b) => a.at - b.at);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].at - sorted[i - 1].at;
    if (gap < 15) errs.push(`highlights at ${sorted[i - 1].at}s and ${sorted[i].at}s are ${gap.toFixed(1)}s apart (min 15)`);
  }
  for (const h of highlights) {
    const line = lines.find((l) => h.at >= l.s && h.at <= l.e);
    if (!line) errs.push(`highlight "${h.word}" at ${h.at}s is not on screen`);
    else if (!line.t.split(/\s+/).some((w) => norm(w) === norm(h.word))) errs.push(`"${h.word}" is not in the line at ${h.at}s`);
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].s < 0 || lines[i].e > 60) errs.push(`line "${lines[i].t}" is outside 0-60s`);
    if (i > 0 && lines[i].s < lines[i - 1].e) errs.push(`line "${lines[i].t}" overlaps the previous line`);
  }
  const status = errs.length ? 'FAIL' : 'ok';
  console.log(`part ${part}: ${status} (${lines.length} lines, ${highlights.length} highlights)`);
  for (const e of errs) console.log(`   - ${e}`);
  problems += errs.length;
}
process.exit(problems ? 1 : 0);
