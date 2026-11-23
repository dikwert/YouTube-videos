#!/usr/bin/env python3
# Writes out/pilot_voiceover.txt for PilotShort: the spoken text in order, 3-4 words per line.
# Words come from voice/script.txt (paragraphs) and are checked against voice/words.json (ElevenLabs word times).
# Each paragraph gets a bracketed start time (seconds) taken from words.json.
import json
import math
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(ROOT, 'pilot-short', 'voice', 'script.txt')
WORDS = os.path.join(ROOT, 'pilot-short', 'voice', 'words.json')
OUT = os.path.join(ROOT, 'out', 'pilot_voiceover.txt')


def phrases(ws):
    """Splits a paragraph into the fewest lines of 3-4 words, sizes as even as possible."""
    n = len(ws)
    if n <= 4:
        return [ws]
    k = math.ceil(n / 4)
    out, i = [], 0
    for j in range(k):
        size = math.floor((n - i) / (k - j) + 0.5)
        out.append(ws[i:i + size])
        i += size
    return out


def main():
    with open(SCRIPT, encoding='utf-8') as f:
        script = f.read()
    with open(WORDS, encoding='utf-8') as f:
        words = json.load(f)

    paras = [p.split() for p in re.split(r'\n\s*\n', script.strip()) if p.strip()]
    flat = [t for p in paras for t in p]
    if len(flat) != len(words):
        raise SystemExit(f'word count mismatch: script {len(flat)} vs words.json {len(words)}')

    warnings = []
    lines = ['THE PILOT WENT TO THE BATHROOM - VOICEOVER',
             '3-4 words per line, in spoken order. Bracketed lines give the start time (seconds) of each paragraph and the speaker.']
    idx = 0
    for p in paras:
        start = words[idx]['s']
        lines.append('')
        lines.append(f'[{start:.1f} s  KEVIN]')
        for line in phrases(p):
            if len(line) < 3 or len(line) > 4:
                warnings.append(f'"{" ".join(line)}" has {len(line)} words')
            lines.append(' '.join(line))
        idx += len(p)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'wrote {os.path.relpath(OUT, ROOT)} ({len(paras)} paragraphs, {len(flat)} words)')
    if warnings:
        print('WARNINGS: ' + '; '.join(warnings))


if __name__ == '__main__':
    main()
