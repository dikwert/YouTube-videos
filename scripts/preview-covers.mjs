// Renders the five cover stills (Cover1..Cover5) to a directory for review.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.argv[2] ?? path.join(ROOT, 'out');
fs.mkdirSync(outDir, {recursive: true});
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});
for (let n = 1; n <= 5; n++) {
  const id = `Cover${n}`;
  const composition = await selectComposition({serveUrl, id, inputProps: {}, browserExecutable});
  const output = path.join(outDir, `part${n}_cover.png`);
  await renderStill({composition, serveUrl, output, frame: 0, imageFormat: 'png', browserExecutable});
  console.log('wrote', output);
}
