#!/usr/bin/env python3
"""Moves the picture's times to the new narration.

Every time in the picture and in the sound mix was set on the old narration's words (janitor-short/voice/words_v1.json).
The new take is the same words at new times (janitor-short/voice/words.json). W maps each old word onset to the new
one, linearly in between, so a cut, a reaction or a sound that sat on a word moves with that word. Relative times
inside a shot (t > K) are moved with the shot's start. The sources are the base copies in
janitor-short/voice/picture_base/, so the script can be run again from the same base.

  python3 scripts/janitor-picture-warp.py     writes src/janitor/shots.tsx and scripts/janitor-mix.py
"""
import json
import re
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'janitor-short' / 'voice' / 'picture_base'
REF = ROOT / 'janitor-short' / 'voice' / 'words_v1.json'
NEW = ROOT / 'janitor-short' / 'voice' / 'words.json'


def load_map():
    ref = json.loads(REF.read_text(encoding='utf-8'))
    ref = ref if isinstance(ref, list) else ref['words']
    new = json.loads(NEW.read_text(encoding='utf-8'))
    new = new if isinstance(new, list) else new['words']
    assert len(ref) == len(new) == 193, (len(ref), len(new))
    old_on = np.array([w['s'] for w in ref], dtype=float)
    new_on = np.array([w['s'] for w in new], dtype=float)
    return old_on, new_on


def W(t, old_on, new_on):
    if t <= old_on[0]:
        return float(new_on[0] + (t - old_on[0]))
    if t >= old_on[-1]:
        return float(new_on[-1] + (t - old_on[-1]))
    return float(np.interp(t, old_on, new_on))


def fmt(x):
    s = f'{x:.3f}'.rstrip('0').rstrip('.')
    return s if s not in ('', '-') else '0'


def warp_shots(old_on, new_on):
    base = (BASE / 'shots.tsx').read_text(encoding='utf-8')
    # 1. relative times inside each shot, moved with the shot's old start (taken from the base)
    blocks = re.split(r"(?=\n\s*\{\s*\n?\s*id: ')|(?=\n\s*id: ')", base)
    parts = []
    for block in blocks:
        m = re.search(r"\ba: (\d+(?:\.\d+)?)", block)
        if m and re.search(r"\bt [<>]=?", block):
            a_old = float(m.group(1))

            def rel(mm, a_old=a_old):
                return f"t {mm.group(1)} {fmt(W(a_old + float(mm.group(2)), old_on, new_on) - W(a_old, old_on, new_on))}"
            block = re.sub(r"\bt ([<>]=?) (\d+(?:\.\d+)?)", rel, block)
        parts.append(block)
    text = ''.join(parts)
    # 2. the absolute times of the countdown, the mouth window and the kicks
    text = re.sub(r"\b(g [<>]=?) (\d+(?:\.\d+)?)",
                  lambda mm: f"{mm.group(1)} {fmt(W(float(mm.group(2)), old_on, new_on))}", text)
    text = re.sub(r"kicks: \[([0-9., ]+)\]",
                  lambda mm: 'kicks: [' + ', '.join(fmt(W(float(v), old_on, new_on)) for v in mm.group(1).split(',')) + ']',
                  text)
    # 3. the shot boundaries a and b, last (their old values are no longer needed)
    text = re.sub(r"\b([ab]): (\d+(?:\.\d+)?)\b",
                  lambda mm: f"{mm.group(1)}: {fmt(W(float(mm.group(2)), old_on, new_on))}", text)
    (ROOT / 'src' / 'janitor' / 'shots.tsx').write_text(text, encoding='utf-8')
    return text


def warp_mix(old_on, new_on):
    text = (BASE / 'janitor-mix.py').read_text(encoding='utf-8')
    head, sep, rest = text.partition('EVENTS = [')
    body, sep2, tail = rest.partition('\n]')
    body = re.sub(r"\((\d+\.\d+), lambda",
                  lambda mm: f"({fmt(W(float(mm.group(1)), old_on, new_on))}, lambda", body)
    (ROOT / 'scripts' / 'janitor-mix.py').write_text(head + sep + body + sep2 + tail, encoding='utf-8')


if __name__ == '__main__':
    old_on, new_on = load_map()
    print('the picture end 67.0 s moves to', round(W(67.0, old_on, new_on), 3), 's')
    print('countdown digit thresholds:', round(W(14.1, old_on, new_on), 3), round(W(14.93, old_on, new_on), 3))
    warp_shots(old_on, new_on)
    warp_mix(old_on, new_on)
    print('wrote src/janitor/shots.tsx and scripts/janitor-mix.py')
