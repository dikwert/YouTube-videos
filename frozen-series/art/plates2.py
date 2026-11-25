"""Кадры Части 2: шаги за дверью, пломба, водитель в кабине, «Не спи», решётка, батарея 3 %, темнота.
Пишет frozen-series/plates/p2_XX_*.png. Запуск: python3 frozen-series/art/plates2.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from paint import *  # noqa: F401,F403
from objects import *  # noqa: F401,F403
from plates1 import interior, frost_on, finish  # noqa: F401
from objects2 import *  # noqa: F401,F403


def p2_01_recap():
    img = interior(lamp=(540, 300), lamp_strength=0.3)
    img = paste_alpha(img, pass_card('Сергей Котов', 'Выдан: 24.11.2024', x=100, y=1260, w=720, h=440), (0, 0))
    img = frost_on(img, 61, 900, 150)
    finish(img, 'p2_01_recap', 0.75)


def p2_02_steps():
    img = steps_at_door(seed=4)
    img = frost_on(img, 62, 700, 130)
    finish(img, 'p2_02_steps', 0.7)


def p2_03_breath():
    img = interior(lamp=(540, 900), lamp_strength=0.05)
    img = vapor(img, 540, 1000, n=3, seed=63, strength=60)
    img = frost_on(img, 63, 500, 120)
    finish(img, 'p2_03_breath', 0.9)


def p2_04_lock():
    img = steel_door(dented=False, seal_light=True, seed=64)
    L = layer()
    d = ImageDraw.Draw(L)
    d.polygon([(560, 930), (700, 904), (712, 944), (572, 974)], fill=(176, 190, 198, 255))
    d.ellipse([528, 900, 610, 1000], fill=(120, 134, 142, 255))
    img = soft(img, L, 1.0)
    img = glow(img, 600, 950, 320, (255, 170, 90), 0.25)
    img = frost_on(img, 64, 600, 120)
    finish(img, 'p2_04_lock', 0.6)


def p2_05_seal():
    img = steel_door(dented=False, seal_light=False, seed=65)
    L = layer()
    d = ImageDraw.Draw(L)
    d.rounded_rectangle([360, 820, 740, 1100], radius=26, fill=(92, 104, 112, 255))
    d.ellipse([430, 880, 470, 920], fill=(40, 46, 52, 255))
    d.ellipse([630, 1000, 670, 1040], fill=(40, 46, 52, 255))
    d.line([(520, 960), (620, 960)], fill=(180, 190, 198, 255), width=14)
    d.rounded_rectangle([520, 940, 620, 1020], radius=12, fill=(236, 170, 36, 255))
    d.text((532, 968), '№ 7741', font=font(22, True), fill=(60, 36, 10, 255))
    img = soft(img, L, 1.2)
    img = frost_on(img, 65, 500, 110)
    finish(img, 'p2_05_seal', 0.6)


def p2_06_cab_voice():
    img = vgrad(W, H, (22, 34, 48), (8, 12, 18))
    img = glow(img, 560, 900, 700, (60, 110, 170), 0.2)
    L = layer()
    d = ImageDraw.Draw(L)
    d.rounded_rectangle([250, 720, 840, 1420], radius=60, fill=(26, 34, 42, 255))
    d.rounded_rectangle([340, 800, 760, 1060], radius=30, fill=(18, 40, 60, 255))
    img = soft(img, L, 1.5)
    img = glow(img, 550, 930, 360, (120, 190, 255), 0.45)
    img = person(img, 150, 1700, h=820, rim_color=(120, 180, 240))
    img = frost_on(img, 66, 800, 120)
    finish(img, 'p2_06_cab_voice', 0.7)


def p2_07_cab():
    img = cab_interior()
    img = frost_on(img, 67, 500, 110)
    finish(img, 'p2_07_cab', 0.5)


def p2_08_steps_away():
    img = snow_field(horizon=1180, seed=68)
    img = pines(img, seed=68, base_y=1190, count=16, hmin=260, hmax=520)
    img = footprints(img, [(430, 1750, 1.3), (560, 1640, 1.2), (420, 1520, 1.0), (520, 1420, 0.85), (470, 1330, 0.7), (520, 1262, 0.55)])
    img = frost_on(img, 68, 400, 110)
    finish(img, 'p2_08_steps_away', 0.6)


def p2_09_exhaust():
    img = truck_exterior(warm_door=False)
    img = vapor(img, 880, 1450, n=9, seed=69, strength=120)
    img = frost_on(img, 69, 400, 110)
    finish(img, 'p2_09_exhaust', 0.6)


def p2_10_flyers_wall():
    img = ribbed_wall(W, H, base=(56, 80, 92), rib=96, seed=70)
    for x, y, rot, name in ((400, 380, -4, 'Котов Сергей'), (700, 260, 3, 'Белова Нина'), (170, 900, -2, 'Ветров Игорь')):
        img = put(img, mini_flyer(name).rotate(rot, resample=BICUBIC, expand=True), x, y)
    img = frost_on(img, 70, 500, 120)
    finish(img, 'p2_10_flyers_wall', 0.7)


def p2_11_camera():
    img = interior(lamp=(540, 240), lamp_strength=0.25)
    L = layer()
    d = ImageDraw.Draw(L)
    d.rectangle([470, 0, 610, 120], fill=(30, 36, 42, 255))
    d.ellipse([430, 110, 650, 330], fill=(24, 28, 34, 255))
    d.ellipse([500, 170, 580, 250], fill=(40, 46, 54, 255))
    d.ellipse([528, 194, 552, 218], fill=(255, 40, 40, 255))
    img = soft(img, L, 1.5)
    img = glow(img, 540, 206, 120, (255, 40, 40), 0.35)
    img = frost_on(img, 71, 500, 110)
    finish(img, 'p2_11_camera', 0.7)


def p2_12_lamp_swing():
    img = interior(lamp=(540, 300), lamp_strength=0.2)
    L = layer()
    d = ImageDraw.Draw(L)
    d.polygon([(500, 80), (580, 80), (760, 1600), (320, 1600)], fill=(255, 236, 200, 60))
    d.ellipse([500, 40, 580, 120], fill=(255, 236, 200, 220))
    img = soft(img, L, 30)
    img = frost_on(img, 72, 600, 120)
    finish(img, 'p2_12_lamp_swing', 0.8)


def p2_13_thermo21():
    img = interior(lamp=(540, 320), lamp_strength=0.3)
    img = paste_alpha(img, thermometer(-21, 560, 240), (260, 820))
    img = frost_on(img, 73, 1200, 160)
    finish(img, 'p2_13_thermo21', 0.75)


def p2_14_fingers():
    img = vgrad(W, H, (30, 40, 48), (8, 10, 14))
    L = layer()
    d = ImageDraw.Draw(L)
    d.rounded_rectangle([430, 0, 650, H], radius=30, fill=(54, 62, 70, 255))
    for y in range(40, H, 26):
        d.rectangle([420, y, 440, y + 12], fill=(150, 160, 168, 255))
        d.rectangle([640, y, 660, y + 12], fill=(150, 160, 168, 255))
    d.rounded_rectangle([470, 760, 640, 980], radius=40, fill=(88, 98, 108, 255))
    img = soft(img, L, 1.2)
    img = hand_dark(img, 560, 1130, s=2.0, color=(30, 36, 44, 255))
    img = frost_on(img, 74, 1200, 150)
    finish(img, 'p2_14_fingers', 0.8)


def p2_15_jacket_bulky():
    img = interior(lamp=(540, 260), lamp_strength=0.25)
    img = person(img, 540, 1760, h=1000, bulky=True, rim_color=(190, 220, 240))
    img = frost_on(img, 75, 800, 130)
    finish(img, 'p2_15_jacket_bulky', 0.75)


def p2_16_lining():
    img = vgrad(W, H, (58, 66, 76), (36, 42, 50))
    d = ImageDraw.Draw(img)
    for k in range(-H, W, 22):
        d.line([(k, 0), (k + H, H)], fill=(70, 80, 90, 255), width=3)
    d.line([(160, 980), (900, 1040)], fill=(8, 10, 12, 255), width=18)
    d.polygon([(420, 1000), (560, 1008), (600, 1070), (500, 1100), (430, 1050)], fill=(226, 218, 196, 255))
    img = frost_on(img, 76, 700, 120)
    finish(img, 'p2_16_lining', 0.7)


def p2_17_note_folded():
    img = vgrad(W, H, (40, 52, 62), (12, 16, 20))
    img = frost_on(img, 77, 1600, 150)
    p = paper(['Не спи.', ''], w=640, h=460, size=50, tone=((226, 220, 200), (190, 182, 158)))
    img = put(img, p.rotate(-8, resample=BICUBIC, expand=True), 220, 980)
    img = beam(img, [(0, 0), (260, 0), (900, 1700), (560, 1920)], alpha=60, blur=40)
    finish(img, 'p2_17_note_folded', 0.8)


def p2_18_note_full():
    img = vgrad(W, H, (34, 46, 56), (10, 14, 18))
    p = paper(['Не спи.', 'Вентиляция сзади.', 'Он не останавливается', 'до самого леса.'], w=800, h=600, size=50)
    img = put(img, p.rotate(-3, resample=BICUBIC, expand=True), 150, 740)
    img = beam(img, [(0, 0), (240, 0), (1000, 1200), (700, 1700)], alpha=50, blur=40)
    img = frost_on(img, 78, 700, 120)
    finish(img, 'p2_18_note_full', 0.8)


def p2_19_crack_forest():
    img = steel_door(dented=False, seal_light=False, seed=79)
    fr = forest_road(stopped=False, seed=79)
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rectangle([430, 420, 650, 1480], fill=255)
    img.paste(fr, (0, 0), mask)
    img = frost_on(img, 79, 600, 120)
    finish(img, 'p2_19_crack_forest', 0.7)


def p2_20_grate_beam():
    img = ribbed_wall(W, H, base=(60, 86, 98), rib=64, seed=80)
    img = grate(img, 300, 640, 480, 520)
    img = beam(img, [(0, 0), (200, 0), (700, 760), (420, 900)], alpha=110, blur=30)
    img = frost_on(img, 80, 700, 130)
    finish(img, 'p2_20_grate_beam', 0.7)


def p2_21_boot_step():
    img = floor_plate(W, H, seed=81)
    L = layer()
    boot(ImageDraw.Draw(L), 300, 1820, s=2.4, col=(8, 10, 14, 255))
    img = soft(img, L, 3)
    img = beam(img, [(0, 0), (420, 0), (860, 1920), (300, 1920)], alpha=80, blur=34)
    img = frost_on(img, 81, 900, 130)
    finish(img, 'p2_21_boot_step', 0.8)


def p2_22_battery3():
    img = vgrad(W, H, (30, 36, 42), (12, 16, 20))
    img = paste_alpha(img, phone(3, signal=False), (0, 0))
    img = frost_on(img, 82, 500, 100)
    finish(img, 'p2_22_battery3', 0.8)


def p2_23_dark():
    img = vgrad(W, H, (8, 10, 13), (3, 4, 6))
    img = vapor(img, 540, 1100, n=4, seed=83, strength=30)
    img = frost_on(img, 83, 400, 90)
    finish(img, 'p2_23_dark', 0.95)


PLATES = [p2_01_recap, p2_02_steps, p2_03_breath, p2_04_lock, p2_05_seal, p2_06_cab_voice, p2_07_cab,
          p2_08_steps_away, p2_09_exhaust, p2_10_flyers_wall, p2_11_camera, p2_12_lamp_swing, p2_13_thermo21,
          p2_14_fingers, p2_15_jacket_bulky, p2_16_lining, p2_17_note_folded, p2_18_note_full, p2_19_crack_forest,
          p2_20_grate_beam, p2_21_boot_step, p2_22_battery3, p2_23_dark]

if __name__ == '__main__':
    for fn in PLATES:
        fn()
