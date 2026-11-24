// Renders JanitorShort stills at the given frames (30 fps; frame = second x 30), 1080x1920 PNG.
// Usage: node scripts/janitor-stills.mjs <outDir> <frame> [frame...]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outDir, ...frames] = process.argv.slice(2);
if (!outDir || frames.length === 0) throw new Error('usage: node scripts/janitor-stills.mjs <outDir> <frame> [frame...]');
fs.mkdirSync(outDir, {recursive: true});

const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});
const composition = await selectComposition({serveUrl, id: 'JanitorShort', inputProps: {}, browserExecutable});

for (const f of frames.map(Number)) {
  const output = path.join(outDir, `JanitorShort_f${String(f).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame: f, imageFormat: 'png', browserExecutable});
  console.log('wrote', output);
}
