#!/usr/bin/env python3
"""Таймлайн «The Town Where Everyone Must Be Late» (Tardyville).

  python3 late-short/timeline.py

Строки берутся из late-short/voice/script.txt (66 строк, как в брифе). Если есть words.json от озвучки —
тайминг берётся из него. Иначе тайминг провизорный (по числу слов), помечается provisional: true.
Пишет src/videos/late/data/timeline.json и (для провизорного режима) тихий mix.wav-заглушку.
"""
import json
import re
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
VOICE = ROOT / 'late-short' / 'voice'
DATA = ROOT / 'src' / 'videos' / 'late' / 'data'
SR = 48000

# 26 шотов: (id, индекс первой строки)
SHOTS = [
    ('OFFICE_HOOK', 0), ('ARREST', 2), ('AERIAL', 4), ('SIGN', 5), ('STRANGE_LAW', 6), ('FLASH_1887', 8),
    ('NOBODY_FIXED', 11), ('LATE_LAW', 12), ('RULE', 14), ('BAKERY', 17), ('SCHOOL', 21), ('WEDDING', 24),
    ('BUS', 25), ('CAKE', 26), ('LUCKILY', 28), ('UNLUCKILY', 30), ('MOVE_IN', 33), ('DREAM_TOWN', 37),
    ('NIGHT_MORNING', 39), ('OFFICE_SHARP', 42), ('FROZE_COPS', 45), ('COURT_TEN', 49), ('WALTER_ENTERS', 52),
    ('NOT_GUILTY', 55), ('GERMANY', 57), ('CALLBACK', 64),
]
# звуковые события: (индекс строки, имя, сдвиг в секундах от начала строки)
SFX_LINES = [(0, 'whoosh', 0.0), (21, 'bell', 0.0), (44, 'ding', 0.0), (47, 'splash', 0.0), (48, 'sirens', 0.0),
             (53, 'gasp', 0.0), (56, 'gavel', 0.0), (56, 'clap', 0.6), (60, 'chalk', 0.0)]
# ровно четыре красных слова: (индекс строки, слово)
RED = {(3, 'arrested'), (7, 'law'), (44, 'sharp'), (56, 'guilty')}


def norm(w):
    return re.sub(r'[^a-z]', '', w.lower())


def load_lines():
    text = (VOICE / 'script.txt').read_text(encoding='utf-8').strip().split('\n')
    lines, stanza_break = [], []
    for raw in text:
        if raw.strip() == '':
            if stanza_break:
                stanza_break[-1] = True
            continue
        lines.append(raw.strip())
        stanza_break.append(False)
    return lines, stanza_break


def provisional(lines, stanza_break):
    """Провизорный тайминг: 0.30 с на слово (речь ускорена до ~60 с), паузы по знакам."""
    t = 0.0
    out = []
    for i, line in enumerate(lines):
        n = len(line.split())
        d = 0.30 * n
        out.append({'idx': i, 'text': line, 's': round(t, 3), 'e': round(t + d, 3)})
        words = [{'w': w, 's': 0.0, 'e': 0.0} for w in line.split()]
        step = d / max(1, n)
        for k, w in enumerate(words):
            w['s'] = round(t + k * step, 3)
            w['e'] = round(t + (k + 1) * step - 0.03, 3)
        out[-1]['words'] = words
        gap = 0.06 + (0.12 if re.search(r'[.!?]["”]?$', line) else 0.0) + (0.2 if stanza_break[i] else 0.0)
        t += d + gap
    return out, round(t, 3)


def cards(lines_full):
    """Фразы по строкам (не больше 4 слов), красные — по (строка, слово) из RED."""
    out = []
    for ln in lines_full:
        words = ln['words']
        n = len(words)
        groups = max(1, -(-n // 4))
        size = -(-n // groups)
        for g in range(groups):
            part = words[g * size:(g + 1) * size]
            if not part:
                continue
            out.append({'s': part[0]['s'], 'e': part[-1]['e'] + 0.12, 'words': [
                {'w': w['w'], 'red': (ln['idx'], norm(w['w'])) in RED} for w in part]})
    for i in range(len(out) - 1):
        out[i]['e'] = min(out[i]['e'], out[i + 1]['s'] - 0.02)
    return out


def main():
    lines, stanza_break = load_lines()
    words_file = VOICE / 'lines.json'
    if words_file.exists():
        real = json.loads(words_file.read_text(encoding='utf-8'))
        lines_full = real['lines']
        wds = json.loads((VOICE / 'words.json').read_text(encoding='utf-8'))
        k = 0
        for ln in lines_full:
            n = len(ln['text'].split())
            ln['idx'] = lines_full.index(ln)
            ln['words'] = wds[k:k + n]
            k += n
        duration = real['duration']
        provisional_flag = False
    else:
        lines_full, duration = provisional(lines, stanza_break)
        provisional_flag = True
    assert len(lines_full) == len(lines), 'строки и тайминг не совпали'
    shots = []
    for k, (sid, first) in enumerate(SHOTS):
        start = lines_full[first]['s']
        end = lines_full[SHOTS[k + 1][1]]['s'] if k + 1 < len(SHOTS) else duration
        shots.append({'id': sid, 'start': round(start, 3), 'end': round(end, 3)})
    sfx = [{'t': round(lines_full[i]['s'] + dt, 3), 'name': n} for i, n, dt in SFX_LINES]
    ticks = [{'t': round(x, 3), 'name': 'tick'} for x in np.arange(0.0, duration, 1.0)]
    data = {'duration': round(duration, 3), 'provisional': provisional_flag, 'fps': 30,
            'shots': shots, 'cards': cards(lines_full), 'sfx': sfx + ticks}
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / 'timeline.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    if provisional_flag:
        (VOICE / 'provisional.json').write_text(json.dumps({'duration': duration, 'lines': lines_full}, ensure_ascii=False, indent=1), encoding='utf-8')
        mix = ROOT / 'public' / 'late' / 'mix.wav'
        mix.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(mix), 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SR)
            wf.writeframes(np.zeros(int((duration + 0.5) * SR), dtype='<i2').tobytes())
    print(f'строк {len(lines)}, шотов {len(shots)}, фраз {len(data["cards"])}, длина {duration:.2f} с'
          f'{" (провизорный тайминг)" if provisional_flag else ""}; красных слов {sum(1 for c in data["cards"] for w in c["words"] if w["red"])}')


if __name__ == '__main__':
    main()
