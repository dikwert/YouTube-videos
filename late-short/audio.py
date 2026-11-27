#!/usr/bin/env python3
"""Звук «The Town Where Everyone Must Be Late»: тиканье часов по всей длине, колокол, сирены, всплеск кофе,
гавел, хлопки, шорох мела, лёгкая пиццикато-музыка под голосом.

  python3 late-short/audio.py

Голос — late-short/voice/voice.wav (не меняется). Музыка +3 дБ относительно базовой громкости,
эффекты −6 дБ относительно базовой. Под голосом музыка приглушается. Пишет public/late/mix.wav (моно 48 кГц),
громкость −16 LUFS, пик −1.5 dBTP.
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
RNG = np.random.default_rng(11)
MUSIC_BASE_DB = -24.0   # базовая громкость музыки до наложения (+3 дБ = -21 дБ)
FX_BASE = 0.5           # базовый уровень эффектов (−6 дБ к нему применяется ниже)
DUCK_DB = 6.0


def noise_burst(dur, tau, lowpass=0.0, amp=1.0):
    n = int(dur * SR)
    x = RNG.normal(0, 1, n)
    if lowpass > 0:
        w = max(1, int(SR / (2 * lowpass)))
        x = np.convolve(x, np.ones(w) / w, mode='same')
    t = np.arange(n) / SR
    x = x * np.exp(-t / tau) * np.minimum(1.0, t / 0.002)
    return amp * x / max(1e-9, np.max(np.abs(x)))


def addp(a, b):
    n = max(a.size, b.size)
    return np.pad(a, (0, n - a.size)) + np.pad(b, (0, n - b.size))


def pluck(f, dur, amp, tau=0.16):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    return amp * s * np.exp(-t / tau) * np.minimum(1.0, t / 0.004)


def music(total):
    """Весёлое пиццикато в до-мажоре: C – Am – F – G, восьмые на 124 BPM, бас на доле."""
    out = np.zeros(total)
    eighth = 60 / 124 / 2
    chords = [(261.63, [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 329.63]),
              (220.00, [220.00, 261.63, 329.63, 440.00, 329.63, 261.63, 220.00, 261.63]),
              (174.61, [174.61, 220.00, 261.63, 349.23, 261.63, 220.00, 174.61, 220.00]),
              (196.00, [196.00, 246.94, 293.66, 392.00, 293.66, 246.94, 196.00, 246.94])]
    bar = eighth * 8
    t = 0.0
    k = 0
    while t < total / SR:
        root, notes = chords[k % 4]
        for i, f in enumerate(notes):
            start = int((t + i * eighth) * SR)
            if start < total:
                p = pluck(f * (1 + RNG.uniform(-0.002, 0.002)), 0.45, 0.08)
                end = min(total, start + p.size)
                out[start:end] += p[:end - start]
        b0 = int(t * SR)
        if b0 < total:
            tt = np.arange(min(int(1.0 * SR), total - b0)) / SR
            out[b0:b0 + tt.size] += 0.15 * np.sin(2 * np.pi * (root / 2) * tt) * np.exp(-tt / 0.5)
        t += bar
        k += 1
    return out


def sfx(name):
    if name == 'tick':
        n = int(0.03 * SR)
        t = np.arange(n) / SR
        return addp(0.25 * np.sin(2 * np.pi * 2200 * t) * np.exp(-t / 0.008), noise_burst(0.01, 0.006, lowpass=4000, amp=0.2))
    if name == 'bell':
        n = int(1.8 * SR)
        t = np.arange(n) / SR
        return 0.35 * (np.sin(2 * np.pi * 880 * t) + 0.5 * np.sin(2 * np.pi * 1760 * t) + 0.25 * np.sin(2 * np.pi * 2640 * t)) * np.exp(-t / 0.9)
    if name == 'ding':
        n = int(1.0 * SR)
        t = np.arange(n) / SR
        return 0.3 * (np.sin(2 * np.pi * 1320 * t) + 0.4 * np.sin(2 * np.pi * 1980 * t)) * np.exp(-t / 0.4)
    if name == 'splash':
        return noise_burst(1.0, 0.28, lowpass=3000, amp=0.6)
    if name == 'sirens':
        n = int(1.5 * SR)
        t = np.arange(n) / SR
        f = 950 + 260 * np.sin(2 * np.pi * 0.9 * t)
        ph = 2 * np.pi * np.cumsum(f) / SR
        return 0.16 * np.sin(ph) * np.minimum(1.0, t / 0.05) * np.exp(-np.maximum(0.0, t - 1.2) / 0.2)
    if name == 'gasp':
        n = int(0.5 * SR)
        t = np.arange(n) / SR
        env = np.minimum(1.0, t / 0.15) * np.exp(-np.maximum(0.0, t - 0.15) / 0.2)
        x = RNG.normal(0, 1, n)
        w = max(1, int(SR / (2 * 2000)))
        x = np.convolve(x, np.ones(w) / w, mode='same')
        return 0.25 * env * x / max(1e-9, np.max(np.abs(x)))
    if name == 'gavel':
        n = int(0.3 * SR)
        t = np.arange(n) / SR
        return addp(0.7 * np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.05), noise_burst(0.03, 0.01, amp=0.6))
    if name == 'clap':
        out = np.zeros(int(0.35 * SR))
        for d in (0.0, 0.06, 0.12, 0.2):
            i0 = int(d * SR)
            b = noise_burst(0.05, 0.012, lowpass=5000, amp=0.5)
            out[i0:i0 + b.size] += b[:out.size - i0]
        return out
    if name == 'chalk':
        n = int(0.35 * SR)
        x = RNG.normal(0, 1, n)
        w = max(1, int(SR / (2 * 6000)))
        hp = x - np.convolve(x, np.ones(w) / w, mode='same')
        t = np.arange(n) / SR
        return 0.12 * hp * np.sin(np.pi * np.minimum(1.0, t / 0.35))
    if name == 'whoosh':
        n = int(0.6 * SR)
        t = np.arange(n) / SR
        x = RNG.normal(0, 1, n)
        w = max(1, int(SR / (2 * 1500)))
        x = np.convolve(x, np.ones(w) / w, mode='same')
        return 0.15 * x / max(1e-9, np.max(np.abs(x))) * np.sin(np.pi * np.minimum(1.0, t / 0.6))
    raise ValueError(name)


def main():
    tl = json.loads((ROOT / 'src' / 'videos' / 'late' / 'data' / 'timeline.json').read_text(encoding='utf-8'))
    total = int(round((tl['duration'] + 0.5) * SR))
    with wave.open(str(ROOT / 'late-short' / 'voice' / 'voice.wav'), 'rb') as wf:
        v = np.frombuffer(wf.readframes(wf.getnframes()), dtype='<i2').astype(np.float64) / 32768.0
    voice = np.zeros(total)
    voice[:min(total, v.size)] = v[:total]
    env = np.convolve(np.abs(voice), np.ones(int(0.08 * SR)) / int(0.08 * SR), mode='same')
    duck = np.convolve(np.clip(env / 0.03, 0, 1), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode='same')
    m = music(total)
    m *= 10 ** (MUSIC_BASE_DB / 20) / np.sqrt(np.mean(m ** 2))
    m *= 10 ** (3 / 20)                                  # музыка +3 дБ
    m *= 1.0 - (1.0 - 10 ** (-DUCK_DB / 20)) * duck      # приглушение под голосом
    fx = np.zeros(total)
    for ev in tl['sfx']:
        s = sfx(ev['name'])
        i0 = int(ev['t'] * SR)
        if i0 < total:
            j = min(total, i0 + s.size)
            fx[i0:j] += s[:j - i0]
    fx *= FX_BASE * 10 ** (-6 / 20)                      # эффекты −6 дБ
    mix = voice + m + fx
    peak = np.max(np.abs(mix))
    if peak > 0.95:
        mix *= 0.95 / peak
    tmp = ROOT / 'late-short' / 'out' / 'mix_raw.wav'
    tmp.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(tmp), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    dest = ROOT / 'public' / 'late' / 'mix.wav'
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', str(dest)], check=True)
    print('звук', dest)


if __name__ == '__main__':
    main()
