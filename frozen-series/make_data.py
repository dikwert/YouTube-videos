#!/usr/bin/env python3
"""Собирает данные части для Remotion: сцены (кадры) по строкам озвучки, карточки субтитров, HUD.

  python3 frozen-series/make_data.py 1
Пишет src/frozen/data/part{n}_full.json.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'src' / 'frozen' / 'data'

# Кадры Части 1: (файл кадра, индекс первой строки озвучки, эффект)
SCENES = {
    1: [
        ('p1_01_hook', 0, 'hook'), ('p1_02_hands', 1, 'hands'), ('p1_03_sitting', 2, 'sway'),
        ('p1_04_warehouse', 4, 'slow'), ('p1_05_truck_dock', 6, 'slow'), ('p1_06_doorway', 8, 'sway'),
        ('p1_07_lamp_flicker', 10, 'flicker'), ('p1_08_door_slam', 11, 'knock'), ('p1_09_fist_door', 12, 'knock'),
        ('p1_10_engine', 14, 'shake'), ('p1_11_moving', 16, 'shake'), ('p1_12_phone', 19, 'slow'),
        ('p1_13_thermo_fall', 22, 'slow'), ('p1_14_frost_collar', 26, 'breath'), ('p1_15_flashlight', 28, 'slow'),
        ('p1_16_jacket_floor', 30, 'slow'), ('p1_17_pass', 32, 'slow'), ('p1_18_pass_name', 33, 'slow'),
        ('p1_19_flyer', 35, 'slow'), ('p1_20_gate', 38, 'sway'), ('p1_21_stopped', 40, 'slow'),
        ('p1_22_footsteps', 43, 'knock'),
    ],
}
KEYS = {1: [['пропал'], ['два', 'года']]}
HUD = {
    1: {'temp': [[0, -10], [40, -15]], 'battery': [[0, 11], [60, 3]]},
}


def norm(w):
    return re.sub(r'[^а-яёa-z0-9]', '', w.lower().replace('ё', 'е'))


def cards_for(part, lines):
    keys = KEYS.get(part, [])
    cards = []
    for line in lines:
        words = line['words']
        if not words:
            continue
        n = len(words)
        groups = max(1, -(-n // 4))           # at most 4 words per card
        size = -(-n // groups)
        for g in range(groups):
            chunk = words[g * size:(g + 1) * size]
            if not chunk:
                continue
            toks = [norm(x['w']) for x in chunk]
            red = [False] * len(chunk)
            for key in keys:
                for i in range(len(toks) - len(key) + 1):
                    if toks[i:i + len(key)] == key:
                        for j in range(len(key)):
                            red[i + j] = True
            cards.append({'s': chunk[0]['s'], 'e': chunk[-1]['e'] + 0.12,
                          'words': [{'w': x['w'], 'red': r} for x, r in zip(chunk, red)]})
    for i in range(len(cards) - 1):
        cards[i]['e'] = min(cards[i]['e'], cards[i + 1]['s'] - 0.02)
    return cards


def main(part):
    tl = json.loads((DATA / f'part{part}.json').read_text(encoding='utf-8'))
    lines = tl['lines']
    voiced_index = {l['i']: k for k, l in enumerate(lines)}
    scenes = []
    for k, (plate, first, fx) in enumerate(SCENES[part]):
        start = 0.0 if k == 0 else lines[voiced_index[first]]['start']
        end = tl['duration'] if k == len(SCENES[part]) - 1 else None
        scenes.append({'plate': plate, 'fx': fx, 'start': start, 'end': end})
    for k in range(len(scenes) - 1):
        scenes[k]['end'] = scenes[k + 1]['start']
    cards = cards_for(part, lines)
    out = {'part': part, 'duration': tl['duration'], 'recap': tl.get('recap'), 'recap_hold': tl.get('recap_hold', 0.0),
           'scenes': scenes, 'cards': cards, 'hud': HUD[part]}
    (DATA / f'part{part}_full.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'часть {part}: сцен {len(scenes)}, карточек {len(cards)}, длина {tl["duration"]} с')


if __name__ == '__main__':
    for a in sys.argv[1:]:
        main(int(a))
