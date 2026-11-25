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


def trim_pauses(audio):
    """Shortens each silence inside the chunk (not at its start or end) that is 0.25 s or longer to 0.2 s. The
    speech on both sides is kept whole. Returns the new audio and the removals, for mapping times."""
    hop = int(0.01 * SR)
    n = len(audio) // hop
    db = 20 * np.log10(np.sqrt((audio[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)
    quiet = db < db.max() - 35
    edge = int(0.1 * SR)
    removals = []
    i = 0
    while i < n:
        if not quiet[i]:
            i += 1
            continue
        j = i
        while j < n and quiet[j]:
            j += 1
        s0, s1 = i * hop, min(j * hop, len(audio))
        if i > 0 and j < n and (s1 - s0) / SR >= 0.25:
            removals.append((s0 + edge, s1 - edge))
        i = j
    if not removals:
        return audio, []
    kept, cursor, total, removed = [], 0, 0, []
    for rs, re_ in removals:
        kept.append(audio[cursor:rs])
        total += re_ - rs
        removed.append((re_, total))
        cursor = re_
    kept.append(audio[cursor:])
    return np.concatenate(kept), removed


def map_time(t, removed):
    shift = 0
    for end_sample, total in removed:
        if t >= end_sample / SR:
            shift = total
        else:
            break
    return t - shift / SR


def build():
    w, flat, OS, ranges = plan()
    N = len(flat)
    out = np.zeros(int(round(TOTAL * SR)))
    words_out = [None] * N
    report = []
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
        audio, removed = trim_pauses(audio)
        if removed:
            for x in words:
                x['s'] = map_time(x['s'], removed)
                x['e'] = map_time(x['e'], removed)
            w.refine_onsets(words, audio)
            w.refine_ends(words, audio)
        s0 = words[0]['s']
        lead = min(PRE, OS[a])
        audio = audio[int(round(max(0.0, s0 - lead) * SR)):]
        length = words[-1]['e'] - s0
        f = max(1.0, length / room)
        if f > 1.0 + 1e-3:
            audio = stretch(audio, f)
        t0 = OS[a] - lead / f
        s_out = max(0, int(round(t0 * SR)))
        L = min(len(audio), len(out) - s_out)
        seg = audio[:L].copy()
        ramp = np.linspace(0.0, 1.0, int(0.005 * SR))
        seg[:len(ramp)] *= ramp
        out[s_out:s_out + L] += seg
        for j, x in enumerate(words):
            words_out[a + j] = (OS[a] + (x['s'] - s0) / f, OS[a] + (x['e'] - s0) / f)
        report.append((k, chosen[0], round(f, 3), round(sum(e - s for s, e in [(r[0], r[1]) for r in []]), 2)))
        print(f'chunk {k:02d} speed {chosen[0]}, pauses cut {len(removed)}, residual x{f:.3f}'
              + ('  OVER 1.10' if f > MAX_RESIDUAL else ''), flush=True)
    if any(x is None for x in words_out):
        raise SystemExit('some words have no chunk')
    return out, words_out, flat, report


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
        import wave
        out, words_out, flat, report = build()
        print('built; residual above 1.10:', sum(1 for r in report if r[2] > MAX_RESIDUAL))
        raw = ROOT / 'out' / 'voice_chunks_raw.wav'
        raw.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(raw), 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SR)
            wf.writeframes((np.clip(out, -1.0, 1.0) * 32767).astype('<i2').tobytes())
        dest = ROOT / 'public' / 'audio' / 'janitor' / 'voice.wav'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(raw), '-af', 'loudnorm=I=-16:TP=-1:LRA=11',
                        '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', str(dest)], check=True)
        words_file = ROOT / 'janitor-short' / 'voice' / 'words.json'
        data = [{'w': flat[g], 's': round(float(words_out[g][0]), 3), 'e': round(float(words_out[g][1]), 3)}
                for g in range(len(flat))]
        words_file.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print('wrote', dest, 'and', words_file, '| words', len(data), '| last word ends', data[-1]['e'])
