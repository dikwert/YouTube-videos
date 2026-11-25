"""Обложки 1080x1920: силуэт у промёрзшей двери, термометр −20, название и «ЧАСТЬ X» в центральной зоне."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from paint import *  # noqa
from objects import steel_door, soft_blob
from plates1 import silhouette, frost_on

OUT = Path(__file__).resolve().parents[2] / 'out'


def cover(part, path):
    img = steel_door(dented=True, seal_light=True, seed=70 + part)
    img = glow(img, 540, 1450, 520, (255, 150, 70), 0.18)
    img = frost_on(img, 80 + part, 2000, 170)
    img = silhouette(img, 540, 1740, height=980, seated=False, rim=(255, 180, 120))
    img = paste_alpha(img, thermometer(-20, 460, 200), (310, 170))
    d = ImageDraw.Draw(img)
    f_big = font(132, True)
    f_part = font(88, True)
    lines = ['−20.', 'ЗАПЕРТ', 'В ФУРЕ']
    y = 760
    for ln in lines:
        tw = d.textlength(ln, font=f_big)
        d.text(((W - tw) / 2 + 6, y + 6), ln, font=f_big, fill=(0, 0, 0, 220))
        d.text(((W - tw) / 2, y), ln, font=f_big, fill=(255, 214, 10, 255))
        y += 150
    label = f'ЧАСТЬ {part}'
    tw = d.textlength(label, font=f_part)
    d.text(((W - tw) / 2 + 4, 1210 + 4), label, font=f_part, fill=(0, 0, 0, 220))
    d.text(((W - tw) / 2, 1210), label, font=f_part, fill=(255, 43, 43, 255))
    img = vignette(img, 0.55)
    img = grain(img, 8)
    img.convert('RGB').save(path)
    print('cover', path)


if __name__ == '__main__':
    cover(1, OUT / 'cover1.png')
