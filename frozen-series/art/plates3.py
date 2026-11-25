"""Кадры Части 3: темнота и холод, ползком вдоль паллетов, четыре болта, ремень, труба, радио, лес.
Пишет frozen-series/plates/p3_XX_*.png. Запуск: python3 frozen-series/art/plates3.py"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from paint import *  # noqa: F401,F403
from objects import *  # noqa: F401,F403
from plates1 import interior, frost_on, finish  # noqa: F401
from objects2 import *  # noqa: F401,F403


def p3_01_recap():
    img = vgrad(W, H, (16, 22, 28), (5, 7, 10))
    p = paper(['Не спи.'], w=640, h=420, size=54, tone=((226, 220, 200), (186, 178, 154)))
    img = put(img, p.rotate(-6, resample=BICUBIC, expand=True), 200, 900)
    img = beam(img, [(0, 0), (300, 0), (980, 1500), (640, 1920)], alpha=70, blur=40)
    img = frost_on(img, 91, 1500, 150)
    finish(img, 'p3_01_recap', 0.85)


def p3_02_dark():
    img = vgrad(W, H, (6, 8, 10), (2, 3, 4))
    img = vapor(img, 540, 1000, n=3, seed=92, strength=40)
    img = frost_on(img, 92, 300, 80)
    finish(img, 'p3_02_dark', 0.95)


def p3_03_cracks():
    img = ribbed_wall(W, H, base=(40, 58, 68), rib=96, seed=93)
    img = cracks(img, seed=93, n=34, alpha=170)
    img = frost_on(img, 93, 1000, 150)
    finish(img, 'p3_03_cracks', 0.9)


def p3_04_corridor():
    img = vgrad(W, H, (30, 40, 48), (10, 14, 18))
    img = corridor(img, vp=(540, 880))
    img = frost_on(img, 94, 900, 130)
    finish(img, 'p3_04_corridor', 0.85)


def p3_05_tally():
    img = vgrad(W, H, (20, 26, 32), (8, 10, 14))
    img = paste_alpha(img, pallet_wrapped(W, H, seed=95), (0, 0))
    L = layer()
    d = ImageDraw.Draw(L)
    for g in range(4):
        x0 = 200 + g * 180
        for k in range(4):
            x = x0 + k * 26
            d.line([(x, 700), (x + 8, 1180)], fill=(222, 240, 252, 200), width=6)
        d.line([(x0 - 14, 1160), (x0 + 90, 720)], fill=(222, 240, 252, 200), width=6)
    img = soft(img, L, 1.0)
    img = frost_on(img, 95, 1000, 130)
    finish(img, 'p3_05_tally', 0.8)


def p3_06_hundred():
    img = steel_door(dented=False, seal_light=False, seed=96)
    img = scratch(img, '101', 200, 480, size=200, alpha=180, rot=-4)
    img = scratch(img, '102', 200, 900, size=200, alpha=180, rot=3)
    img = frost_on(img, 96, 800, 130)
    finish(img, 'p3_06_hundred', 0.8)


def p3_07_hand_metal():
    img = steel_door(dented=False, seal_light=False, seed=97)
    img = hand_dark(img, 540, 1000, s=2.6, color=(14, 18, 24, 255))
    img = frost_on(img, 97, 900, 140)
    finish(img, 'p3_07_hand_metal', 0.8)


def p3_08_grate4():
    img = ribbed_wall(W, H, base=(50, 70, 82), rib=80, seed=98)
    img = grate(img, 200, 560, 680, 760)
    img = beam(img, [(0, 0), (160, 0), (760, 900), (420, 1000)], alpha=90, blur=32)
    img = frost_on(img, 98, 800, 130)
    finish(img, 'p3_08_grate4', 0.75)


def p3_09_belt_bolt():
    img = ribbed_wall(W, H, base=(50, 70, 82), rib=80, seed=99)
    img = grate(img, 200, 560, 680, 760, bolts=((1, 0), (0, 1), (1, 1)))
    img = belt_buckle(img, 234, 594, s=1.1)
    img = frost_on(img, 99, 800, 130)
    finish(img, 'p3_09_belt_bolt', 0.75)


def p3_10_smear():
    img = steel_door(dented=False, seal_light=False, seed=100)
    img = smear(img, 520, 980, 240, 170, color=(110, 36, 34), alpha=120, blur=18)
    img = frost_on(img, 100, 900, 140)
    finish(img, 'p3_10_smear', 0.8)


def p3_11_bolts23():
    img = ribbed_wall(W, H, base=(50, 70, 82), rib=80, seed=101)
    img = grate(img, 200, 560, 680, 760, bolts=((0, 1), (1, 1)))
    img = beam(img, [(0, 0), (160, 0), (760, 900), (420, 1000)], alpha=70, blur=32)
    img = frost_on(img, 101, 800, 130)
    finish(img, 'p3_11_bolts23', 0.75)


def p3_12_eyes():
    img = ribbed_wall(W, H, base=(40, 56, 66), rib=80, seed=102)
    img = grate(img, 200, 560, 680, 760, bolts=((0, 1), (1, 1)))
    img = vignette(img, 0.98)
    img = img.filter(ImageFilter.GaussianBlur(10))
    finish(img, 'p3_12_eyes', 0.95)


def p3_13_grate_fall():
    img = vgrad(W, H, (16, 22, 28), (5, 7, 10))
    tmp = grate(layer(), 240, 500, 600, 700, bolts=((1, 1),))
    tmp = tmp.rotate(24, resample=BICUBIC, center=(540, 850))
    img.alpha_composite(tmp)
    img = dust(img, seed=104, n=220, alpha=140)
    finish(img, 'p3_13_grate_fall', 0.8)


def p3_14_pipe_warm():
    img = ribbed_wall(W, H, base=(40, 56, 66), rib=96, seed=105)
    img = pipe_mouth(img, cx=540, cy=900, r=260, warm=True)
    img = vapor(img, 540, 760, n=5, seed=106, strength=70)
    img = frost_on(img, 105, 700, 120)
    finish(img, 'p3_14_pipe_warm', 0.75)


def p3_15_radio_on():
    img = vgrad(W, H, (16, 20, 24), (6, 8, 10))
    img = radio(img, cx=540, cy=980, lit=True)
    img = frost_on(img, 107, 500, 110)
    finish(img, 'p3_15_radio_on', 0.8)


def p3_16_cab_pipe():
    img = vgrad(W, H, (16, 20, 24), (6, 8, 10))
    cab = cab_interior()
    L = layer()
    ImageDraw.Draw(L).ellipse([540 - 304, 900 - 304, 540 + 304, 900 + 304], fill=(56, 66, 74, 255))
    img = soft(img, L, 2.0)
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).ellipse([540 - 260, 900 - 260, 540 + 260, 900 + 260], fill=255)
    img.paste(cab, (0, 0), mask)
    img = frost_on(img, 108, 600, 120)
    finish(img, 'p3_16_cab_pipe', 0.8)


def p3_17_scream():
    img = ribbed_wall(W, H, base=(40, 56, 66), rib=96, seed=109)
    img = pipe_mouth(img, cx=540, cy=900, r=260, warm=True)
    img = vapor(img, 540, 820, n=10, seed=110, strength=150)
    img = frost_on(img, 109, 800, 120)
    finish(img, 'p3_17_scream', 0.7)


def p3_18_radio_silence():
    img = vgrad(W, H, (8, 10, 12), (3, 4, 5))
    img = radio(img, cx=540, cy=980, lit=False)
    L = layer()
    ImageDraw.Draw(L).ellipse([520, 420, 560, 460], fill=(255, 210, 120, 220))
    img = soft(img, L, 2.0)
    img = frost_on(img, 111, 300, 90)
    finish(img, 'p3_18_radio_silence', 0.95)


def p3_19_swerve():
    base = forest_road(stopped=False, seed=112)
    img = base.rotate(9, resample=BICUBIC, center=(540, 960))
    img = beam(img, [(360, 1920), (420, 1000), (620, 1000), (720, 1920)], alpha=80, blur=30)
    img = frost_on(img, 112, 800, 120)
    finish(img, 'p3_19_swerve', 0.7)


def p3_20_tires():
    img = snow_field(horizon=900, seed=113)
    img = tire(img, 560, 1260, r=560)
    img = frost_on(img, 113, 700, 130)
    finish(img, 'p3_20_tires', 0.7)


def p3_21_branches():
    img = reefer_side(vgrad(W, H, (20, 28, 36), (8, 10, 14)), 120, 500, 840, 900, logo=False)
    L = layer()
    d = ImageDraw.Draw(L)
    rng = np.random.default_rng(114)
    for _ in range(14):
        x = rng.uniform(0, W)
        y = rng.uniform(0, H)
        d.line([(x, y), (x + rng.uniform(-300, 300), y + rng.uniform(200, 500))], fill=(16, 28, 20, 230), width=int(rng.uniform(8, 16)))
    img = soft(img, L, 1.0)
    img = frost_on(img, 114, 800, 120)
    finish(img, 'p3_21_branches', 0.8)


def p3_22_forest_in():
    img = snow_field(horizon=1240, seed=115)
    img = pines(img, seed=115, base_y=1260, count=18, hmin=560, hmax=1000, dark=(10, 18, 26))
    for x, y in ((470, 1210), (610, 1210)):
        img = glow(img, x, y, 120, (255, 40, 40), 0.35)
    img = frost_on(img, 115, 500, 110)
    finish(img, 'p3_22_forest_in', 0.6)


PLATES = [p3_01_recap, p3_02_dark, p3_03_cracks, p3_04_corridor, p3_05_tally, p3_06_hundred, p3_07_hand_metal,
          p3_08_grate4, p3_09_belt_bolt, p3_10_smear, p3_11_bolts23, p3_12_eyes, p3_13_grate_fall, p3_14_pipe_warm,
          p3_15_radio_on, p3_16_cab_pipe, p3_17_scream, p3_18_radio_silence, p3_19_swerve, p3_20_tires,
          p3_21_branches, p3_22_forest_in]

if __name__ == '__main__':
    for fn in PLATES:
        fn()
