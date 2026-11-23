// Renders PilotShort: the final MP4 (out/pilot_short.mp4, 1440x2560, 30 fps) and the cover (out/pilot_cover.png, 1080x1920).
// Usage: node scripts/render-pilot.mjs video
//        node scripts/render-pilot.mjs cover [frame]   (default frame 30 = 1.0 s, inside the hook)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const [mode = 'video', frameArg] = process.argv.slice(2);
fs.mkdirSync(OUT, {recursive: true});

const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});

if (mode === 'cover') {
  const composition = await selectComposition({serveUrl, id: 'PilotCover', inputProps: {}, browserExecutable});
  const output = path.join(OUT, 'pilot_cover.png');
  await renderStill({
    composition,
    serveUrl,
    output,
    frame: Number(frameArg ?? 30),
    imageFormat: 'png',
    browserExecutable,
  });
  console.log('wrote', output);
} else if (mode === 'video') {
  const started = Date.now();
  const composition = await selectComposition({serveUrl, id: 'PilotShort', inputProps: {}, browserExecutable});
  const outputLocation = path.join(OUT, 'pilot_short.mp4');
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    browserExecutable,
    scale: 4 / 3,
    concurrency: 4,
    crf: 16,
    pixelFormat: 'yuv420p',
    imageFormat: 'jpeg',
    jpegQuality: 92,
    audioCodec: 'aac',
    overwrite: true,
    onProgress: ({renderedFrames}) => {
      const pct = Math.floor((renderedFrames / composition.durationInFrames) * 100);
      if (pct >= last + 10) {
        last = pct;
        console.log(`pilot: ${pct}%`);
      }
    },
  });
  console.log(`wrote ${outputLocation} in ${Math.round((Date.now() - started) / 1000)}s`);
} else {
  throw new Error(`unknown mode: ${mode} (use video or cover)`);
}
