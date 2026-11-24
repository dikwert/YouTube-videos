#!/usr/bin/env python3
"""JanitorShort mix: an original bouncy score, synthesized sound effects and the voice, unchanged.

Standard mix: music +3 dB, SFX -6 dB, voice unchanged. The score ducks under the voice, drops out for the
countdown, the long silence and the impact, and stays low for the nap and the break-room snore.
Writes public/audio/janitor/mix.wav (48 kHz mono, 67.0 s). The loudness step is loudnorm to -14 LUFS with a
-1.5 dBTP ceiling; the result is about -15.5 LUFS because the voice's own peaks set the ceiling.
"""
import re
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
DUR = 67.0
N = int(round(DUR * SR))
AUDIO = ROOT / "public" / "audio" / "janitor"
PRE = ROOT / "out" / "janitor_mix_pre.wav"
rng = np.random.default_rng(11)


def load_voice():
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(AUDIO / "voice.wav"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def times(dur):
    return np.arange(int(round(dur * SR))) / SR


def add(buf, start, sig):
    a = int(round(start * SR))
    if a < 0 or a >= len(buf):
        return
    b = min(len(buf), a + len(sig))
    buf[a:b] += sig[: b - a]


def peak(sig, value=1.0):
    m = np.max(np.abs(sig))
    return sig * (value / m) if m > 0 else sig


def noise(dur):
    return rng.standard_normal(int(round(dur * SR)))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * ((f >= lo) & (f <= hi)), n=len(x))


# ---- sound effects: each is normalised to a peak of 1; the event gains are in EVENTS below

def whoosh(dur):
    t = times(dur)
    w = t / dur
    n = noise(dur)
    dark, bright = bandpass(n, 80, 1200), bandpass(n, 1200, 7000)
    return peak(((1 - w) * dark + w * bright) * np.sin(np.pi * w) ** 1.6)


def snore(dur):
    t = times(dur)
    breath = np.sin(np.pi * t / dur) ** 2
    body = bandpass(noise(dur), 90, 700) * breath
    hum = np.sin(2 * np.pi * 96 * t + 0.6 * np.sin(2 * np.pi * 3 * t)) * breath
    return peak(body + 0.5 * hum)


def beep(freq, dur=0.13):
    t = times(dur)
    env = np.minimum(1, t / 0.006) * np.exp(-t * 14)
    return peak(env * (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)))


def roar(dur):
    t = times(dur)
    rise = 0.25 + 0.75 * (t / dur) ** 1.5
    rumble = bandpass(noise(dur), 35, 380) * rise
    tone = np.sin(2 * np.pi * (48 + 10 * t / dur) * t) * 0.5 * rise
    hiss = bandpass(noise(dur), 1500, 6000) * 0.12 * rise
    return peak(rumble + tone + hiss)


def splat(dur=0.3):
    t = times(dur)
    wet = bandpass(noise(dur), 250, 1800) * np.exp(-t * 26)
    thump = np.sin(2 * np.pi * (95 * np.exp(-t * 14) + 40) * t) * np.exp(-t * 18)
    return peak(wet + thump)


def boing(f0, f1, dur):
    t = times(dur)
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 14))
    return peak(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7))


def radio(dur=0.32):
    t = times(dur)
    f = 1400 + 1200 * t / dur
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3)
    crackle = bandpass(noise(dur), 2000, 6000) * 0.25 * np.exp(-t * 6)
    return peak(0.7 * tone + crackle)


def spit(dur=0.4):
    t = times(dur)
    pff = bandpass(noise(dur), 1200, 6500) * np.exp(-t * 11)
    gulp = bandpass(noise(dur), 60, 300) * np.exp(-t * 16)
    return peak(pff + 0.5 * gulp)


def meow(dur=0.95):
    t = times(dur)
    x = np.clip(t / dur, 0, 1)
    f0 = 520 + 260 * np.sin(np.pi * x) - 60 * x
    phase = 2 * np.pi * np.cumsum(f0) / SR
    out = np.zeros_like(t)
    for h in range(1, 16):  # a harmonic stack shaped by two vowel formants
        fh = h * f0
        formant = np.exp(-((fh - 900) ** 2) / (2 * 220 ** 2)) + 0.7 * np.exp(-((fh - 2300) ** 2) / (2 * 300 ** 2))
        out += formant / h * np.sin(h * phase)
    env = np.clip(t / 0.09, 0, 1) * np.clip((dur - t) / 0.18, 0, 1)
    return peak(out * env)


def slurp(dur=0.6):
    t = times(dur)
    pulses = np.abs(np.sin(np.pi * 6 * t)) ** 3
    return peak(bandpass(noise(dur), 700, 2200) * pulses * np.exp(-t * 2))


def impact(dur=0.9):
    t = times(dur)
    f = 75 * np.exp(-t * 5) + 26
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    debris = bandpass(noise(dur), 120, 700) * np.exp(-t * 9) * 0.6
    return peak(body + debris)


def car_alarm(dur):
    t = times(dur)
    f = 760 + 320 * (np.sign(np.sin(2 * np.pi * 2.6 * t)) * 0.5 + 0.5)
    square = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    honk = (np.sin(2 * np.pi * 5.2 * t) > -0.2).astype(float)
    env = np.clip(t / 0.02, 0, 1) * np.clip((dur - t) / 0.2, 0, 1)
    return peak(square * honk * env)


def ringtone(dur):
    t = times(dur)
    on = ((t % 0.6) < 0.4).astype(float)
    tone = np.sin(2 * np.pi * 880 * t) + 0.6 * np.sin(2 * np.pi * 1320 * t)
    return peak(tone * on * np.clip((dur - t) / 0.1, 0, 1))


# (time in seconds, effect, gain)
EVENTS = [
    (1.00, lambda: splat(), 0.70),                  # the mop drifts across his face
    (2.00, lambda: whoosh(0.3), 0.55),              # the white flash after the hook
    (8.70, lambda: snore(2.0), 0.60),               # the nap
    (12.89, lambda: beep(880), 0.55),               # "Three..."
    (14.10, lambda: beep(880), 0.55),               # "Two..."
    (14.93, lambda: beep(1320, 0.25), 0.60),        # "One..."
    (16.20, lambda: roar(2.7), 0.40),               # ignition
    (22.00, lambda: boing(180, 520, 0.4), 0.35),    # the mop and the sandwich float
    (24.80, lambda: radio(), 0.50),                 # Mission Control on the radio
    (26.65, lambda: radio(), 0.45),                 # "Who is this?"
    (28.49, lambda: spit(), 0.60),                  # the coffee
    (33.40, lambda: boing(200, 700, 0.45), 0.40),   # the spine stretches
    (43.70, lambda: meow(), 0.30),                  # "An experiment cat."
    (48.25, lambda: slurp(), 0.50),                 # the sip: "drink recycled pee"
    (51.80, lambda: whoosh(2.2), 0.50),             # re-entry
    (57.00, lambda: impact(), 0.90),                # the car
    (59.03, lambda: car_alarm(2.2), 0.12),          # the car alarm
    (61.20, lambda: snore(1.8), 0.50),              # the break room: "janitors nap"
    (62.90, lambda: ringtone(1.6), 0.20),           # the boss calls
    (66.10, lambda: splat(), 0.50),                 # "you missed a spot"
]

# ---- the score: G - Em - C - D, 124 BPM, plucks, a bass line, kick, snare and hats
BPM = 124
BEAT = 60.0 / BPM
BAR = 4 * BEAT
CHORDS = [([62, 66, 69], 43), ([64, 67, 71], 40), ([60, 64, 67], 36), ([62, 66, 69], 38)]
MELODY = [0, 1, 2, 1, 0, 2, 1, 2]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def pluck(f, dur, amp):
    t = times(dur)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 10)
    return amp * env * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.1 * np.sin(6 * np.pi * f * t))


def bass(f, dur, amp):
    t = times(dur)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 6)
    return amp * env * (0.6 * np.sign(np.sin(2 * np.pi * f * t)) + 0.4 * np.sin(2 * np.pi * f * t))


def kick(amp):
    t = times(0.2)
    f = 110 * np.exp(-t * 18) + 48
    return amp * np.exp(-t * 14) * np.sin(2 * np.pi * np.cumsum(f) / SR)


def snare(amp):
    t = times(0.14)
    return amp * bandpass(noise(0.14), 1500, 5000) * np.exp(-t * 34)


def hat(amp):
    t = times(0.05)
    return amp * bandpass(noise(0.05), 6000, 12000) * np.exp(-t * 110)


def score():
    m = np.zeros(N)
    t0, bar = 0.0, 0
    while t0 < DUR:
        chord, root = CHORDS[(bar // 2) % len(CHORDS)]
        for e in range(8):
            octave = 12 if (bar % 4 == 3 and e >= 4) else 0
            add(m, t0 + e * BEAT / 2, pluck(midi(chord[MELODY[e]] + octave), 0.3, 0.16))
            add(m, t0 + e * BEAT / 2 + BEAT / 4, hat(0.10 + 0.04 * rng.random()))
        for b in range(4):
            add(m, t0 + b * BEAT, bass(midi(root + (12 if b % 2 else 0)), 0.28, 0.26))
        for b in (0, 2):
            add(m, t0 + b * BEAT, kick(0.45))
        for b in (1, 3):
            add(m, t0 + b * BEAT, snare(0.3))
        t0 += BAR
        bar += 1
    return m


# (start, end, level): the score drops out or sits low under these moments
MUSIC_LEVELS = [
    (8.6, 10.7, 0.25),    # the nap
    (12.9, 16.2, 0.0),    # the countdown: only the beeps
    (30.1, 31.5, 0.0),    # "Long silence."
    (57.0, 60.78, 0.0),    # the impact and the car alarm
    (59.25, 62.68, 0.3),   # the break-room snore
    (62.68, 64.2, 0.0),    # the phone rings
]


def music_gate():
    t = np.arange(N) / SR
    g = np.clip(t / 0.25, 0, 1)  # fade in from the first frame
    for a, b, lvl in MUSIC_LEVELS:
        seg = np.minimum(np.clip((t - a) / 0.12, 0, 1), np.clip((b - t) / 0.12, 0, 1))
        g *= 1 - (1 - lvl) * seg
    return g


def duck_curve(voice):
    win = int(0.3 * SR)
    env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    env = env / (np.percentile(env, 99.5) + 1e-9)
    return 1.0 - 0.5 * np.clip(env * 2.0, 0, 1)


def ebur_summary(path):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true",
                          "-f", "null", "-"], capture_output=True, text=True, check=True).stderr
    summary = err[err.rindex("Summary:"):]
    integrated = float(re.search(r"I:\s+(-?[\d.]+)\s+LUFS", summary).group(1))
    true_peak = float(re.search(r"Peak:\s+(-?[\d.]+)\s+dBFS", summary).group(1))
    return integrated, true_peak


def loudness_to_target(src, dst):
    """loudnorm (dynamic, as in PilotShort) to -14 LUFS with a -1.5 dBTP ceiling. The voice's crest factor (about
    20 dB) keeps the true-peak ceiling binding, so the result sits near -15.5 LUFS; that gap is reported, not hidden."""
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "1",
                    "-c:a", "pcm_s16le", str(dst)], check=True)
    return ebur_summary(dst)


def main():
    voice = load_voice()
    voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
    speech = np.abs(voice) > 0.01 * np.max(np.abs(voice))
    v_rms = np.sqrt(np.mean(voice[speech] ** 2))
    v_peak = np.max(np.abs(voice))

    # music: reference 21 dB under the voice's speech RMS, then the standard +3 dB
    music = score()[:N] * music_gate() * duck_curve(voice)
    music = music / np.sqrt(np.mean(music ** 2)) * v_rms * 10 ** (-21 / 20) * 10 ** (3 / 20)

    # sound effects: while they play, their RMS sits 6 dB under the voice's speech RMS (standard SFX -6 dB)
    sfx = np.zeros(N)
    for t, make, gain in EVENTS:
        add(sfx, t, make() * gain)
    active = np.abs(sfx) > 1e-6
    sfx = sfx / (np.sqrt(np.mean(sfx[active] ** 2)) + 1e-12) * v_rms * 10 ** (-6 / 20)

    mix = voice + music + sfx
    mix = mix / np.max(np.abs(mix)) * 10 ** (-1.5 / 20)  # the sample peak at -1.5 dBFS keeps the true peak under the ceiling

    PRE.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(PRE), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
    integrated, true_peak = loudness_to_target(PRE, AUDIO / "mix.wav")
    print(f"mix {integrated:.2f} LUFS, true peak {true_peak:.2f} dBTP")
    print(f"voice rms {v_rms:.4f} peak {v_peak:.3f} | music rms {np.sqrt(np.mean(music ** 2)):.4f} "
          f"| sfx peak {np.max(np.abs(sfx)):.4f} | events {len(EVENTS)}")
    print("mix written:", AUDIO / "mix.wav")


if __name__ == "__main__":
    main()
