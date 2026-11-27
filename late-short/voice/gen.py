#!/usr/bin/env python3
"""Озвучка короткометражки «The Town Where Everyone Must Be Late» (Tardyville).

  python3 late-short/voice/gen.py            строфы из script.txt, eleven_v3, таймкоды слов
  python3 late-short/voice/gen.py --margaret  тестовые фразы Маргарет в voice-tests/

Ключ ElevenLabs подставляет сетевой прокси, в файлы он не пишется.
Пишет late-short/voice/takes/s{NN}.json и .mp3, late-short/voice/voice.wav,
late-short/voice/words.json (слова с секундами и номерами строк) и lines.json.
"""
import base64
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
TAKES = HERE / 'takes'
SR = 48000
MODEL = 'eleven_v3'
SETTINGS = {'stability': 0.35, 'similarity_boost': 0.8, 'style': 0.3}
NARRATOR = 'iP95p4xoKVk53GoZ742B'          # Chris: американский, разговорный (замена Mike, см. README)
STANZA_GAP = 0.15                           # пауза между строфами, с
SPEED = 1.2                                # голос ускорен (тон сохраняется), чтобы уложиться в ~60 с
JUDGE = {'bill': 'pqHfZKP75CvOlQylNhV4', 'adam': 'pNInz6obpgDQGcFmaJgB', 'daniel': 'onwK4e9ZLuTAKqWW03F9'}


def tts(voice_id, text, base):
    body = {'text': text, 'model_id': MODEL, 'voice_settings': SETTINGS}
    bodyf = Path(str(base) + '.body.json')
    bodyf.write_text(json.dumps(body, ensure_ascii=False), encoding='utf-8')
    res = Path(str(base) + '.json')
    code = subprocess.run(['curl', '-sS', '--max-time', '300', '-o', str(res), '-w', '%{http_code}', '-X', 'POST',
                           f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128',
                           '-H', 'Content-Type: application/json', '--data-binary', f'@{bodyf}'],
                          capture_output=True, text=True, check=True).stdout.strip()
    bodyf.unlink(missing_ok=True)
    if code != '200':
        msg = res.read_text(encoding='utf-8', errors='replace')[:300]
        res.unlink(missing_ok=True)
        raise SystemExit(f'{base.name}: HTTP {code} {msg}')
    d = json.loads(res.read_text(encoding='utf-8'))
    Path(str(base) + '.mp3').write_bytes(base64.b64decode(d['audio_base64']))
    return d


def words_of(al):
    """Слова с секундами внутри одной записи (по символам выравнивания)."""
    words, cur = [], None
    for ch, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if cur is not None:
                words.append(cur)
                cur = None
            continue
        if cur is None:
            cur = {'w': '', 's': s, 'e': e}
        cur['w'] += ch
        cur['e'] = e
    if cur is not None:
        words.append(cur)
    return words


def stanzas():
    text = (HERE / 'script.txt').read_text(encoding='utf-8').strip()
    return [[l.strip() for l in block.split('\n') if l.strip()] for block in text.split('\n\n')]


def decode(mp3):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-af', f'atempo={SPEED}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', 'pipe:1'],
                         input=mp3, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def generate():
    TAKES.mkdir(exist_ok=True)
    all_words, all_lines = [], []
    voice = np.zeros(int(90 * SR))
    t = 0.0
    line_idx = 0
    for si, lines in enumerate(stanzas()):
        text = ' '.join(lines)
        base = TAKES / f's{si:02d}'
        if not Path(str(base) + '.json').exists():
            tts(NARRATOR, text, base)
            print(f'строфа {si:02d}: {text[:60]}', flush=True)
        d = json.loads(Path(str(base) + '.json').read_text(encoding='utf-8'))
        ws = words_of(d['alignment'])
        t0 = ws[0]['s'] if ws else 0.0
        end = ws[-1]['e'] if ws else 0.0
        # распределяем слова по строкам этой строфы (слова идут подряд, строки известны из текста)
        k = 0
        for li, line in enumerate(lines):
            n = len(line.split())
            chunk = ws[k:k + n]
            k += n
            if not chunk:
                continue
            all_lines.append({'idx': line_idx, 'stanza': si, 'text': line, 's': round(t + (chunk[0]['s'] - t0) / SPEED, 3),
                              'e': round(t + (chunk[-1]['e'] - t0) / SPEED, 3)})
            line_idx += 1
        if k != len(ws):
            print(f'  внимание: строфа {si}: в тексте {k} слов, в озвучке {len(ws)}', flush=True)
        for w in ws:
            all_words.append({'w': w['w'], 's': round(t + (w['s'] - t0) / SPEED, 3), 'e': round(t + (w['e'] - t0) / SPEED, 3)})
        pcm = decode(base64.b64decode(d['audio_base64']))
        i0 = int(round((t) * SR))
        seg = pcm[int(round(t0 / SPEED * SR)):int(round(((end - t0) / SPEED + 0.05 + t0 / SPEED) * SR))]
        voice[i0:i0 + seg.size] += seg[:voice.size - i0]
        t += (end - t0) / SPEED + 0.05 + STANZA_GAP
    total = t - STANZA_GAP
    voice = voice[:int(round((total + 0.3) * SR))]
    wav = HERE / 'voice.wav'
    with wave.open(str(wav), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(voice, -1, 1) * 32767).astype('<i2').tobytes())
    (HERE / 'words.json').write_text(json.dumps(all_words, ensure_ascii=False, indent=1), encoding='utf-8')
    (HERE / 'lines.json').write_text(json.dumps({'duration': round(total, 3), 'lines': all_lines}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'готово: строк {len(all_lines)}, слов {len(all_words)}, длина {total:.2f} с -> {wav.name}', flush=True)


def judge_tests():
    phrase = 'Not guilty.'
    out = ROOT / 'voice-tests'
    out.mkdir(exist_ok=True)
    for name, vid in JUDGE.items():
        base = out / f'late-judge-{name}'
        tts(vid, phrase, base)
        Path(str(base) + '.json').unlink(missing_ok=True)
        print('тест судьи:', name, '->', base.name + '.mp3', flush=True)


if __name__ == '__main__':
    if '--judge' in sys.argv:
        judge_tests()
    else:
        generate()
