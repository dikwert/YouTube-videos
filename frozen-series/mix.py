#!/usr/bin/env python3
"""Звук части: голос + гул компрессора, ветер и глухие удары по сценам; нормализация −16 LUFS, пик −1.5 dBTP.

  python3 frozen-series/mix.py 1
Пишет public/frozen/part{n}_mix.wav (генерируется, в git не попадает).
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000


def build(n):
    data = json.loads((ROOT / 'src' / 'frozen' / 'data' / f'part{n}_full.json').read_text(encoding='utf-8'))
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(ROOT / 'frozen-series' / 'out' / f'part{n}_voice.wav'),
                          '-ac', '1', '-ar', str(SR), '-f', 'f32le', 'pipe:1'], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    total = int(round(data['duration'] * SR))
    v = np.concatenate([v, np.zeros(max(0, total - len(v)))])[:total]
    t = np.arange(total) / SR
    rng = np.random.default_rng(n)
    hum = sum(np.sin(2 * np.pi * f * t + k) * (0.6 / (i + 1)) for i, (f, k) in enumerate([(50, 0.0), (100, 1.0), (150, 2.0), (200, 0.5)]))
    hum *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * t)
    wind = np.convolve(rng.normal(0, 1, total), np.ones(64) / 64, mode='same') * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t))
    amb = 0.05 * hum + 0.03 * wind
    for s in data['scenes']:
        if s['fx'] in ('knock', 'shake'):
            step = 0.9 if s['fx'] == 'knock' else 1.4
            for k in np.arange(s['start'], s['end'], step):
                i0, L = int(k * SR), int(0.5 * SR)
                if i0 + L < total:
                    tt = np.arange(L) / SR
                    amb[i0:i0 + L] += 0.35 * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 9) * (0.6 if s['fx'] == 'shake' else 1.0)
    # ambience sits about 18 dB under the voice
    gain = 10 ** (-18 / 20) * np.sqrt(np.mean(v ** 2)) / max(1e-9, np.sqrt(np.mean(amb ** 2)))
    mix = v + amb * gain
    mix = mix / max(1.0, np.max(np.abs(mix)))
    tmp = ROOT / 'out' / f'part{n}_mix_raw.wav'
    tmp.parent.mkdir(exist_ok=True)
    with wave.open(str(tmp), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    dest = ROOT / 'public' / 'frozen' / f'part{n}_mix.wav'
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', str(dest)], check=True)
    print('mix', dest)


if __name__ == '__main__':
    for a in sys.argv[1:]:
        build(int(a))
