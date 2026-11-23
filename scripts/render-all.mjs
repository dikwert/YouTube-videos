// Renders the Shorts (out/partN.mp4) and their covers (out/partN_cover.png).
// Usage: node scripts/render-all.mjs [parts|covers|all] [partNumber...]   (default: Part 1 only)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const [mode = 'all', ...only] = process.argv.slice(2);
const wanted = only.length ? only.map(Number) : [1];
fs.mkdirSync(OUT, {recursive: true});

const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});

if (mode === 'all' || mode === 'parts') {
  for (const n of wanted) {
    const started = Date.now();
    const composition = await selectComposition({serveUrl, id: `Part${n}`, inputProps: {}, browserExecutable});
    const outputLocation = path.join(OUT, `part${n}.mp4`);
    let last = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation,
      browserExecutable,
      concurrency: 4,
      crf: 18,
      pixelFormat: 'yuv420p',
      imageFormat: 'jpeg',
      jpegQuality: 92,
      audioCodec: 'aac',
      overwrite: true,
      onProgress: ({renderedFrames}) => {
        const pct = Math.floor((renderedFrames / composition.durationInFrames) * 100);
        if (pct >= last + 10) {
          last = pct;
          console.log(`part${n}: ${pct}%`);
        }
      },
    });
    console.log(`wrote ${outputLocation} in ${Math.round((Date.now() - started) / 1000)}s`);
  }
}

if (mode === 'all' || mode === 'covers') {
  for (const n of wanted) {
    const composition = await selectComposition({serveUrl, id: `Cover${n}`, inputProps: {}, browserExecutable});
    const output = path.join(OUT, `part${n}_cover.png`);
    await renderStill({composition, serveUrl, output, frame: 0, imageFormat: 'png', browserExecutable});
    console.log('wrote', output);
  }
}
