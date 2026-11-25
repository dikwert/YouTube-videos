#!/usr/bin/env python3
"""Собирает таймлайн части: время каждой строки, слова с таймкодами, общий звук речи.

  python3 frozen-series/build_timeline.py 1 [2 ...]
Пишет frozen-series/out/part{n}_voice.wav и src/frozen/data/part{n}.json.
"""
import base64
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from parts import PARTS  # noqa: E402
from voice import classify  # noqa: E402

SR = 48000
TAKES = ROOT / 'takes'
OUT = ROOT / 'out'
DATA = ROOT.parent / 'src' / 'frozen' / 'data'
RECAP_HOLD = 2.5   # seconds the recap text stays on screen before the voice starts
SPEED = 1.12      # each take is sped up (pitch kept), so the pauses between phrases can breathe
TARGET = (55.0, 65.0)
TOTAL_TARGET = 64.0  # the pauses are fitted so that the whole part lands here


def pause_after(text, role, next_role):
    if next_role is None:
        return 0.0
    p = 0.25
    if re.search(r'[.!?…]["»”]?$|\.\.\.$', text):
        p = 0.45
    if role != next_role:
        p = max(p, 0.6)
    return p


def load_line(n, i):
    d = json.loads((TAKES / f'p{n}_{i:03d}.json').read_text(encoding='utf-8'))
    al = d['alignment']
    chars = al['characters']
    starts = al['character_start_times_seconds']
    ends = al['character_end_times_seconds']
    words, cur = [], None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur is not None:
                words.append(cur)
                cur = None
            continue
        if cur is None:
            cur = {'w': '', 's': s, 'e': e}
        cur['w'] += ch
        cur['e'] = e
    if cur is not None:
        words.append(cur)
    t0 = starts[0] if starts else 0.0
    dur = (ends[-1] - t0) if ends else 0.0
    for w in words:
        w['s'] = (w['s'] - t0) / SPEED
        w['e'] = (w['e'] - t0) / SPEED
    dur = dur / SPEED
    audio = base64.b64decode(d['audio_base64'])
    return words, dur, audio


def decode(mp3):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-af', f'atempo={SPEED}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', 'pipe:1'],
                         input=mp3, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def plan_scale(n, segs):
    """Pauses scaled so the part lands near 60 s: speech is never cut, only the silences shrink."""
    voiced = [s for s in segs if s['role'] != 'recap']
    speech = 0.0
    base_pauses = 0.0
    for k, s in enumerate(voiced):
        _, dur, _ = load_line(n, s['i'])
        speech += dur
        nxt = voiced[k + 1]['role'] if k + 1 < len(voiced) else None
        base_pauses += pause_after(s['text'], s['role'], nxt)
    recap = RECAP_HOLD if any(s['role'] == 'recap' for s in segs) else 0.0
    want = TOTAL_TARGET - recap - speech
    scale = max(0.25, min(1.6, want / base_pauses)) if base_pauses > 0 else 1.0
    return scale, speech, base_pauses


def build(n, pause_scale=None):
    segs = []
    lines = [l.strip() for l in PARTS[n].splitlines() if l.strip()]
    for i, l in enumerate(lines):
        role, text = classify(l)
        segs.append({'i': i, 'role': role, 'text': text})
    voiced = [s for s in segs if s['role'] != 'recap']
    has_recap = any(s['role'] == 'recap' for s in segs)
    if pause_scale is None:
        pause_scale, speech, base = plan_scale(n, segs)
        print(f'часть {n}: речь {speech:.1f} с, паузы {base:.1f} с -> масштаб пауз {pause_scale:.2f}')
    t = RECAP_HOLD if has_recap else 0.0
    audio_total = int(round(70 * SR))
    voice = np.zeros(audio_total)
    out_lines = []
    recap_text = next((s['text'] for s in segs if s['role'] == 'recap'), None)
    for k, s in enumerate(voiced):
        words, dur, mp3 = load_line(n, s['i'])
        x = decode(mp3)[:int(round((dur + 0.05) * SR))]  # cut the tail after the last letter, keep 50 ms
        # trim the audio to the speech so the line sits exactly where the timeline says
        start_sample = int(round(t * SR))
        L = min(len(x), audio_total - start_sample)
        voice[start_sample:start_sample + L] += x[:L]
        nxt = voiced[k + 1]['role'] if k + 1 < len(voiced) else None
        p = pause_after(s['text'], s['role'], nxt) * pause_scale
        out_lines.append({'i': s['i'], 'role': s['role'], 'text': s['text'], 'start': round(t, 3),
                          'end': round(t + dur, 3), 'words': [{'w': w['w'], 's': round(t + w['s'], 3), 'e': round(t + w['e'], 3)} for w in words]})
        t += dur + p
    total = t
    voice = voice[:int(round((total + 0.5) * SR))]
    OUT.mkdir(exist_ok=True)
    DATA.mkdir(parents=True, exist_ok=True)
    wav = OUT / f'part{n}_voice.wav'
    import wave
    with wave.open(str(wav), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(voice, -1, 1) * 32767).astype('<i2').tobytes())
    data = {'part': n, 'duration': round(total, 3), 'recap': recap_text, 'recap_hold': RECAP_HOLD if has_recap else 0.0,
            'lines': out_lines}
    (DATA / f'part{n}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'часть {n}: строк {len(out_lines)}, длина {total:.2f} с (цель {TARGET[0]}–{TARGET[1]}), голос -> {wav.name}')
    return data


if __name__ == '__main__':
    for arg in sys.argv[1:]:
        build(int(arg))
