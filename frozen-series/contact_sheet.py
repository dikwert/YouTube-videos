#!/usr/bin/env python3
"""Контрольный лист: кадры серии с подписями секунд (шрифт DejaVu, кириллица читается).

  python3 frozen-series/contact_sheet.py frozen-series/stills1 out/part1_sheet.jpg [колонок] [ширина миниатюры]
Берёт файлы f_SSS.png (SSS — секунда кадра), собирает сетку по порядку времени.
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def main():
    src = Path(sys.argv[1])
    out = Path(sys.argv[2])
    cols = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    tw = int(sys.argv[4]) if len(sys.argv) > 4 else 252
    th = int(round(tw * 1920 / 1080))
    files = sorted(src.glob('f_*.png'), key=lambda p: int(re.search(r'f_(\d+)', p.name).group(1)))
    if not files:
        raise SystemExit(f'нет кадров в {src}')
    pad, lab = 8, 34
    rows = -(-len(files) // cols)
    sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), (18, 18, 18))
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
    d = ImageDraw.Draw(sheet)
    for k, f in enumerate(files):
        sec = int(re.search(r'f_(\d+)', f.name).group(1))
        im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
        x = pad + (k % cols) * (tw + pad)
        y = pad + (k // cols) * (th + lab + pad)
        d.text((x + 4, y + 4), f'{sec} с', font=font, fill=(255, 214, 10))
        sheet.paste(im, (x, y + lab))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=90)
    print('лист', out, len(files), 'кадров')


if __name__ == '__main__':
    main()
