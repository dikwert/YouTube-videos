"""Pilot Short mix: original music (ducked under the voice) + sound effects + the voice, unchanged.
Standard mix: music +3 dB, SFX -6 dB, voice unchanged. Output loudness -14 LUFS (Shorts).
Writes public/audio/pilot/mix.wav (48 kHz mono).
"""
import json, subprocess
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
DUR = 67.6
N = int(DUR * SR)
PUB = ROOT / "public"

def load(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)

voice = load(PUB / "audio/pilot/voice.wav")
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

# ---- original music: 118 BPM, C - G - Am - F, plucks, bass, kick and hats
BPM = 118
beat = 60.0 / BPM
bar = 4 * beat
CHORDS = [([60, 64, 67], 48), ([55, 59, 62], 43), ([57, 60, 64], 45), ([53, 57, 60], 41)]
def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)
music = np.zeros(N)
def add(buf, start, sig):
    a = int(start * SR)
    if a >= len(buf):
        return
    b = min(len(buf), a + len(sig))
    buf[a:b] += sig[: b - a]
def pluck(f, dur, amp):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 9.0)
    return amp * env * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t))
def bass(f, dur, amp):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 4.0)
    return amp * env * (2 / np.pi) * np.arcsin(np.sin(2 * np.pi * f * t))
def kick(amp):
    t = np.arange(int(0.2 * SR)) / SR
    f = 110 * np.exp(-t * 18) + 48
    phase = 2 * np.pi * np.cumsum(f) / SR
    return amp * np.exp(-t * 14) * np.sin(phase)
def hat(amp):
    t = np.arange(int(0.05 * SR)) / SR
    return amp * np.exp(-t * 90) * np.diff(np.concatenate([[0], np.random.default_rng(3).standard_normal(len(t))]))
rng = np.random.default_rng(7)
bar_index = 0
t0 = 0.0
while t0 < DUR:
    chord, root = CHORDS[(bar_index // 2) % len(CHORDS)]
    for e in range(8):  # eighth notes
        note = chord[[0, 1, 2, 1][e % 4]] + (12 if e >= 4 and e % 3 == 0 else 0)
        add(music, t0 + e * beat / 2, pluck(midi(note), 0.35, 0.22))
    for b in (0, 2):
        add(music, t0 + b * beat, bass(midi(root), 0.45, 0.30))
        add(music, t0 + b * beat, kick(0.42))
    for e in range(8):
        add(music, t0 + e * beat / 2 + beat / 4, hat(0.10 + 0.04 * rng.random()))
    t0 += bar
    bar_index += 1
fade = np.minimum(1.0, np.minimum(np.arange(N) / (0.8 * SR), (N - np.arange(N)) / (1.2 * SR)))
music = music[:N] * fade
# ducking: the music dips while the voice speaks
env = np.sqrt(np.convolve(voice ** 2, np.ones(int(0.05 * SR)) / int(0.05 * SR), mode="same"))
env = env / (env.max() + 1e-9)
duck = 1.0 - 0.55 * np.clip(env * 3.0, 0, 1)
music = music * duck

# ---- sound effects (times in seconds)
SFX = [
    ("sfx/whoosh.wav", 2.00, 0.55), ("audio/pilot/sfx/snore.wav", 15.6, 0.55), ("audio/pilot/sfx/click.wav", 20.30, 0.9),
    ("audio/pilot/sfx/whisper.wav", 34.20, 0.45), ("sfx/whoosh.wav", 43.40, 0.6), ("sfx/whoosh.wav", 46.00, 0.5),
    ("sfx/rumble.wav", 47.00, 0.55), ("sfx/rumble.wav", 49.60, 0.45), ("audio/pilot/sfx/screech.wav", 54.20, 0.75),
    ("sfx/chime.wav", 56.90, 0.6), ("audio/pilot/sfx/creak.wav", 59.20, 0.5), ("sfx/chime.wav", 65.50, 0.4),
]
STEPS = [18.0 + k * 0.38 for k in range(7)]
sfx = np.zeros(N)
for rel, t, g in SFX:
    fx = load(PUB / rel)
    add(sfx, t, fx * g)
for t in STEPS:
    add(sfx, t, load(PUB / "sfx/step.wav") * 0.35)

# ---- balance: music +3 dB, SFX -6 dB, voice unchanged
music_gain = 10 ** ((-20 + 3) / 20)
sfx_gain = 10 ** (-6 / 20)
mix = voice + music * music_gain + sfx * sfx_gain
peak = np.max(np.abs(mix))
mix = mix / peak * 10 ** (-1.0 / 20)  # headroom for the loudness step
pre = ROOT / "pilot-short/voice/mix_pre.wav"
import wave
with wave.open(str(pre), "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
out = PUB / "audio/pilot/mix.wav"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(pre), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(out)], check=True)
print("mix written:", out, "voice peak %.2f" % np.max(np.abs(voice)), "music rms %.3f" % np.sqrt(np.mean(music ** 2)))
