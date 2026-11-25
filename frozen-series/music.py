#!/usr/bin/env python3
"""Фоновая музыка серии «−20. ЗАПЕРТ В ФУРЕ»: тихая тёмная пьеса, сочинённая кодом (чужих записей нет).

  python3 frozen-series/music.py 1 [2 ...]

У каждой части своя тональность и последовательность аккордов: 4 аккорда по 8 с, повтор дважды = 64 с.
Пэд — слегка расстроенные синусоиды с обертонами и плавными переходами между аккордами, тихий бас
и редкие «колокольные» ноты с коротким эхом. Пишет frozen-series/out/part{n}_music.wav (48 кГц, моно).
Громкость и приглушение под голос делает mix.py.
"""
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
CHORD_SEC = 8.0
TOTAL_SEC = 64.0

NOTES = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6,
         'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
CHORD_TYPES = {'m': (0, 3, 7), 'M': (0, 4, 7), 'M7': (0, 4, 7, 11), 'sus': (0, 5, 7)}

# (корень, тип аккорда): тёмное начало, нарастание напряжения, финал на светлом C-мажоре (Часть 5)
PROGRESSIONS = {
    1: [('A', 'm'), ('F', 'M7'), ('D', 'm'), ('E', 'sus')],
    2: [('D', 'm'), ('Bb', 'M'), ('G', 'm'), ('A', 'sus')],
    3: [('E', 'm'), ('C', 'M'), ('G', 'M'), ('D', 'sus')],
    4: [('F', 'm'), ('Db', 'M'), ('Ab', 'M'), ('C', 'sus')],
    5: [('A', 'm'), ('F', 'M'), ('G', 'M'), ('C', 'M')],
}


def hz(note, octave):
    """Частота ноты: A4 = 440 Гц."""
    midi = 12 * (octave + 1) + NOTES[note]
    return 440.0 * 2 ** ((midi - 69) / 12)


def fade(t, t0, t1, ramp=2.0):
    """Плавная огибающая аккорда: нарастание перед t0, спад после t1."""
    up = np.clip((t - (t0 - ramp)) / ramp, 0.0, 1.0)
    down = np.clip(((t1 + ramp) - t) / ramp, 0.0, 1.0)
    w = np.minimum(up, down)
    return 0.5 - 0.5 * np.cos(np.pi * w)


def pad(prog, total):
    """Пэд: в каждом аккорде три слегка расстроенные синусоиды на ноту, с обертонами."""
    out = np.zeros(total)
    for i, (root, typ) in enumerate(prog):
        t0, t1 = i * CHORD_SEC, (i + 1) * CHORD_SEC
        a = max(0, int((t0 - 2.0) * SR))
        b = min(total, int((t1 + 2.0) * SR))
        t = np.arange(a, b) / SR
        sig = np.zeros(t.size)
        notes = CHORD_TYPES[typ]
        for semi in notes:
            f = hz(root, 3) * 2 ** (semi / 12)
            for det in (1.0, 1.0035, 0.9965):
                for k, amp in enumerate((1.0, 0.45, 0.25, 0.12), start=1):
                    sig += amp * np.sin(2 * np.pi * f * det * k * t)
        sig /= len(notes) * 3 * 1.8
        out[a:b] += sig * fade(t, t0, t1)
    return out


def bass(prog, total):
    """Тихий бас: синус на корне аккорда на октаву ниже пэда."""
    out = np.zeros(total)
    for i, (root, typ) in enumerate(prog):
        t0, t1 = i * CHORD_SEC, (i + 1) * CHORD_SEC
        a = max(0, int((t0 - 2.0) * SR))
        b = min(total, int((t1 + 2.0) * SR))
        t = np.arange(a, b) / SR
        f = hz(root, 2)
        sig = 0.5 * np.sin(2 * np.pi * f * t) + 0.12 * np.sin(2 * np.pi * 2 * f * t)
        out[a:b] += sig * fade(t, t0, t1, ramp=1.5)
    return out


def bells(prog, total, seed):
    """Редкие колокольные ноты из тонов текущего аккорда, с коротким эхом."""
    rng = np.random.default_rng(seed)
    out = np.zeros(total)
    t = 4.0 + rng.uniform(0.0, 1.5)
    while t < TOTAL_SEC - 3.0:
        root, typ = prog[min(int(t // CHORD_SEC), len(prog) - 1)]
        semis = CHORD_TYPES[typ]
        semi = semis[rng.integers(len(semis))] + 12 * int(rng.integers(0, 2))
        f = hz(root, 5) * 2 ** (semi / 12)
        a = int(t * SR)
        L = min(int(3.5 * SR), total - a)
        tt = np.arange(L) / SR
        note = 0.35 * (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 1.1)
                       + 0.25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.4))
        out[a:a + L] += note
        for delay, gain in ((0.23, 0.35), (0.51, 0.18)):
            da = a + int(delay * SR)
            dL = min(L, total - da)
            if dL > 0:
                out[da:da + dL] += gain * note[:dL]
        t += rng.uniform(2.2, 3.6)
    return out


def write_wav(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def build(n):
    prog = PROGRESSIONS[n] * 2
    total = int(round(TOTAL_SEC * SR))
    x = 0.55 * pad(prog, total) + 0.35 * bass(prog, total) + 0.6 * bells(prog, total, seed=n)
    t = np.arange(total) / SR
    x *= np.clip(t / 0.5, 0.0, 1.0) * np.clip((TOTAL_SEC - t) / 1.5, 0.0, 1.0)
    x *= 0.8 / max(1e-9, np.max(np.abs(x)))
    out = ROOT / 'frozen-series' / 'out' / f'part{n}_music.wav'
    write_wav(out, x)
    print('музыка', out, 'аккорды:', ' '.join(f'{r}{typ}' for r, typ in prog))


if __name__ == '__main__':
    for arg in sys.argv[1:]:
        build(int(arg))
