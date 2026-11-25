#!/usr/bin/env python3
"""Озвучка серии строка за строкой через /with-timestamps (eleven_v3). Ключ подставляет сетевой прокси, в файлах его нет.

  python3 frozen-series/voice.py 1 [2 ...]   генерирует части (уже сделанные строки пропускаются)
"""
import base64
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from parts import PARTS  # noqa: E402

CFG = json.loads((ROOT / 'config.json').read_text(encoding='utf-8'))
TAKES = ROOT / 'takes'


def classify(line):
    if line.startswith('RECAP:'):
        return 'recap', line[len('RECAP:'):].strip()
    for tag, role in (('[ВОДИТЕЛЬ]', 'driver'), ('[КОСТЯ]', 'kostya')):
        if line.startswith(tag):
            return role, line[len(tag):].strip()
    return 'narrator', line.strip()


def segments(part):
    lines = [l.strip() for l in PARTS[part].splitlines() if l.strip()]
    return [{'role': r, 'text': t} for r, t in (classify(l) for l in lines)]


def tts(voice_id, text, prev, nxt, base):
    body = {'text': text, 'model_id': CFG['model_id'], 'voice_settings': CFG['voice_settings']}
    if prev:
        body['previous_text'] = prev
    if nxt:
        body['next_text'] = nxt
    bodyf = Path(str(base) + '.body.json')
    bodyf.write_text(json.dumps(body, ensure_ascii=False), encoding='utf-8')
    res = Path(str(base) + '.json')
    code = subprocess.run(['curl', '-sS', '--max-time', '300', '-o', str(res), '-w', '%{http_code}', '-X', 'POST',
                           f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format={CFG["output_format"]}',
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


def gen(part):
    TAKES.mkdir(exist_ok=True)
    segs = segments(part)
    voiced = [i for i, s in enumerate(segs) if s['role'] != 'recap']
    for k, i in enumerate(voiced):
        s = segs[i]
        base = TAKES / f'p{part}_{i:03d}'
        if Path(str(base) + '.json').exists():
            continue
        # eleven_v3 does not take previous_text / next_text, so each line is spoken on its own
        prev = nxt = None
        voice_id = CFG['voices'][s['role']]['voice_id']
        tts(voice_id, s['text'], prev, nxt, base)
        print(f'часть {part} строка {i:03d} [{s["role"]}] {s["text"]}', flush=True)
    print(f'часть {part}: готово, строк озвучено {len(voiced)}', flush=True)


if __name__ == '__main__':
    for arg in sys.argv[1:]:
        gen(int(arg))
