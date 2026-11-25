// Кадры части серии «−20. ЗАПЕРТ В ФУРЕ» для контрольного листа: каждые 2 секунды, 1080x1920.
// Usage: node scripts/render-frozen-stills.mjs <composition-id> <outDir> <seconds-step>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [compId, outDir, stepArg = '2'] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});
const composition = await selectComposition({serveUrl, id: compId, inputProps: {}, browserExecutable});
const fps = composition.fps;
const step = Number(stepArg);
for (let s = 0; s * fps < composition.durationInFrames; s += step) {
  const frame = Math.round(s * fps);
  const output = path.join(outDir, `f_${String(s).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, imageFormat: 'png', browserExecutable});
}
console.log('done', compId, composition.durationInFrames, 'frames');
