"""Кадры Части 4: фура встала, лёг на пол, пломба, двери, водитель, побег через лес, поляна с тремя фурами, стук изнутри.
Пишет frozen-series/plates/p4_XX_*.png. Запуск: python3 frozen-series/art/plates4.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from paint import *  # noqa: F401,F403
from objects import *  # noqa: F401,F403
from plates1 import interior, frost_on, finish  # noqa: F401
from objects2 import *  # noqa: F401,F403


def p4_01_recap():
    img = forest_road(stopped=True, seed=121)
    img = reefer_rear(img, 540, 1460, w=560, h=700)
    img = frost_on(img, 121, 800, 120)
    finish(img, 'p4_01_recap', 0.6)


def p4_02_stop_lights():
    img = ribbed_wall(W, H, base=(44, 60, 70), rib=96, seed=122)
    img = glow(img, 540, 160, 340, (255, 60, 40), 0.22)
    img = paste_alpha(img, floor_plate(W, 620, seed=122), (0, H - 620))
    img = vapor(img, 540, 1400, n=4, seed=122, strength=60)
    img = frost_on(img, 122, 500, 110)
    finish(img, 'p4_02_stop_lights', 0.8)


def p4_03_lying():
    img = interior(lamp=(540, 240), lamp_strength=0.25, cold=(46, 66, 76))
    img = lying(img, 540, 1500, s=1.05, rim_color=(170, 210, 240))
    img = vapor(img, 300, 1400, n=3, seed=123, strength=70)
    img = frost_on(img, 123, 900, 140)
    finish(img, 'p4_03_lying', 0.8)


def p4_04_dead():
    img = interior(lamp=(540, 240), lamp_strength=0.15, cold=(40, 60, 74))
    img = lying(img, 540, 1500, s=1.05, rim_color=(120, 170, 220))
    img = frost_on(img, 124, 2200, 170)
    finish(img, 'p4_04_dead', 0.85)


def p4_05_pallet_edge():
    img = vgrad(W, H, (20, 26, 32), (8, 10, 14))
    img = put(img, pallet_wrapped(1080, 1000, seed=125), 0, 620)
    img = frost_on(img, 125, 900, 130)
    finish(img, 'p4_05_pallet_edge', 0.7)


def p4_06_seal_broken():
    img = steel_door(dented=False, seal_light=False, seed=126)
    for x, y, a in [(360, 760, 20), (560, 690, -35), (700, 1000, 60), (420, 1120, 10)]:
        piece = Image.new('RGBA', (120, 46), (0, 0, 0, 0))
        ImageDraw.Draw(piece).rounded_rectangle([0, 0, 119, 45], radius=8, fill=(236, 170, 36, 255))
        img = put(img, piece.rotate(a, resample=BICUBIC, expand=True), x, y)
    img = dust(img, seed=126, n=120, alpha=120)
    finish(img, 'p4_06_seal_broken', 0.7)


def p4_07_doors_open():
    img = vgrad(W, H, (210, 226, 236), (120, 140, 156))
    d = ImageDraw.Draw(img)
    d.polygon([(0, 0), (240, 120), (240, 1800), (0, 1920)], fill=(74, 84, 92, 255))
    d.polygon([(W, 0), (W - 240, 120), (W - 240, 1800), (W, 1920)], fill=(74, 84, 92, 255))
    img = glow(img, 540, 900, 520, (255, 250, 240), 0.5)
    img = frost_on(img, 127, 800, 130)
    finish(img, 'p4_07_doors_open', 0.5)


def p4_08_flash_blind():
    img = vgrad(W, H, (240, 244, 250), (170, 190, 205))
    img = beam(img, [(0, 0), (W, 0), (W, H), (0, H)], alpha=120, blur=10, color=(255, 255, 255))
    img = glow(img, 540, 900, 800, (255, 255, 255), 0.6)
    finish(img, 'p4_08_flash_blind', 0.4)


def p4_09_climb_in():
    img = interior(lamp=(540, 240), lamp_strength=0.25, cold=(50, 72, 84))
    img = person(img, 620, 1720, h=860, angle=-14.0, rim_color=(255, 200, 140))
    img = frost_on(img, 128, 700, 120)
    finish(img, 'p4_09_climb_in', 0.75)


def p4_10_boots_near():
    img = floor_plate(W, H, seed=129)
    L = layer()
    d = ImageDraw.Draw(L)
    boot(d, 150, 1900, s=3.4)
    boot(d, 640, 1870, s=3.0)
    img = soft(img, L, 4)
    img = frost_on(img, 129, 700, 120)
    finish(img, 'p4_10_boots_near', 0.8)


def p4_11_beam_sweep():
    img = floor_plate(W, H, seed=130)
    L = layer()
    boot(ImageDraw.Draw(L), 380, 1100, s=1.2)
    img = soft(img, L, 2)
    img = beam(img, [(0, 0), (120, 0), (1000, H), (480, H)], alpha=110, blur=26)
    img = frost_on(img, 130, 600, 120)
    finish(img, 'p4_11_beam_sweep', 0.8)


def p4_12_leaning():
    img = interior(lamp=(540, 240), lamp_strength=0.25, cold=(50, 72, 84))
    img = lying(img, 700, 1560, s=1.0, rim_color=(170, 210, 240))
    img = person(img, 300, 1760, h=980, angle=-18, rim_color=(255, 200, 140))
    img = frost_on(img, 131, 800, 130)
    finish(img, 'p4_12_leaning', 0.75)


def p4_13_pallet_tip():
    img = interior(lamp=(540, 240), lamp_strength=0.2, cold=(50, 72, 84))
    pal = pallet_wrapped(460, 520, seed=132).rotate(22, resample=BICUBIC, expand=True)
    img = put(img, pal, 360, 760)
    img = streaks(img, seed=132, n=30, alpha=60)
    img = frost_on(img, 132, 600, 120)
    finish(img, 'p4_13_pallet_tip', 0.8)


def p4_14_falls():
    img = interior(lamp=(540, 240), lamp_strength=0.12, cold=(50, 72, 84))
    img = beam(img, [(0, 0), (160, 0), (1000, 1500), (700, H)], alpha=60, blur=30)
    img = person(img, 500, 1600, h=860, angle=-62, rim_color=(255, 200, 140))
    img = frost_on(img, 133, 700, 120)
    finish(img, 'p4_14_falls', 0.7)


def p4_15_jump_snow():
    img = snow_field(horizon=1240, seed=134)
    img = person(img, 520, 1000, h=720, angle=-30, rim_color=(200, 230, 255))
    L = layer()
    ImageDraw.Draw(L).ellipse([430, 1180, 1200, 1700], fill=(226, 236, 244, 255))
    img = soft(img, L, 2)
    img = frost_on(img, 134, 700, 120)
    finish(img, 'p4_15_jump_snow', 0.6)


def p4_16_run_trees():
    img = snow_field(horizon=1180, seed=135)
    img = trunks(img, seed=135, count=16, base_y=1700, color=(12, 18, 24))
    img = streaks(img, seed=135, n=60, alpha=110)
    img = frost_on(img, 135, 500, 110)
    finish(img, 'p4_16_run_trees', 0.7)


def p4_17_dark_trunks():
    img = vgrad(W, H, (10, 14, 18), (4, 6, 8))
    img = trunks(img, seed=136, count=7, base_y=1800, color=(8, 12, 16))
    img = frost_on(img, 136, 400, 90)
    finish(img, 'p4_17_dark_trunks', 0.9)


def p4_18_dark():
    img = vgrad(W, H, (4, 6, 8), (2, 3, 4))
    img = frost_on(img, 137, 200, 70)
    finish(img, 'p4_18_dark', 0.95)


def p4_19_beam_behind():
    img = vgrad(W, H, (10, 14, 18), (4, 6, 8))
    img = trunks(img, seed=138, count=12, base_y=1800, color=(10, 14, 20))
    img = beam(img, [(0, 0), (160, 0), (W, 1000), (W, 1400)], alpha=120, blur=28)
    img = frost_on(img, 138, 400, 100)
    finish(img, 'p4_19_beam_behind', 0.8)


def p4_20_drift():
    img = snow_field(horizon=900, seed=139)
    L = layer()
    d = ImageDraw.Draw(L)
    d.ellipse([-200, 1000, 1280, 2100], fill=(226, 236, 244, 255))
    d.ellipse([-100, 1080, 1180, 2000], fill=(180, 196, 210, 120))
    img = soft(img, L, 6)
    img = frost_on(img, 139, 1500, 150)
    finish(img, 'p4_20_drift', 0.7)


def p4_21_clearing():
    img = snow_field(horizon=1100, seed=140)
    img = pines(img, seed=140, base_y=1120, count=10, hmin=520, hmax=900, dark=(10, 18, 26))
    img = reefer_side(img, 40, 880, 380, 380, logo=True)
    img = reefer_side(img, 360, 900, 380, 380, logo=True)
    img = reefer_side(img, 680, 860, 380, 400, logo=True)
    img = frost_on(img, 140, 600, 120)
    finish(img, 'p4_21_clearing', 0.6)


def p4_22_logo_close():
    img = vgrad(W, H, (16, 22, 28), (6, 8, 10))
    img = reefer_side(img, 60, 300, 960, 1200, logo=True)
    img = frost_on(img, 141, 900, 130)
    finish(img, 'p4_22_logo_close', 0.7)


def p4_23_knock_inside():
    img = steel_door(dented=True, seal_light=True, seed=142)
    L = layer()
    ImageDraw.Draw(L).rectangle([110, 1500, 970, 1740], fill=(255, 170, 90, 90))
    img = soft(img, L, 6)
    img = glow(img, 540, 1000, 600, (255, 170, 90), 0.12)
    img = frost_on(img, 142, 800, 130)
    finish(img, 'p4_23_knock_inside', 0.7)


def p4_24_handprint():
    img = steel_door(dented=False, seal_light=True, seed=143)
    img = frost_on(img, 143, 1400, 170)
    img = handprint(img, 500, 980, s=1.8)
    finish(img, 'p4_24_handprint', 0.8)


PLATES = [p4_01_recap, p4_02_stop_lights, p4_03_lying, p4_04_dead, p4_05_pallet_edge, p4_06_seal_broken,
          p4_07_doors_open, p4_08_flash_blind, p4_09_climb_in, p4_10_boots_near, p4_11_beam_sweep, p4_12_leaning,
          p4_13_pallet_tip, p4_14_falls, p4_15_jump_snow, p4_16_run_trees, p4_17_dark_trunks, p4_18_dark,
          p4_19_beam_behind, p4_20_drift, p4_21_clearing, p4_22_logo_close, p4_23_knock_inside, p4_24_handprint]

if __name__ == '__main__':
    for fn in PLATES:
        fn()
