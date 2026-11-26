#!/usr/bin/env python3
"""Звук короткометражки: комедийная музыка (пиццикато) под голосом и звуковые эффекты по событиям.

  python3 harold-short/audio.py

Голос — harold-short/voice/voice.wav. Музыка сочинена кодом, эффекты синтезируются (стук штампа, кассовый звон,
искры, блеяние козы, удар молотка, звонок, «шшш», гудок, чихание, скрип, всплеск). Музыка приглушается под голосом.
Пишет public/harold/mix.wav (48 кГц, моно), громкость −16 LUFS, пик −1.5 dBTP применяется ffmpeg.
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
RNG = np.random.default_rng(7)


def addp(a, b):
    """Сложение двух сигналов разной длины (короткий дополняется нулями)."""
    n = max(a.size, b.size)
    return np.pad(a, (0, n - a.size)) + np.pad(b, (0, n - b.size))


def env_exp(n, tau):
    t = np.arange(n) / SR
    return np.exp(-t / tau)


def pluck(f, dur, amp, tau=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    return amp * s * np.exp(-t / tau) * np.minimum(1.0, t / 0.004)


def music(total):
    """Пиццикато в до-мажоре: C – Am – F – G, восьмые, бас на доле."""
    out = np.zeros(total)
    bpm = 116
    eighth = 60 / bpm / 2
    chords = [(261.63, [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 329.63]),
              (220.00, [220.00, 261.63, 329.63, 440.00, 329.63, 261.63, 220.00, 261.63]),
              (174.61, [174.61, 220.00, 261.63, 349.23, 261.63, 220.00, 174.61, 220.00]),
              (196.00, [196.00, 246.94, 293.66, 392.00, 293.66, 246.94, 196.00, 246.94])]
    bar = eighth * 8
    k = 0
    t = 0.0
    while t < total / SR:
        root, notes = chords[k % 4]
        for i, f in enumerate(notes):
            start = int((t + i * eighth) * SR)
            if start < total:
                p = pluck(f * (1 + RNG.uniform(-0.002, 0.002)), 0.5, 0.075)
                end = min(total, start + p.size)
                out[start:end] += p[:end - start]
        bass_start = int(t * SR)
        if bass_start < total:
            tt = np.arange(min(int(1.1 * SR), total - bass_start)) / SR
            b = 0.16 * np.sin(2 * np.pi * (root / 2) * tt) * np.exp(-tt / 0.55)
            out[bass_start:bass_start + b.size] += b
        t += bar
        k += 1
    return out


def noise_burst(dur, tau, lowpass=0.0, amp=1.0):
    n = int(dur * SR)
    x = RNG.normal(0, 1, n)
    if lowpass > 0:
        w = max(1, int(SR / (2 * lowpass)))
        x = np.convolve(x, np.ones(w) / w, mode='same')
    t = np.arange(n) / SR
    x = x * np.exp(-t / tau) * np.minimum(1.0, t / 0.002)
    return amp * x / max(1e-9, np.max(np.abs(x)))


def sfx(name):
    if name == 'stamp':
        n = int(0.22 * SR)
        t = np.arange(n) / SR
        thud = np.sin(2 * np.pi * 96 * t) * np.exp(-t / 0.06)
        return addp(0.9 * thud, noise_burst(0.04, 0.012, lowpass=2500, amp=0.5))
    if name == 'ching' or name == 'ching_big':
        dur = 0.9 if name == 'ching' else 1.8
        n = int(dur * SR)
        t = np.arange(n) / SR
        bell = np.sin(2 * np.pi * 2637 * t) * np.exp(-t / (0.35 if name == 'ching' else 0.7))
        bell += 0.6 * np.sin(2 * np.pi * 3951 * t) * np.exp(-t / (0.2 if name == 'ching' else 0.5))
        if name == 'ching_big':
            for k, d in enumerate((0.0, 0.18, 0.36)):
                i0 = int(d * SR)
                bell[i0:] += 0.5 * np.sin(2 * np.pi * (2637 * (1 + 0.1 * k)) * t[:n - i0]) * np.exp(-t[:n - i0] / 0.4)
        return 0.35 * bell
    if name == 'sparks':
        out = np.zeros(int(0.8 * SR))
        for _ in range(26):
            i0 = int(RNG.uniform(0, 0.7) * SR)
            out[i0:i0 + 400] += RNG.uniform(0.2, 0.6) * RNG.normal(0, 1, min(400, out.size - i0)) * np.exp(-np.arange(min(400, out.size - i0)) / 60)
        return out
    if name == 'goat':
        n = int(0.7 * SR)
        t = np.arange(n) / SR
        f = 360 - 120 * t / 0.7 + 12 * np.sin(2 * np.pi * 6 * t)
        phase = 2 * np.pi * np.cumsum(f) / SR
        x = np.sign(np.sin(phase)) * 0.3 + 0.2 * np.sin(phase)
        return 0.22 * x * np.exp(-t / 0.35) * np.minimum(1.0, t / 0.02)
    if name == 'gavel':
        n = int(0.3 * SR)
        t = np.arange(n) / SR
        return addp(0.7 * np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.05), noise_burst(0.03, 0.01, amp=0.6))
    if name == 'ding':
        n = int(1.0 * SR)
        t = np.arange(n) / SR
        return 0.3 * (np.sin(2 * np.pi * 1320 * t) + 0.4 * np.sin(2 * np.pi * 1980 * t)) * np.exp(-t / 0.4)
    if name == 'shh':
        return noise_burst(0.7, 0.35, lowpass=0.0, amp=0.12)
    if name == 'horn':
        out = np.zeros(int(0.7 * SR))
        for d in (0.0, 0.34):
            n = int(0.26 * SR)
            t = np.arange(n) / SR
            sq = np.sign(np.sin(2 * np.pi * 392 * t)) + np.sign(np.sin(2 * np.pi * 415 * t))
            i0 = int(d * SR)
            out[i0:i0 + n] += 0.12 * sq * np.minimum(1.0, t / 0.01)
        return out
    if name == 'sneeze':
        n = int(0.8 * SR)
        t = np.arange(n) / SR
        env = np.sin(np.pi * np.minimum(1.0, t / 0.35)) * np.exp(-np.maximum(0.0, t - 0.35) / 0.12)
        air = np.convolve(RNG.normal(0, 1, n), np.ones(6) / 6, mode='same')
        return 0.5 * env * air / max(1e-9, np.max(np.abs(air)))
    if name == 'creak':
        n = int(0.6 * SR)
        t = np.arange(n) / SR
        f = 190 - 50 * t / 0.6
        return addp(0.22 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.4), noise_burst(0.2, 0.08, lowpass=1200, amp=0.12))
    if name == 'splash':
        return noise_burst(1.0, 0.28, lowpass=3000, amp=0.6)
    raise ValueError(name)


def main():
    tl = json.loads((ROOT / 'src' / 'harold' / 'data' / 'timeline.json').read_text(encoding='utf-8'))
    total = int(round((tl['duration'] + 0.5) * SR))
    voice = np.zeros(total)
    with wave.open(str(ROOT / 'harold-short' / 'voice' / 'voice.wav'), 'rb') as wf:
        v = np.frombuffer(wf.readframes(wf.getnframes()), dtype='<i2').astype(np.float64) / 32768.0
    voice[:min(total, v.size)] = v[:total]
    env = np.convolve(np.abs(voice), np.ones(int(0.08 * SR)) / int(0.08 * SR), mode='same')
    duck = np.convolve(np.clip(env / 0.03, 0, 1), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode='same')
    m = music(total)
    m *= 10 ** (-27 / 20) / np.sqrt(np.mean(m ** 2))
    m *= 1.0 - 0.45 * duck
    fx = np.zeros(total)
    for ev in tl['sfx']:
        s = sfx(ev['name'])
        i0 = int(ev['t'] * SR)
        if i0 < total:
            j = min(total, i0 + s.size)
            fx[i0:j] += s[:j - i0]
    fx *= 10 ** (-10 / 20) / max(1e-9, np.sqrt(np.mean(fx ** 2)))
    mix = voice + m + fx * 0.6
    peak = np.max(np.abs(mix))
    if peak > 0.95:
        mix *= 0.95 / peak
    tmp = ROOT / 'harold-short' / 'out' / 'mix_raw.wav'
    tmp.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(tmp), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    dest = ROOT / 'public' / 'harold' / 'mix.wav'
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', str(dest)], check=True)
    print('звук', dest)


if __name__ == '__main__':
    main()
