#!/usr/bin/env python3
"""Голос судьи в Tardyville: реплику «Not guilty.» говорит выбранный голос, остальная строфа 19 — Крис.

  python3 late-short/voice/judge.py bill      # bill | adam | daniel, как в gen.py (JUDGE)

Строфа 19 — «The judge smiled. "Not guilty."». Исходный кусок Криса сохраняется как takes/s19_chris.*.
Крис звучит до открывающей кавычки, дальше идёт реплика судьи. Пишет takes/s19.json (с общим
выравниванием слов, в том же формате, что и остальные строфы) и takes/s19.wav.
Потом: gen.py (voice.wav, words.json, lines.json), timeline.py, audio.py.
"""
import base64
import json
import shutil
import subprocess
import sys
from pathlib import Path

import gen


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else 'bill'
    takes = gen.TAKES
    s19 = takes / 's19.json'
    backup = takes / 's19_chris.json'
    if not backup.exists():
        shutil.copy(s19, backup)
        shutil.copy(takes / 's19.mp3', takes / 's19_chris.mp3')
    chris = json.loads(backup.read_text(encoding='utf-8'))['alignment']
    chars = chris['characters']
    st = chris['character_start_times_seconds']
    en = chris['character_end_times_seconds']
    q = next(i for i, c in enumerate(chars) if c in '"“«')
    assert 'smiled' in ''.join(chars[:q]), 'строфа 19 не та'
    cut = st[q]

    judge = takes / f'judge_{name}'
    if not Path(str(judge) + '.json').exists():
        gen.tts(gen.JUDGE[name], 'Not guilty.', judge)
    ba = json.loads(Path(str(judge) + '.json').read_text(encoding='utf-8'))['alignment']
    bchars = ba['characters']
    bst = ba['character_start_times_seconds']
    ben = ba['character_end_times_seconds']
    trim = max(0.0, bst[0] - 0.03)

    wav = takes / 's19.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y',
                    '-i', str(takes / 's19_chris.mp3'), '-i', str(judge) + '.mp3',
                    '-filter_complex',
                    f'[0:a]atrim=end={cut:.4f},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=mono[a];'
                    f'[1:a]atrim=start={trim:.4f},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=mono[b];'
                    '[a][b]concat=n=2:v=0:a=1[out]',
                    '-map', '[out]', '-c:a', 'pcm_s16le', str(wav)], check=True)

    new_chars = chars[:q] + ['"']
    new_st = st[:q] + [round(cut, 4)]
    new_en = en[:q] + [round(cut, 4)]
    for ch, a, b in zip(bchars, bst, ben):
        new_chars.append(ch)
        new_st.append(round(cut + a - trim, 4))
        new_en.append(round(cut + b - trim, 4))
    close = round(cut + ben[-1] - trim, 4)
    new_chars.append('"')
    new_st.append(close)
    new_en.append(close)

    out = {'audio_base64': base64.b64encode(wav.read_bytes()).decode('ascii'),
           'alignment': {'characters': new_chars,
                         'character_start_times_seconds': new_st,
                         'character_end_times_seconds': new_en}}
    s19.write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
    print(f'строфа 19: Крис до {cut:.2f} с, реплика судьи ({name}) до {close:.2f} с, '
          f'длина строфы {close:.2f} с (было {en[-1]:.2f} с)', flush=True)


if __name__ == '__main__':
    main()
