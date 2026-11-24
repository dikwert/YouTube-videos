#!/usr/bin/env python3
"""Fits the narration takes to the existing picture timeline, word by word.

Every word of every take is time-stretched (0.85 to 1.18, pitch kept) into the slot its word has in the
timeline the shots, sound effects and subtitles were built on (janitor-short/voice/words.json). The gaps
between words are rebuilt as silence, so word onsets land on their old times and no scene moves.

Usage:
  python3 scripts/janitor-voice-warp.py --test    writes out/voice_warp_test.wav and prints the fit statistics
  python3 scripts/janitor-voice-warp.py           writes public/audio/janitor/voice.wav and voice/words.json
                                                  (only when all 193 words have a take)
Takes: janitor-short/voice/takes/p{i}_t0.json, one per paragraph (from scripts/janitor-voice2.mjs).
"""
import base64
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
VOICE_DIR = ROOT / 'janitor-short' / 'voice'
TAKES = VOICE_DIR / 'takes'
OLD_WORDS = VOICE_DIR / 'words.json'  # the timeline the picture was built on
SCRIPT = VOICE_DIR / 'script.txt'
PAD = 0.02  # margin kept around each word
MIN_S, MAX_S = 0.85, 1.18
TOTAL = 66.0


def decode(mp3):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-af', 'aresample=resampler=soxr',
                          '-f', 'f32le', '-ac', '1', '-ar', str(SR), 'pipe:1'],
                         input=mp3, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def stretch(x, tempo):
    """tempo > 1 shortens the clip, tempo < 1 lengthens it; the pitch is kept."""
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0',
                          '-af', f'atempo={tempo:.5f}', '-f', 'f32le', '-ar', str(SR), '-ac', '1', 'pipe:1'],
                         input=x.astype('<f4').tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def take_words(i):
    p = TAKES / f'p{i}_t0.json'
    if not p.exists():
        return None
    d = json.loads(p.read_text(encoding='utf-8'))
    al = d['alignment']
    words, cur = [], None
    for c, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if c.isspace():
            if cur:
                words.append(cur)
                cur = None
            continue
        if cur is None:
            cur = {'w': '', 's': s, 'e': e}
        cur['w'] += c
        cur['e'] = e
    if cur:
        words.append(cur)
    audio = decode(base64.b64decode(d['audio_base64']))
    return words, audio


def fade(x, n=int(0.010 * SR)):
    n = min(n, len(x) // 2)
    if n > 0:
        ramp = np.linspace(0.0, 1.0, n)
        x[:n] *= ramp
        x[-n:] *= ramp[::-1]
    return x


def main(test):
    paras = [p.split() for p in re.split(r'\n\s*\n', SCRIPT.read_text(encoding='utf-8').strip()) if p.strip()]
    counts = [len(p) for p in paras]
    old = json.loads(OLD_WORDS.read_text(encoding='utf-8'))
    old = old if isinstance(old, list) else old['words']
    assert len(old) == sum(counts), (len(old), sum(counts))
    OS = np.array([w['s'] for w in old])
    OE = np.array([w['e'] for w in old])
    N = int(round(TOTAL * SR))
    out = np.zeros(N)
    new_end = OE.copy()
    factors, onset_err, clamped, placed = [], [], 0, []
    k0 = 0
    for i, n in enumerate(counts):
        take = take_words(i)
        if take is None:
            k0 += n
            continue
        words, audio = take
        if len(words) != n:
            raise SystemExit(f'paragraph {i}: take has {len(words)} words, script has {n}')
        for j in range(n):
            k = k0 + j
            ns, ne = words[j]['s'], words[j]['e']
            in0 = max(0.0, ns - PAD)
            in1 = min(len(audio) / SR, ne + PAD)
            x_in = audio[int(in0 * SR):int(in1 * SR)]
            w_in = len(x_in) / SR
            w_old = (OE[k] + PAD) - (OS[k] - PAD)
            slot0 = max(0.0, OS[k] - PAD)
            slot1 = (OS[k + 1] - PAD) if k + 1 < len(OS) else TOTAL
            s_factor = float(np.clip(w_old / w_in, MIN_S, MAX_S))
            room = (slot1 - slot0) - 0.02
            if s_factor * w_in > room:
                s_factor = max(MIN_S, room / w_in)
            if s_factor in (MIN_S, MAX_S) or abs(s_factor - MIN_S) < 1e-9 or abs(s_factor - MAX_S) < 1e-9:
                clamped += 1
            y = stretch(x_in, 1.0 / s_factor)
            target = int(round(s_factor * w_in * SR))
            y = y[:target] if len(y) >= target else np.pad(y, (0, target - len(y)))
            y = fade(y)
            a = int(round(slot0 * SR))
            out[a:a + len(y)] += y[:max(0, N - a)]
            peak = np.max(np.abs(y)) if len(y) else 0.0
            onset = np.argmax(np.abs(y) > 0.05 * peak) / SR if peak > 0 else 0.0
            onset_err.append((slot0 + onset) - OS[k] + PAD)
            factors.append(s_factor)
            new_end[k] = OS[k] + (ne - ns) * s_factor
            placed.append(k)
        k0 += n
    factors = np.array(factors)
    onset_err = np.array(onset_err) * 1000.0
    print(f'words placed: {len(placed)} of {len(old)}')
    if placed:
        print(f'stretch factor: min {factors.min():.3f}  median {np.median(factors):.3f}  max {factors.max():.3f}')
        print(f'words held at the 0.85 or 1.18 limit: {clamped}')
        print(f'onset error (ms): median {np.median(np.abs(onset_err)):.1f}  max {np.max(np.abs(onset_err)):.1f}')
    if test:
        out_path = ROOT / 'out' / 'voice_warp_test.wav'
        out_path.parent.mkdir(parents=True, exist_ok=True)
    else:
        if len(placed) != len(old):
            raise SystemExit('not all 193 words have a take: nothing written')
        out_path = ROOT / 'public' / 'audio' / 'janitor' / 'voice.wav'
    import wave
    peak = np.max(np.abs(out)) or 1.0
    with wave.open(str(out_path), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(out / max(peak, 1.0), -1, 1) * 32767).astype('<i2').tobytes())
    print('wrote', out_path)
    if not test:
        words_out = [{'w': w['w'], 's': round(float(OS[k]), 3), 'e': round(float(new_end[k]), 3)}
                     for k, w in enumerate(old)]
        (VOICE_DIR / 'words.json').write_text(json.dumps(words_out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print('wrote voice/words.json')


if __name__ == '__main__':
    main('--test' in sys.argv)
