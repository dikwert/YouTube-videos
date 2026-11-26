#!/usr/bin/env python3
"""Таймлайн короткометражки «The Man Who Returned a Library Book 70 Years Late».

  python3 harold-short/timeline.py

Берёт строки и слова озвучки (harold-short/voice/lines.json, words.json), задаёт 26 сцен и звуковые события,
собирает субтитры: фразы по 2–4 слова, красным — bankrupted, million dollars, 1931.
Пишет src/harold/data/timeline.json.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOICE = ROOT / 'harold-short' / 'voice'
DATA = ROOT / 'src' / 'harold' / 'data'

# сцены: (идентификатор, начало в секундах; совпадает с началом строки озвучки)
SHOTS = [
    ('HOOK', 0.00), ('TITLE_1954', 3.20), ('CHECKOUT', 4.94), ('DUE_STAMP', 7.60), ('MONTAGE', 9.73),
    ('ATTIC', 11.42), ('TABLE', 13.49), ('CAR', 14.55), ('SCAN', 16.12), ('SMOKE', 17.82), ('COUNTER', 19.78),
    ('TOTAL', 23.73), ('MILLION', 24.65), ('WALLET', 27.46), ('GOAT', 29.32), ('COURT', 30.25),
    ('FLASHBACK', 32.37), ('DEED_MAP', 34.98), ('STAMPS', 37.24), ('MAYOR', 42.20), ('WHISPER', 44.47),
    ('TOWN_GAGS', 46.48), ('LAKE', 50.29), ('ROD', 53.72), ('DUE_1931', 56.54), ('OFFICE', 60.17),
]

# звуковые события: (время, имя звука)
SFX = [
    (0.9, 'stamp'), (7.9, 'stamp'), (18.1, 'sparks'), (19.9, 'ching'), (25.9, 'ching_big'), (29.5, 'goat'),
    (31.0, 'gavel'), (33.2, 'ding'), (37.6, 'stamp'), (38.9, 'stamp'), (40.9, 'stamp'), (45.0, 'shh'),
    (46.8, 'horn'), (49.3, 'sneeze'), (49.7, 'ching'), (53.8, 'creak'), (55.0, 'splash'), (56.8, 'stamp'),
    (58.8, 'stamp'),
]

KEYS = [['bankrupted'], ['million', 'dollars'], ['1931']]


def norm(w):
    return re.sub(r'[^a-z0-9]', '', w.lower())


def cards(lines, words):
    """Фразы: строки озвучки, длинные режем на куски по 4 слова; красным — ключевые слова."""
    out = []
    wi = 0
    for line in lines:
        n = len(line['text'].split())
        chunk = words[wi:wi + n]
        wi += n
        groups = max(1, -(-n // 4))
        size = -(-n // groups)
        for g in range(groups):
            part = chunk[g * size:(g + 1) * size]
            if not part:
                continue
            toks = [norm(x['w']) for x in part]
            red = [False] * len(part)
            for key in KEYS:
                for i in range(len(toks) - len(key) + 1):
                    if toks[i:i + len(key)] == key:
                        for j in range(len(key)):
                            red[i + j] = True
            out.append({'s': part[0]['s'], 'e': part[-1]['e'] + 0.12,
                        'words': [{'w': x['w'], 'red': r} for x, r in zip(part, red)]})
    for i in range(len(out) - 1):
        out[i]['e'] = min(out[i]['e'], out[i + 1]['s'] - 0.02)
    return out


def main():
    lines = json.loads((VOICE / 'lines.json').read_text(encoding='utf-8'))
    words = json.loads((VOICE / 'words.json').read_text(encoding='utf-8'))
    duration = lines['duration']
    assert len(words) == sum(len(l['text'].split()) for l in lines['lines']), 'слова и строки не совпали'
    shots = []
    for k, (sid, start) in enumerate(SHOTS):
        end = SHOTS[k + 1][1] if k + 1 < len(SHOTS) else duration
        shots.append({'id': sid, 'start': start, 'end': round(end, 3)})
    data = {'duration': duration, 'fps': 30, 'shots': shots,
            'cards': cards(lines['lines'], words), 'sfx': [{'t': t, 'name': n} for t, n in SFX]}
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / 'timeline.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'сцен {len(shots)}, фраз {len(data["cards"])}, звуков {len(SFX)}, длина {duration:.2f} с')


if __name__ == '__main__':
    main()
