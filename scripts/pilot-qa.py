#!/usr/bin/env python3
# QA for the final PilotShort MP4: format, every frame for black, white and frozen runs, loudness.
# Usage: python3 scripts/pilot-qa.py [out/pilot_short.mp4]
# Writes the report to out/pilot_qa.txt and exits 1 if any check fails.
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MP4 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out', 'pilot_short.mp4')
REPORT = os.path.join(ROOT, 'out', 'pilot_qa.txt')
FLASH = (2.0, 2.3)  # the intended white flash after the hook
FREEZE_RUN = 12  # frozen run length in frames that is flagged (0.4 s at 30 fps)
EXPECT_W, EXPECT_H, EXPECT_FPS = 1440, 2560, 30
EXPECT_DUR = 67.6


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def main():
    lines, failed = [], False

    def say(s):
        lines.append(s)
        print(s)

    # 1. Format
    probe = json.loads(run(['ffprobe', '-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', MP4]).stdout)
    v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    a = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)
    fps_num, fps_den = (int(x) for x in v['r_frame_rate'].split('/'))
    dur = float(probe['format']['duration'])
    ok_fmt = (v['width'], v['height']) == (EXPECT_W, EXPECT_H) and fps_num / fps_den == EXPECT_FPS
    failed |= not ok_fmt
    say(f'format: {v["width"]}x{v["height"]} {fps_num}/{fps_den} fps, duration {dur:.2f} s -> {"OK" if ok_fmt else "FAIL"}')
    if a is None:
        failed = True
        say('audio: NO AUDIO STREAM -> FAIL')
    else:
        say(f'audio: {a["codec_name"]} {a["sample_rate"]} Hz, {a["channels"]} ch -> OK')
    if abs(dur - EXPECT_DUR) > 0.2:
        failed = True
        say(f'duration differs from {EXPECT_DUR} s by more than 0.2 s -> FAIL')

    # 2. Every frame: luma range and frame-to-frame difference
    filt = f'movie={MP4},signalstats'
    raw = run(['ffprobe', '-v', 'error', '-f', 'lavfi', '-i', filt, '-show_frames', '-show_entries',
               'frame=pts_time:frame_tags=lavfi.signalstats.YMIN,lavfi.signalstats.YMAX,lavfi.signalstats.YDIF',
               '-of', 'json']).stdout
    frames = json.loads(raw).get('frames', [])
    say(f'frames analysed: {len(frames)}')
    black, white, frozen = [], [], []
    run_len, run_start = 0, None
    for fr in frames:
        t = float(fr['pts_time'])
        tags = fr.get('tags', {})
        ymin = float(tags.get('lavfi.signalstats.YMIN', 0))
        ymax = float(tags.get('lavfi.signalstats.YMAX', 255))
        ydif = float(tags.get('lavfi.signalstats.YDIF', 1))
        in_flash = FLASH[0] <= t <= FLASH[1]
        if not in_flash:
            if ymax < 20:
                black.append(t)
            if ymin > 235:
                white.append(t)
        if ydif == 0:
            if run_len == 0:
                run_start = t
            run_len += 1
        else:
            if run_len >= FREEZE_RUN:
                frozen.append((run_start, run_len))
            run_len = 0
    if run_len >= FREEZE_RUN:
        frozen.append((run_start, run_len))

    def spans(ts):
        out, start, prev = [], None, None
        for t in ts:
            if start is None:
                start = prev = t
            elif t - prev > 0.05:
                out.append((start, prev))
                start = t
            prev = t
        if start is not None:
            out.append((start, prev))
        return out

    bl, wh = spans(black), spans(white)
    if bl:
        failed = True
        say('black frames: ' + ', '.join(f'{a:.2f}-{b:.2f} s' for a, b in bl) + ' -> FAIL')
    else:
        say('black frames: none outside the hook flash -> OK')
    if wh:
        failed = True
        say('white frames: ' + ', '.join(f'{a:.2f}-{b:.2f} s' for a, b in wh) + ' -> FAIL')
    else:
        say('white frames: none outside the hook flash -> OK')
    if frozen:
        failed = True
        say('frozen runs (>= ' + str(FREEZE_RUN) + ' frames): ' + ', '.join(f'{s:.2f} s x{n}' for s, n in frozen) + ' -> FAIL')
    else:
        say(f'frozen runs: none of {FREEZE_RUN} frames or more -> OK')

    # 3. Loudness (EBU R128) and true peak
    ebu = run(['ffmpeg', '-nostats', '-hide_banner', '-i', MP4, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-']).stderr
    integrated = re.findall(r'I:\s+(-?[\d.]+) LUFS', ebu)
    lra = re.findall(r'LRA:\s+([\d.]+) LU', ebu)
    peak = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', ebu)
    if integrated:
        say(f'loudness: integrated {integrated[-1]} LUFS, LRA {lra[-1] if lra else "?"} LU, true peak {peak[-1] if peak else "?"} dBFS (target -14 LUFS, peak <= -1 dBFS)')
        if peak and float(peak[-1]) > -1.0:
            failed = True
            say('true peak above -1 dBFS -> FAIL')
    else:
        failed = True
        say('loudness: ebur128 gave no result -> FAIL')

    say('RESULT: ' + ('FAIL' if failed else 'PASS'))
    with open(REPORT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
