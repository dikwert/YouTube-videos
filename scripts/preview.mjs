// Renders PNG stills of a composition at chosen frames, bundling once.
// Usage: node scripts/preview.mjs <CompositionId> <outDir> <frame> [frame...]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, outDir, ...frames] = process.argv.slice(2);
if (!id || !outDir || frames.length === 0) {
  console.error('usage: node scripts/preview.mjs <CompositionId> <outDir> <frame...>');
  process.exit(1);
}
fs.mkdirSync(outDir, {recursive: true});
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});
const composition = await selectComposition({serveUrl, id, inputProps: {}, browserExecutable});
for (const fr of frames) {
  const output = path.join(outDir, `${id}_f${String(fr).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame: Number(fr), imageFormat: 'png', browserExecutable});
  console.log('wrote', output);
}
