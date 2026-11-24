"""Fit the Janitor Short narration to TARGET seconds without changing pitch.

Input : janitor-short/voice/words_raw.json and janitor-short/voice/raw_48k.wav (the ElevenLabs take).
Steps : keep every word exactly; keep gaps up to 0.10 s; halve longer gaps; add the director's silence
        after "silence."; then time-stretch the whole take to TARGET with ffmpeg atempo (pitch preserved).
Output: public/audio/janitor/voice.wav (48 kHz mono) and janitor-short/voice/words.json (fitted times).
Usage : python3 scripts/janitor-voice-fit.py [target_seconds]
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
VOICE = ROOT / "janitor-short/voice"
RAW = VOICE / "raw_48k.wav"
WORDS_RAW = VOICE / "words_raw.json"
OUT_WAV = ROOT / "public/audio/janitor/voice.wav"
TARGET = float(sys.argv[1]) if len(sys.argv) > 1 else 66.0
# Director's pauses, in seconds of the take (before the stretch).
EXTRA_PAUSE_AFTER = {"silence.": 1.0}
LONG_GAP = 0.10
SR = 48000


def read_wav(p):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(p), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype="<i2").copy()


words = json.loads(WORDS_RAW.read_text())
src = read_wav(RAW)


def samp(t):
    return int(round(t * SR))


pieces, timeline, kept = [], [], 0
for i, w in enumerate(words):
    a, b = samp(w["s"]), samp(w["e"])
    timeline.append({"w": w["w"], "s": kept / SR, "e": (kept + (b - a)) / SR})
    pieces.append(src[a:b])
    kept += b - a
    if i + 1 < len(words):
        gap = max(0.0, words[i + 1]["s"] - w["e"])
        keep = gap if gap <= LONG_GAP else gap * 0.5
        extra = EXTRA_PAUSE_AFTER.get(w["w"].strip().strip('"'), 0.0)
        n = samp(keep + extra)
        pieces.append(np.zeros(n, dtype=src.dtype))
        kept += n

fitted = np.concatenate(pieces)
length = len(fitted) / SR
tempo = round(length / TARGET, 3)
tmp = VOICE / "fitted_pre_tempo_48k.wav"
with open(tmp, "wb") as f:
    f.write(b"")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-c:a", "pcm_s16le", str(tmp)], input=fitted.astype("<i2").tobytes(), check=True)
OUT_WAV.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-af", f"atempo={tempo}",
                "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(OUT_WAV)], check=True)
tmp.unlink(missing_ok=True)

for w in timeline:
    w["s"] = round(w["s"] / tempo, 3)
    w["e"] = round(w["e"] / tempo, 3)
(VOICE / "words.json").write_text(json.dumps(timeline, indent=1) + "\n")
print(f"take fitted: {length:.2f} s -> tempo {tempo} -> {length / tempo:.2f} s; {len(timeline)} words")
