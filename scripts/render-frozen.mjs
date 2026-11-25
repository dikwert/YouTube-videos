// Финальный рендер части серии «−20. ЗАПЕРТ В ФУРЕ»: 1080x1920, 30 fps, H.264 + AAC.
// Usage: node scripts/render-frozen.mjs <composition-id> <out-file>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [compId, outFile] = process.argv.slice(2);
fs.mkdirSync(path.dirname(outFile), {recursive: true});
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});
const composition = await selectComposition({serveUrl, id: compId, inputProps: {}, browserExecutable});
const started = Date.now();
await renderMedia({
  composition, serveUrl, codec: 'h264', outputLocation: outFile, browserExecutable,
  crf: 16, pixelFormat: 'yuv420p', imageFormat: 'png', colorSpace: 'bt709', audioCodec: 'aac',
  concurrency: 2, overwrite: true,
});
console.log(`wrote ${outFile} in ${Math.round((Date.now() - started) / 1000)}s`);
