#!/usr/bin/env python3
"""The whole narration as one continuous take, at natural speed.

Nothing is cut or stretched: the take is generated once (ElevenLabs with-timestamps), its word onsets are read from
the audio, and the picture is moved to the words (scripts/janitor-picture-warp.py).

  python3 scripts/janitor-voice-continuous.py gen [speed]    generate the take into janitor-short/voice/takes/continuous/
  python3 scripts/janitor-voice-continuous.py analyze [speed]  word onsets and ends from the audio, and the total length
  python3 scripts/janitor-voice-continuous.py build [speed]   write public/audio/janitor/voice.wav and voice/words.json
"""
import base64
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'  # George - Warm, Captivating Storyteller (premade)
MODEL = 'eleven_multilingual_v2'
SETTINGS = {'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.0, 'use_speaker_boost': True}
FORMAT = 'mp3_44100_128'
SR = 48000
DIR = ROOT / 'janitor-short' / 'voice' / 'takes' / 'continuous'
SCRIPT = ROOT / 'janitor-short' / 'voice' / 'script.txt'
EDGE = 0.02  # silence kept before the first word (s)


def load_warp():
    spec = importlib.util.spec_from_file_location('warp', ROOT / 'scripts' / 'janitor-voice-warp.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def full_text():
    paras = [p.split() for p in re.split(r'\n\s*\n', SCRIPT.read_text(encoding='utf-8').strip()) if p.strip()]
    return ' '.join(' '.join(p) for p in paras)


def speed_tag(speed):
    return f'{int(round(speed * 100)):03d}'


def gen(speed):
    DIR.mkdir(parents=True, exist_ok=True)
    settings = dict(SETTINGS)
    if speed != 1.0:
        settings['speed'] = speed
    body = {'text': full_text(), 'model_id': MODEL, 'voice_settings': settings}
    bodyf = DIR / f'full_s{speed_tag(speed)}.body.json'
    bodyf.write_text(json.dumps(body), encoding='utf-8')
    res = DIR / f'full_s{speed_tag(speed)}.json'
    status = subprocess.run(['curl', '-sS', '--max-time', '600', '-o', str(res), '-w', '%{http_code}', '-X', 'POST',
                             f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps?output_format={FORMAT}',
                             '-H', 'Content-Type: application/json', '--data-binary', f'@{bodyf}'],
                            capture_output=True, text=True, check=True).stdout.strip()
    bodyf.unlink(missing_ok=True)
    if status != '200':
        raise SystemExit(f'HTTP {status}: {res.read_text(encoding="utf-8", errors="replace")[:240]}')
    print('generated', res)


def read_words(speed):
    d = json.loads((DIR / f'full_s{speed_tag(speed)}.json').read_text(encoding='utf-8'))
    al = d['alignment']
    words, cur = [], None
    for ch, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if cur is not None:
                words.append(cur)
                cur = None
        else:
            if cur is None:
                cur = {'w': '', 's': s, 'e': e}
            cur['w'] += ch
            cur['e'] = e
    if cur is not None:
        words.append(cur)
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-af', 'aresample=resampler=soxr', '-f', 'f32le',
                          '-ac', '1', '-ar', str(SR), 'pipe:1'], input=base64.b64decode(d['audio_base64']),
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    return words, audio


def analyze(speed):
    w = load_warp()
    words, audio = read_words(speed)
    w.refine_onsets(words, audio)
    w.refine_ends(words, audio)
    script = SCRIPT.read_text(encoding='utf-8').split()
    print(f'speed {speed}: words {len(words)} (script {len(script)}), audio {len(audio) / SR:.2f} s, '
          f'first onset {words[0]["s"]:.3f}, last end {words[-1]["e"]:.3f}')
    mismatch = [i for i, (a, b) in enumerate(zip(words, script)) if a['w'] != b]
    print('tokens that differ from the script:', mismatch[:10])
    return words, audio


def trim_long_pauses(audio, min_pause=0.4, keep=0.3):
    """Shortens the silences between sentences that are longer than min_pause to keep seconds. The speech on both
    sides is kept whole. Returns the new audio and the removals, for mapping the word times."""
    hop = int(0.01 * SR)
    n = len(audio) // hop
    db = 20 * np.log10(np.sqrt((audio[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)
    quiet = db < db.max() - 35
    edge = int(round((keep / 2) * SR))
    removals, i = [], 0
    while i < n:
        if not quiet[i]:
            i += 1
            continue
        j = i
        while j < n and quiet[j]:
            j += 1
        s0, s1 = i * hop, min(j * hop, len(audio))
        if i > 0 and j < n and (s1 - s0) / SR >= min_pause:
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


def build(speed):
    words, audio = analyze(speed)
    start = max(0.0, words[0]['s'] - EDGE)
    audio = audio[int(round(start * SR)):]
    for x in words:
        x['s'] -= start
        x['e'] -= start
    audio, removed = trim_long_pauses(audio)
    if removed:
        w = load_warp()
        for x in words:
            x['s'] = map_time(x['s'], removed)
            x['e'] = map_time(x['e'], removed)
        w.refine_onsets(words, audio)
        w.refine_ends(words, audio)
        print(f'long pauses shortened: {len(removed)}; voice length now {len(audio) / SR:.2f} s')
    shift = 0.0
    out = []
    for x in words:
        out.append({'w': x['w'], 's': round(x['s'] - shift, 3), 'e': round(x['e'] - shift, 3)})
    raw = ROOT / 'out' / 'voice_continuous_raw.wav'
    raw.parent.mkdir(parents=True, exist_ok=True)
    import wave
    with wave.open(str(raw), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(audio, -1.0, 1.0) * 32767).astype('<i2').tobytes())
    dest = ROOT / 'public' / 'audio' / 'janitor' / 'voice.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(raw), '-af', 'loudnorm=I=-16:TP=-1:LRA=11',
                    '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', str(dest)], check=True)
    (ROOT / 'janitor-short' / 'voice' / 'words.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n',
                                                                 encoding='utf-8')
    print('wrote', dest, 'and words.json; voice length', round(len(audio) / SR, 2), 's; first word at', out[0]['s'])


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'analyze'
    speed = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
    if cmd == 'gen':
        gen(speed)
    elif cmd == 'analyze':
        analyze(speed)
    elif cmd == 'build':
        build(speed)
