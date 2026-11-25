#!/usr/bin/env python3
"""Звук части: чистый голос с лёгкой обработкой и тихая комната, без гула.

  python3 frozen-series/mix.py 1 [2 ...]

Раньше под голосом шли гул 50 Гц с гармониками и шипящий ветер (около −38 dBFS в каждой паузе, слышно как фон).
Теперь: голос очищен фильтрами (срез низов, мягкая эквализация, компрессор), под ним комнатный шум около −66 dBFS
(почти не слышен, но без цифровой тишины между фразами) и глухие удары только там, где они есть в сценах.
Нормализация −16 LUFS, пик −1.5 dBTP. Пишет public/frozen/part{n}_mix.wav (генерируется, в git не попадает).
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000

VOICE_CHAIN = ','.join([
    'highpass=f=90',                                                      # без рокота ниже 90 Гц
    'equalizer=f=250:t=q:w=1.0:g=-2',                                     # меньше «коробки» в голосе
    'equalizer=f=3500:t=q:w=1.2:g=2',                                     # разборчивость
    'acompressor=threshold=0.1:ratio=3:attack=5:release=120:makeup=1.25',  # ровный уровень фраз
])


def clean_voice(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-af', VOICE_CHAIN,
                          '-ar', str(SR), '-ac', '1', '-f', 'f32le', 'pipe:1'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def room_tone(total, seed, level_db=-74.0):
    """Комнатный шум: белый шум со срезом около 1 кГц, очень тихо."""
    rng = np.random.default_rng(seed)
    x = np.convolve(rng.normal(0, 1, total), np.ones(48) / 48, mode='same')
    return x * (10 ** (level_db / 20) / np.sqrt(np.mean(x ** 2)))


def thumps(total, scenes):
    """Глухие удары в сценах с эффектом knock и shake: короткий низкий импульс."""
    out = np.zeros(total)
    for s in scenes:
        if s['fx'] in ('knock', 'shake'):
            step = 0.9 if s['fx'] == 'knock' else 1.4
            amp = 0.05 if s['fx'] == 'knock' else 0.035
            for k in np.arange(s['start'], s['end'], step):
                i0, L = int(k * SR), int(0.5 * SR)
                if i0 + L < total:
                    tt = np.arange(L) / SR
                    out[i0:i0 + L] += amp * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 9)
    return out


def build(n):
    data = json.loads((ROOT / 'src' / 'frozen' / 'data' / f'part{n}_full.json').read_text(encoding='utf-8'))
    total = int(round(data['duration'] * SR))
    v = clean_voice(ROOT / 'frozen-series' / 'out' / f'part{n}_voice.wav')
    v = np.concatenate([v, np.zeros(max(0, total - len(v)))])[:total]
    mix = v + room_tone(total, seed=n) + thumps(total, data['scenes'])
    peak = np.max(np.abs(mix))
    if peak > 0.95:
        mix = mix * (0.95 / peak)
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
