"""Кадры Части 1: предметы, тени и силуэты (без детализированных лиц). Пишет frozen-series/plates/p1_XX.png."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from paint import *  # noqa
from objects import *  # noqa

OUT = Path(__file__).resolve().parents[1] / 'plates'
OUT.mkdir(exist_ok=True)


def silhouette(img, cx, base_y, height=900, seated=False, rim=(150, 200, 230), alpha=255):
    """Силуэт человека в тёмной куртке: чёрный контур с холодным контровым светом по краю."""
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    h = height
    if seated:
        d.ellipse([cx - 90, base_y - h * 0.80, cx + 90, base_y - h * 0.62], fill=(10, 12, 16, alpha))
        d.polygon([(cx - 150, base_y - h * 0.60), (cx + 150, base_y - h * 0.60), (cx + 170, base_y - h * 0.18), (cx - 170, base_y - h * 0.18)], fill=(10, 12, 16, alpha))
        d.polygon([(cx - 170, base_y - h * 0.20), (cx + 170, base_y - h * 0.20), (cx + 210, base_y), (cx - 210, base_y)], fill=(10, 12, 16, alpha))
    else:
        d.ellipse([cx - 80, base_y - h * 0.98, cx + 80, base_y - h * 0.82], fill=(10, 12, 16, alpha))
        d.polygon([(cx - 160, base_y - h * 0.80), (cx + 160, base_y - h * 0.80), (cx + 130, base_y - h * 0.38), (cx - 130, base_y - h * 0.38)], fill=(10, 12, 16, alpha))
        d.polygon([(cx - 130, base_y - h * 0.40), (cx - 60, base_y - h * 0.40), (cx - 70, base_y), (cx - 150, base_y)], fill=(10, 12, 16, alpha))
        d.polygon([(cx + 60, base_y - h * 0.40), (cx + 130, base_y - h * 0.40), (cx + 150, base_y), (cx + 70, base_y)], fill=(10, 12, 16, alpha))
        d.polygon([(cx - 170, base_y - h * 0.78), (cx - 200, base_y - h * 0.40), (cx - 160, base_y - h * 0.38), (cx - 140, base_y - h * 0.74)], fill=(10, 12, 16, alpha))
        d.polygon([(cx + 170, base_y - h * 0.78), (cx + 200, base_y - h * 0.40), (cx + 160, base_y - h * 0.38), (cx + 140, base_y - h * 0.74)], fill=(10, 12, 16, alpha))
    rim_layer = layer.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1.5))
    rim_col = Image.new('RGBA', (W, H), rgba(rim, 0))
    rim_col.putalpha(rim_layer.split()[-1].point(lambda v: min(255, int(v * 2.2))))
    layer = Image.alpha_composite(layer, rim_col)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1.1)))
    return img


def frost_on(img, seed=7, count=900, alpha=160):
    img.alpha_composite(frost_layer(seed=seed, count=count, alpha=alpha))
    return img


def finish(img, name, vign=0.6, grain_amt=8):
    img = vignette(img, vign)
    img = grain(img, grain_amt)
    img.convert('RGB').save(OUT / f'{name}.png')
    print('plate', name)


def interior(lamp=(540, 330), lamp_strength=0.45, cold=(60, 84, 96)):
    img = ribbed_wall(W, H, base=cold, rib=64, seed=5)
    img = paste_alpha(img, floor_plate(W, 620, seed=9).resize((W, 620)), (0, H - 620))
    img = glow(img, lamp[0], lamp[1], 520, (150, 180, 170), lamp_strength)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 90], fill=(34, 46, 54, 255))
    for x in range(20, W, 140):
        d.rectangle([x, 96, x + 16, 112], fill=(255, 236, 200, 180))
    return img


def p1_01_hook():
    img = interior(lamp=(540, 300), lamp_strength=0.35)
    img = paste_alpha(img, thermometer(-19, 520, 220), (280, 900))
    img = frost_on(img, 3, 1600, 170)
    img = vapor(img, 540, 1300, n=6, seed=4, strength=90)
    finish(img, 'p1_01_hook', 0.75)


def p1_02_hands():
    img = interior(lamp=(540, 240), lamp_strength=0.25)
    img = paste_alpha(img, gloved_hands(frost=True, shake=3), (0, 0))
    img = frost_on(img, 6, 1000, 150)
    img = vapor(img, 540, 900, n=5, seed=8, strength=80)
    finish(img, 'p1_02_hands', 0.8)


def p1_03_sitting():
    img = interior(lamp=(540, 260), lamp_strength=0.3)
    img = paste_alpha(img, pallet_wrapped(420, 480, seed=2), (60, 1080))
    img = paste_alpha(img, pallet_wrapped(420, 480, seed=5), (600, 1100))
    img = silhouette(img, 360, 1560, height=900, seated=True, rim=(170, 210, 240))
    img = frost_on(img, 9, 900, 140)
    finish(img, 'p1_03_sitting', 0.7)


def p1_04_warehouse():
    img = truck_exterior(warm_door=False)
    img = frost_on(img, 14, 500, 110)
    finish(img, 'p1_04_warehouse', 0.6)


def p1_05_truck_dock():
    img = truck_exterior(warm_door=True)
    img = silhouette(img, 540, 1640, height=760, seated=False, rim=(255, 176, 96))
    img = frost_on(img, 16, 500, 120)
    finish(img, 'p1_05_truck_dock', 0.6)


def p1_06_doorway():
    img = interior(lamp=(540, 240), lamp_strength=0.25, cold=(50, 78, 92))
    img = paste_alpha(img, pallet_wrapped(360, 420, seed=3), (100, 1100))
    img = paste_alpha(img, pallet_wrapped(360, 420, seed=4), (620, 1150))
    img = silhouette(img, 540, 1760, height=980, seated=False, rim=(190, 220, 240))
    img = frost_on(img, 19, 900, 140)
    finish(img, 'p1_06_doorway', 0.75)


def p1_07_lamp_flicker():
    img = interior(lamp=(540, 220), lamp_strength=0.12)
    img = frost_on(img, 22, 700, 120)
    finish(img, 'p1_07_lamp_flicker', 0.85)


def p1_08_door_slam():
    img = steel_door(dented=False, seal_light=True, seed=24)
    img = frost_on(img, 25, 700, 130)
    finish(img, 'p1_08_door_slam', 0.7)


def p1_09_fist_door():
    img = steel_door(dented=True, seal_light=True, seed=26)
    img = frost_on(img, 27, 800, 130)
    finish(img, 'p1_09_fist_door', 0.7)


def p1_10_engine():
    img = interior(lamp=(540, 240), lamp_strength=0.28, cold=(56, 84, 96))
    d = ImageDraw.Draw(img)
    for x in range(120, 960, 36):
        d.line([(x, 1200), (x, 1320)], fill=(20, 28, 34, 220), width=4)
    d.rounded_rectangle([300, 1260, 780, 1560], radius=40, fill=(30, 38, 44, 255))
    for y in range(1290, 1540, 26):
        d.line([(330, y), (750, y)], fill=(60, 72, 80, 200), width=5)
    img = frost_on(img, 29, 900, 130)
    finish(img, 'p1_10_engine', 0.7)


def p1_11_moving():
    img = interior(lamp=(540, 220), lamp_strength=0.22)
    img = silhouette(img, 300, 1680, height=860, seated=True, rim=(170, 210, 240))
    img = vapor(img, 300, 780, n=6, seed=31, strength=100)
    img = frost_on(img, 33, 900, 130)
    finish(img, 'p1_11_moving', 0.8)


def p1_12_phone():
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    img = vgrad(W, H, (30, 36, 42), (12, 16, 20))
    img = paste_alpha(img, phone(11, signal=False))
    img = frost_on(img, 35, 500, 110)
    finish(img, 'p1_12_phone', 0.7)


def p1_13_thermo_fall():
    img = interior(lamp=(540, 300), lamp_strength=0.32)
    img = paste_alpha(img, thermometer(-15, 520, 220), (280, 880))
    img = frost_on(img, 37, 1400, 150)
    finish(img, 'p1_13_thermo_fall', 0.75)


def p1_14_frost_collar():
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    img = vgrad(W, H, (28, 40, 48), (10, 14, 18))
    d = ImageDraw.Draw(img)
    d.polygon([(0, 800), (540, 560), (1080, 800), (1080, H), (0, H)], fill=(40, 50, 58, 255))
    for k in range(9):
        d.arc([60 - k * 20, 840 + k * 60, 1020 + k * 20, 1040 + k * 60], 15, 165, fill=(18, 24, 30, 220), width=4)
    img = img.filter(ImageFilter.GaussianBlur(1.5))
    img = frost_on(img, 39, 2200, 180)
    img = vapor(img, 540, 760, n=7, seed=40, strength=120)
    finish(img, 'p1_14_frost_collar', 0.7)


def p1_15_flashlight():
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    img = vgrad(W, H, (10, 14, 18), (4, 6, 8))
    beam = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beam)
    bd.polygon([(0, 0), (220, 0), (1080, 1500), (760, 1900)], fill=(255, 240, 210, 70))
    beam = beam.filter(ImageFilter.GaussianBlur(40))
    img.alpha_composite(beam)
    img = frost_on(img, 41, 900, 120)
    finish(img, 'p1_15_flashlight', 0.9)


def p1_16_jacket_floor():
    img = interior(lamp=(540, 260), lamp_strength=0.2)
    d = ImageDraw.Draw(img)
    d.polygon([(260, 1320), (820, 1260), (900, 1520), (330, 1620)], fill=(40, 52, 58, 255))
    for k in range(8):
        d.line([(300 + k * 60, 1330), (360 + k * 60, 1600)], fill=(24, 32, 38, 200), width=5)
    img = frost_on(img, 43, 1600, 160)
    finish(img, 'p1_16_jacket_floor', 0.75)


def p1_17_pass():
    img = vgrad(W, H, (22, 30, 38), (8, 10, 14))
    img = paste_alpha(img, pass_card(), (0, 0))
    img = frost_on(img, 45, 500, 100)
    finish(img, 'p1_17_pass', 0.7)


def p1_18_pass_name():
    img = vgrad(W, H, (22, 30, 38), (8, 10, 14))
    img = paste_alpha(img, pass_card('Сергей Котов', 'Выдан: 24.11.2024', x=120, y=560, w=840, h=520), (0, 0))
    img = frost_on(img, 47, 500, 100)
    finish(img, 'p1_18_pass_name', 0.7)


def p1_19_flyer():
    img = vgrad(W, H, (34, 44, 52), (10, 14, 18))
    img = paste_alpha(img, flyer(), (0, 0))
    img = frost_on(img, 49, 600, 110)
    finish(img, 'p1_19_flyer', 0.7)


def p1_20_gate():
    img = truck_exterior(warm_door=False)
    img = paste_alpha(img, flyer(x=240, y=200, w=600, h=780), (0, 0))
    img = frost_on(img, 51, 500, 110)
    finish(img, 'p1_20_gate', 0.6)


def p1_21_stopped():
    img = forest_road(stopped=True, seed=53)
    img = frost_on(img, 55, 700, 120)
    finish(img, 'p1_21_stopped', 0.6)


def p1_22_footsteps():
    img = door_shadow(seed=57)
    img = silhouette(img, 540, 1720, height=760, seated=False, rim=(255, 180, 120))
    img = frost_on(img, 59, 600, 120)
    finish(img, 'p1_22_footsteps', 0.7)


if __name__ == '__main__':
    for fn in [p1_01_hook, p1_02_hands, p1_03_sitting, p1_04_warehouse, p1_05_truck_dock, p1_06_doorway, p1_07_lamp_flicker,
               p1_08_door_slam, p1_09_fist_door, p1_10_engine, p1_11_moving, p1_12_phone, p1_13_thermo_fall, p1_14_frost_collar,
               p1_15_flashlight, p1_16_jacket_floor, p1_17_pass, p1_18_pass_name, p1_19_flyer, p1_20_gate, p1_21_stopped,
               p1_22_footsteps]:
        fn()
