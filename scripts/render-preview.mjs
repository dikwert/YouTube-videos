// Renders one composition to MP4 without audio: a watchable preview for checking motion and timing.
// Usage: node scripts/render-preview.mjs <CompositionId> <outputPath>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, outArg] = process.argv.slice(2);
if (!id || !outArg) {
  console.error('usage: node scripts/render-preview.mjs <CompositionId> <outputPath>');
  process.exit(1);
}
const outputLocation = path.resolve(ROOT, outArg);
fs.mkdirSync(path.dirname(outputLocation), {recursive: true});

const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});
const composition = await selectComposition({serveUrl, id, inputProps: {}, browserExecutable});

const started = Date.now();
let last = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation,
  browserExecutable,
  concurrency: 4,
  crf: 20,
  pixelFormat: 'yuv420p',
  imageFormat: 'jpeg',
  jpegQuality: 90,
  overwrite: true,
  onProgress: ({renderedFrames}) => {
    const pct = Math.floor((renderedFrames / composition.durationInFrames) * 100);
    if (pct >= last + 10) {
      last = pct;
      console.log(`${id}: ${pct}%`);
    }
  },
});
console.log(`wrote ${outputLocation} in ${Math.round((Date.now() - started) / 1000)}s`);
