// Финальный рендер короткометражки: каждая сцена — отдельный mp4 с одинаковыми настройками,
// затем склейка без перекодирования (-c copy) и наложение звука (-c:v copy).
// Usage: node scripts/render-short.mjs <compositionId> <timeline.json> <mix.wav> <out.mp4> [scale]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// по умолчанию масштаб 1440/1080: 1080x1920 → ровно 1440x2560 (1.3333 даёт нецелую высоту и падает)
const [compId, tlArg, mixArg, outArg, scaleArg = String(1440 / 1080)] = process.argv.slice(2);
const timeline = JSON.parse(fs.readFileSync(path.resolve(tlArg), 'utf8'));
const outFile = path.resolve(outArg);
const scale = Number(scaleArg);
const segDir = path.join(ROOT, 'late-short', 'segments');
fs.mkdirSync(segDir, {recursive: true});
fs.mkdirSync(path.dirname(outFile), {recursive: true});
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), onProgress: () => {}});
const composition = await selectComposition({serveUrl, id: compId, inputProps: {}, browserExecutable});
const outW = composition.width * scale, outH = composition.height * scale;
if (!Number.isInteger(outW) || !Number.isInteger(outH)) throw new Error(`масштаб ${scale} даёт нецелый размер ${outW}x${outH}`);
const fps = composition.fps;
const segments = [];
for (let i = 0; i < timeline.shots.length; i++) {
  const sh = timeline.shots[i];
  const from = Math.round(sh.start * fps);
  const to = Math.min(composition.durationInFrames, Math.round(sh.end * fps));
  const file = path.join(segDir, `${String(i).padStart(2, '0')}_${sh.id}.mp4`);
  await renderMedia({
    composition, serveUrl, codec: 'h264', outputLocation: file, browserExecutable,
    crf: 16, pixelFormat: 'yuv420p', imageFormat: 'png', colorSpace: 'bt709',
    frameRange: [from, to - 1], muted: true, concurrency: 2, overwrite: true, scale,
  });
  segments.push(file);
  console.log('сцена', sh.id, from, to - 1);
}
const list = path.join(segDir, 'list.txt');
fs.writeFileSync(list, segments.map((f) => `file '${f}'`).join('\n'));
const video = path.join(segDir, 'video.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-i', path.resolve(mixArg), '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', outFile]);
console.log('wrote', outFile);
