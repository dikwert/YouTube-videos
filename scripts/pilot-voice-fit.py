"""Fit the Pilot Short narration to 60-68 s without changing pitch.

Input : pilot-short/voice/words_raw.json (ElevenLabs word times) + raw 48 kHz mono wav of the same take.
Steps : keep every word exactly; keep short gaps (<= 0.10 s); halve longer gaps;
        then tempo-stretch the whole result by TEMPO with ffmpeg atempo (pitch preserved).
Output: public/audio/pilot/voice.wav and pilot-short/voice/words.json (fitted times).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "pilot-short/voice/raw_48k.wav"
WORDS_RAW = ROOT / "pilot-short/voice/words_raw.json"
TEMPO = float(sys.argv[1]) if len(sys.argv) > 1 else 1.27
# Pauses set by the director, in seconds of the final file (inserted before tempo, scaled by TEMPO).
EXTRA_PAUSE_AFTER = {"Welcome!": 0.5}
LONG_GAP = 0.10
GAP_KEEP = 0.5
SR = 48000

def read_wav(p):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(p), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype="<i2").copy()

words = json.loads(WORDS_RAW.read_text())
src = read_wav(RAW)
def samp(t):
    return int(round(t * SR))

pieces, out_words, cursor = [], [], 0
kept_total = 0
for i, w in enumerate(words):
    # the speech of this word, exactly as in the take
    a, b = samp(w["s"]), samp(w["e"])
    pieces.append(src[a:b]); 
    out_words.append({"w": w["w"], "s": kept_total / SR, "e": (kept_total + (b - a)) / SR})
    kept_total += b - a
    if i + 1 < len(words):
        gap = words[i + 1]["s"] - w["e"]
        keep = gap if gap <= LONG_GAP else gap * GAP_KEEP
        a2 = samp(w["e"]); b2 = a2 + samp(keep)
        pieces.append(src[a2:b2]); kept_total += b2 - a2
        if w["w"].strip("\"'") in EXTRA_PAUSE_AFTER:
            n = samp(EXTRA_PAUSE_AFTER[w["w"].strip("\"'")] * TEMPO)
            pieces.append(np.zeros(n, dtype=src.dtype)); kept_total += n
out = np.concatenate(pieces)
tmp = ROOT / "pilot-short/voice/fitted_pre.wav"
with open(tmp, "wb") as f:
    f.write(b"")
import wave
with wave.open(str(tmp), "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(out.astype("<i2").tobytes())

dst = ROOT / "public/audio/pilot/voice.wav"
dst.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-af", f"atempo={TEMPO}",
                "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(dst)], check=True)
tmp.unlink()
for w in out_words:
    w["s"] = round(w["s"] / TEMPO, 3); w["e"] = round(w["e"] / TEMPO, 3)
(ROOT / "pilot-short/voice/words.json").write_text(json.dumps(out_words, indent=1) + "\n")
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dst)],
                     check=True, capture_output=True, text=True).stdout.strip()
speech = out_words[-1]["e"] - out_words[0]["s"]
print(f"tempo {TEMPO}: wav {float(dur):.2f}s, speech {speech:.2f}s, {len(out_words)} words, {len(out_words)/speech:.2f} words/s")
