// Voice candidates for the new series: 3 voices per role, one phrase each, 2 takes.
// Output: voice-tests/<role>_<name>_<voice_id>_take<n>.mp3 and voice-tests/candidates.json
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAST = JSON.parse(fs.readFileSync(path.join(ROOT, 'voice', 'cast.json'), 'utf8'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-'));
const OUT = path.join(ROOT, 'voice-tests');
fs.mkdirSync(OUT, {recursive: true});

const synth = (voiceId, text, settings, outFile) => {
  const body = path.join(TMP, `${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(body, JSON.stringify({text, model_id: CAST.model, voice_settings: settings}));
  execFileSync('curl', ['-sS', '-f', '--max-time', '120', '-X', 'POST',
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${CAST.format}`,
    '-H', 'Content-Type: application/json', '-H', 'Accept: audio/mpeg', '--data-binary', `@${body}`, '-o', outFile]);
  fs.rmSync(body, {force: true});
};

// Light test processing: compression and a little low end, no loudness pumping on short clips.
const process = (raw, out) =>
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af',
    'acompressor=threshold=-20dB:ratio=3:attack=10:release=120:makeup=2,equalizer=f=140:t=q:w=1:g=3,alimiter=limit=0.95',
    '-codec:a', 'libmp3lame', '-b:a', '192k', out]);

const index = {};
for (const role of ['narrator', 'ethan', 'gps']) {
  for (const cand of CAST.candidates[role]) {
    const slug = cand.name.split(' - ')[0].toLowerCase();
    // confirm the voice exists for this key before generating
    execFileSync('curl', ['-sS', '-f', `https://api.elevenlabs.io/v1/voices/${cand.voice_id}`, '-o', '/dev/null']);
    for (let take = 1; take <= 2; take++) {
      const raw = path.join(TMP, `${role}_${slug}_${take}.mp3`);
      synth(cand.voice_id, CAST.phrases[role], CAST.settings[role], raw);
      const out = path.join(OUT, `${role}_${slug}_${cand.voice_id}_take${take}.mp3`);
      process(raw, out);
      console.log('wrote', path.relative(ROOT, out));
    }
    index[`${role}:${slug}`] = {role, name: cand.name, voice_id: cand.voice_id, phrase: CAST.phrases[role]};
  }
}
fs.writeFileSync(path.join(OUT, 'candidates.json'), JSON.stringify(index, null, 2) + '\n');
console.log('CANDIDATES DONE');
