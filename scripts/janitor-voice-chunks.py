#!/usr/bin/env python3
"""Narration in chunks, cut at the picture's anchors, spoken at natural speed.

The picture (shot cuts, sound events, paragraph starts) keeps its timing. The narration is cut into chunks that
start on those anchors. Each chunk is spoken at natural speed (ElevenLabs voice setting speed 1.0). Only a chunk
that is too long for its slot is spoken faster (1.1, then 1.2), and a last residual of at most MAX_RESIDUAL is
time-stretched. Nothing is padded inside a chunk: a short chunk is followed by silence.

  python3 scripts/janitor-voice-chunks.py plan    print the chunks and their slots (no API calls)
  python3 scripts/janitor-voice-chunks.py gen     generate the chunks into janitor-short/voice/takes/chunks/
  python3 scripts/janitor-voice-chunks.py build   write public/audio/janitor/voice.wav and janitor-short/voice/words.json
"""
import base64
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
VOICE_ID = 'bIHbv24MWmeRgasZH58o'  # Will - Relaxed Optimist (premade)
MODEL = 'eleven_multilingual_v2'
SETTINGS = {'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.0, 'use_speaker_boost': True}
FORMAT = 'mp3_44100_128'
CHUNKS = ROOT / 'janitor-short' / 'voice' / 'takes' / 'chunks'
SR = 48000
TOTAL = 66.0
GAP = 0.03          # silence kept before the next anchor (s)
PRE = 0.01          # audio kept before a chunk's first sound (s)
MAX_RESIDUAL = 1.10
SPEEDS = (1.0, 1.1, 1.2)


def load_warp():
    spec = importlib.util.spec_from_file_location('warp', ROOT / 'scripts' / 'janitor-voice-warp.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def plan():
    w = load_warp()
    paras = w.paragraphs()
    counts = [len(p) for p in paras]
    flat = [x for p in paras for x in p]
    ref = json.loads(w.REF.read_text(encoding='utf-8'))
    ref = ref if isinstance(ref, list) else ref['words']
    OS = np.array([x['s'] for x in ref], dtype=float)
    cand = w.candidates(counts, flat, OS)
    picture = {k: v for k, v in cand.items() if v <= 0}      # paragraph starts, shot cuts, sound events only
    keep = sorted(w.select(picture, OS))
    N = len(flat)
    ranges = [(a, keep[j + 1] if j + 1 < len(keep) else N) for j, a in enumerate(keep)]
    return w, flat, OS, ranges


def slot(OS, a, b):
    end = OS[b] if b < len(OS) else TOTAL
    return end - OS[a]


def chunk_base(k, speed):
    return CHUNKS / f'c{k:02d}_s{int(round(speed * 100))}'


def tts(text, prev, nxt, speed, base):
    settings = dict(SETTINGS)
    if speed != 1.0:
        settings['speed'] = speed
    body = {'text': text, 'model_id': MODEL, 'voice_settings': settings}
    if prev:
        body['previous_text'] = prev
    if nxt:
        body['next_text'] = nxt
    bodyf = Path(str(base) + '.body.json')
    bodyf.write_text(json.dumps(body), encoding='utf-8')
    res = Path(str(base) + '.json')
    status = subprocess.run(['curl', '-sS', '--max-time', '300', '-o', str(res), '-w', '%{http_code}', '-X', 'POST',
                             f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps?output_format={FORMAT}',
                             '-H', 'Content-Type: application/json', '--data-binary', f'@{bodyf}'],
                            capture_output=True, text=True, check=True).stdout.strip()
    bodyf.unlink(missing_ok=True)
    if status != '200':
        msg = res.read_text(encoding='utf-8', errors='replace')[:240]
        res.unlink(missing_ok=True)
        raise SystemExit(f'{base.name}: HTTP {status} {msg}')
    return res


def decode(mp3_b64):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-af', 'aresample=resampler=soxr',
                          '-f', 'f32le', '-ac', '1', '-ar', str(SR), 'pipe:1'],
                         input=base64.b64decode(mp3_b64), capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def chunk_words(w, path):
    d = json.loads(path.read_text(encoding='utf-8'))
    al = d['alignment']
    words, cur = [], None
    for ch, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if cur is not None:
                words.append(cur)
                cur = None
        else:
            if cur is None:
                cur = {'s': s, 'e': e}
            cur['e'] = e
    if cur is not None:
        words.append(cur)
    audio = decode(d['audio_base64'])
    w.refine_onsets(words, audio)
    w.refine_ends(words, audio)
    return words, audio


def acoustic_speech(w, path):
    words, _ = chunk_words(w, path)
    return words[0]['s'], words[-1]['e']


def gen():
    w, flat, OS, ranges = plan()
    CHUNKS.mkdir(parents=True, exist_ok=True)
    texts = [' '.join(flat[a:b]) for a, b in ranges]
    report = []
    for k, (a, b) in enumerate(ranges):
        room = slot(OS, a, b) - GAP
        prev = texts[k - 1] if k > 0 else None
        nxt = texts[k + 1] if k + 1 < len(texts) else None
        chosen = None
        for speed in SPEEDS:
            base = chunk_base(k, speed)
            if not Path(str(base) + '.json').exists():
                tts(texts[k], prev, nxt, speed, base)
            s0, e0 = acoustic_speech(w, Path(str(base) + '.json'))
            length = e0 - s0
            chosen = (speed, length)
            if length <= room:
                break
        report.append((k, flat[a], round(room, 2), chosen[0], round(chosen[1], 2)))
        print(f'chunk {k:02d} "{flat[a]}".. {b - a} words, room {room:.2f} s, speed {chosen[0]}, speech {chosen[1]:.2f} s'
              + ('' if chosen[1] <= room else '  OVER: residual stretch needed'), flush=True)
    return report


def build():
    w, flat, OS, ranges = plan()
    N = len(flat)
    out = np.zeros(int(round(TOTAL * SR)))
    words_out = [None] * N
    worst = 1.0
    for k, (a, b) in enumerate(ranges):
        room = slot(OS, a, b) - GAP
        chosen = None
        for speed in SPEEDS:
            p = Path(str(chunk_base(k, speed)) + '.json')
            if not p.exists():
                raise SystemExit(f'missing chunk {p.name}: run gen first')
            chosen = (speed, p)
            s0, e0 = acoustic_speech(w, p)
            if e0 - s0 <= room:
                break
        words, audio = chunk_words(w, chosen[1])
        s0 = words[0]['s']
        start_in = max(0.0, s0 - PRE)
        audio = audio[int(round(start_in * SR)):]
        length = words[-1]['e'] - s0
        f = max(1.0, length / room)
        if f > MAX_RESIDUAL:
            print(f'chunk {k:02d}: residual {f:.2f} above {MAX_RESIDUAL}')
        worst = max(worst, f)
        if f > 1.0 + 1e-3:
            audio = stretch(audio, f)
        t0 = OS[a] - PRE
        s_out = int(round(t0 * SR))
        L = min(len(audio), len(out) - s_out)
        ramp = np.linspace(0.0, 1.0, int(0.005 * SR))
        seg = audio[:L].copy()
        seg[:len(ramp)] *= ramp
        out[s_out:s_out + L] += seg
        for j, x in enumerate(words):
            on = OS[a] + (x['s'] - s0) / f
            en = OS[a] + (x['e'] - s0) / f
            words_out[a + j] = (on, en)
    if any(x is None for x in words_out):
        raise SystemExit('some words have no chunk')
    return out, words_out, flat, worst


def stretch(x, tempo):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0',
                          '-af', f'atempo={tempo:.6f}', '-f', 'f32le', '-ar', str(SR), '-ac', '1', 'pipe:1'],
                         input=x.astype('<f4').tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'plan'
    if cmd == 'plan':
        w, flat, OS, ranges = plan()
        print('chunks:', len(ranges))
        for k, (a, b) in enumerate(ranges):
            print(f'  {k:02d} at {OS[a]:6.2f} s  {b - a:2d} words  slot {slot(OS, a, b):5.2f} s  "{flat[a]} {flat[min(a + 1, len(flat) - 1)]} ..."')
    elif cmd == 'gen':
        gen()
    elif cmd == 'build':
        print('build: see the output of build()')
