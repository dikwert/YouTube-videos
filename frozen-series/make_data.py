#!/usr/bin/env python3
"""Собирает данные части для Remotion: сцены (кадры) по строкам озвучки, карточки субтитров, HUD.

  python3 frozen-series/make_data.py 1 [2 ...]
Таймлайн (part{n}.json) строит build_timeline.py. Пишет src/frozen/data/part{n}_full.json.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'src' / 'frozen' / 'data'

# Кадры: (файл кадра в public/frozen, номер строки в тексте части, с которой кадр идёт, эффект).
# Номер строки — индекс строки в parts.py (RECAP-строка имеет номер 0). Эффекты: sway, shake, knock, flicker, breath, slow.
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
    2: [
        ('p2_01_recap', 0, 'slow'), ('p2_02_steps', 1, 'sway'), ('p2_03_breath', 3, 'slow'),
        ('p2_04_lock', 4, 'shake'), ('p2_05_seal', 6, 'slow'), ('p2_06_cab_voice', 7, 'sway'),
        ('p2_07_cab', 9, 'slow'), ('p2_08_steps_away', 12, 'slow'), ('p2_09_exhaust', 13, 'shake'),
        ('p2_10_flyers_wall', 14, 'slow'), ('p2_11_camera', 16, 'breath'), ('p2_12_lamp_swing', 17, 'sway'),
        ('p2_13_thermo21', 18, 'slow'), ('p2_14_fingers', 19, 'breath'), ('p2_15_jacket_bulky', 20, 'slow'),
        ('p2_16_lining', 22, 'slow'), ('p2_17_note_folded', 24, 'slow'), ('p2_18_note_full', 26, 'slow'),
        ('p2_19_crack_forest', 30, 'sway'), ('p2_20_grate_beam', 31, 'slow'), ('p2_21_boot_step', 35, 'flicker'),
        ('p2_22_battery3', 37, 'slow'), ('p2_23_dark', 38, 'breath'),
    ],
    3: [
        ('p3_01_recap', 0, 'slow'), ('p3_02_dark', 1, 'slow'), ('p3_03_cracks', 2, 'shake'),
        ('p3_04_corridor', 3, 'sway'), ('p3_05_tally', 5, 'slow'), ('p3_06_hundred', 7, 'slow'),
        ('p3_07_hand_metal', 9, 'breath'), ('p3_08_grate4', 11, 'slow'), ('p3_09_belt_bolt', 14, 'shake'),
        ('p3_10_smear', 17, 'breath'), ('p3_11_bolts23', 19, 'slow'), ('p3_12_eyes', 21, 'breath'),
        ('p3_13_grate_fall', 24, 'shake'), ('p3_14_pipe_warm', 26, 'sway'), ('p3_15_radio_on', 30, 'slow'),
        ('p3_16_cab_pipe', 32, 'sway'), ('p3_17_scream', 34, 'shake'), ('p3_18_radio_silence', 36, 'flicker'),
        ('p3_19_swerve', 38, 'shake'), ('p3_20_tires', 41, 'slow'), ('p3_21_branches', 43, 'shake'),
        ('p3_22_forest_in', 44, 'sway'),
    ],
    4: [
        ('p4_01_recap', 0, 'slow'), ('p4_02_stop_lights', 1, 'shake'), ('p4_03_lying', 2, 'breath'),
        ('p4_04_dead', 4, 'slow'), ('p4_05_pallet_edge', 5, 'sway'), ('p4_06_seal_broken', 6, 'shake'),
        ('p4_07_doors_open', 7, 'slow'), ('p4_08_flash_blind', 8, 'flicker'), ('p4_09_climb_in', 10, 'sway'),
        ('p4_10_boots_near', 11, 'knock'), ('p4_11_beam_sweep', 13, 'slow'), ('p4_12_leaning', 14, 'breath'),
        ('p4_13_pallet_tip', 16, 'shake'), ('p4_14_falls', 18, 'shake'), ('p4_15_jump_snow', 19, 'sway'),
        ('p4_16_run_trees', 21, 'knock'), ('p4_17_dark_trunks', 23, 'slow'), ('p4_18_dark', 24, 'breath'),
        ('p4_19_beam_behind', 25, 'flicker'), ('p4_20_drift', 27, 'shake'), ('p4_21_clearing', 29, 'slow'),
        ('p4_22_logo_close', 33, 'sway'), ('p4_23_knock_inside', 35, 'knock'), ('p4_24_handprint', 37, 'breath'),
    ],
    5: [
        ('p5_01_recap', 0, 'slow'), ('p5_02_knock_rings', 1, 'shake'), ('p5_03_three', 2, 'knock'),
        ('p5_04_pause', 3, 'breath'), ('p5_05_three_again', 4, 'knock'), ('p5_06_phone_one', 5, 'slow'),
        ('p5_07_one_bar', 7, 'slow'), ('p5_08_map_pin', 8, 'sway'), ('p5_10_bubble', 11, 'flicker'),
        ('p5_11_screen_off', 12, 'breath'), ('p5_12_crawl_under', 13, 'sway'), ('p5_13_wire', 14, 'slow'),
        ('p5_15_inside_worker', 17, 'slow'), ('p5_16_worker_vest', 18, 'sway'), ('p5_17_blue_cold', 19, 'breath'),
        ('p5_18_breath_alive', 20, 'breath'), ('p5_19_hardhat', 21, 'slow'), ('p5_20_footsteps_beam', 23, 'knock'),
        ('p5_21_beam_trunks', 25, 'sway'), ('p5_22_under_hidden', 28, 'breath'), ('p5_23_beam_close', 31, 'shake'),
        ('p5_24_police_lights', 33, 'flicker'), ('p5_25_sirens_snow', 36, 'flicker'), ('p5_26_cuffs', 38, 'slow'),
        ('p5_27_ambulance', 40, 'sway'), ('p5_28_empty_field', 42, 'slow'), ('p5_29_pass_back', 43, 'slow'),
        ('p5_30_spasibo_ink', 45, 'breath'),
    ],
}

# Ключевые слова субтитров (красным). Слова сравниваются в нижнем регистре, без «ё» и знаков.
KEYS = {
    1: [['пропал'], ['два', 'года']],
    2: [['как', 'в', 'прошлый', 'раз'], ['не', 'спи']],
    3: [['в', 'лес'], ['закричал']],
    4: [['мертвый'], ['изнутри']],
    5: [['полиция'], ['спасибо']],
}

# HUD: температура и заряд батареи по времени части (секунды). Значения переходят из части в часть.
HUD = {
    1: {'temp': [[0, -10], [40, -15]], 'battery': [[0, 11], [60, 3]]},
    2: {'temp': [[0, -15], [29.5, -21], [64, -21]], 'battery': [[0, 3], [60, 3], [64, 2]]},
    3: {'temp': [[0, -21], [64, -23]], 'battery': [[0, 2], [64, 2]]},
    4: {'temp': [[0, -23], [64, -23]], 'battery': [[0, 2], [64, 2]]},
    5: {'temp': [[0, -23], [64, -23]], 'battery': [[0, 2], [9.5, 1], [64, 1]]},
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
