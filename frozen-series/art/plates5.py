"""Кадры Части 5: стук в фуре, телефон с одним процентом, карта и «Полиция», скрип снега, луч фонаря,
синие огни, наручники, скорая, пропуск с надписью «Спасибо». Пишет frozen-series/plates/p5_XX_*.png."""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from paint import *  # noqa: F401,F403
from objects import *  # noqa: F401,F403
from plates1 import interior, frost_on, finish  # noqa: F401
from objects2 import *  # noqa: F401,F403


def knock_rings(img, cx, cy, n=1, base_r=70):
    """Вмятины от ударов: концентрические кольца."""
    L = layer()
    d = ImageDraw.Draw(L)
    for k in range(n):
        r = base_r + k * 38
        d.ellipse([cx - r, cy - r * 0.7, cx + r, cy + r * 0.7], outline=(20, 26, 32, 230), width=6)
        d.ellipse([cx - r + 8, cy - r * 0.7 + 8, cx + r - 8, cy + r * 0.7 - 8], outline=(170, 190, 200, 70), width=3)
    return soft(img, L, 1.5)


def under_truck(beam_pts=None):
    """Вид снизу: рама, колёса и снег. Опционально — луч фонаря."""
    img = vgrad(W, H, (16, 22, 28), (6, 8, 10))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 380, W, 520], fill=(40, 48, 56, 255))
    d.rectangle([0, 600, W, 650], fill=(30, 36, 42, 255))
    d.rectangle([0, 1640, W, H], fill=(150, 166, 178, 255))
    img = tire(img, 250, 1300, r=300)
    img = tire(img, 830, 1300, r=300)
    if beam_pts:
        img = beam(img, beam_pts, alpha=110, blur=24)
    return img


def pass_back(lines, ink=(30, 60, 140, 255), size=56):
    """Оборот пропуска: шапка компании и рукописные строки."""
    card = vgrad(720, 440, (226, 232, 236), (186, 196, 204))
    cd = ImageDraw.Draw(card)
    cd.rectangle([0, 0, 720, 70], fill=(40, 72, 96, 255))
    cd.text((26, 16), 'ОБОРОТ ПРОПУСКА', font=font(40, True), fill=(255, 255, 255, 255))
    for k, t in enumerate(lines):
        cd.text((40, 120 + k * 90), t, font=font(size, False), fill=ink)
    cd.rectangle([0, 0, 719, 439], outline=(120, 130, 140, 255), width=3)
    return card


def p5_01_recap():
    img = door_shadow(seed=151)
    img = frost_on(img, 151, 700, 120)
    finish(img, 'p5_01_recap', 0.8)


def p5_02_knock_rings():
    img = steel_door(dented=False, seal_light=False, seed=152)
    img = knock_rings(img, 540, 1000, n=1, base_r=90)
    img = frost_on(img, 152, 600, 120)
    finish(img, 'p5_02_knock_rings', 0.7)


def p5_03_three():
    img = steel_door(dented=False, seal_light=False, seed=153)
    for cx, cy in ((330, 720), (560, 1010), (400, 1320)):
        img = knock_rings(img, cx, cy, n=2, base_r=60)
    img = frost_on(img, 153, 600, 120)
    finish(img, 'p5_03_three', 0.7)


def p5_04_pause():
    img = vgrad(W, H, (10, 14, 18), (4, 6, 8))
    img = frost_on(img, 154, 400, 90)
    finish(img, 'p5_04_pause', 0.95)


def p5_05_three_again():
    img = steel_door(dented=True, seal_light=False, seed=155)
    for cx, cy in ((640, 800), (420, 1100), (620, 1380)):
        img = knock_rings(img, cx, cy, n=2, base_r=56)
    img = frost_on(img, 155, 600, 120)
    finish(img, 'p5_05_three_again', 0.7)


def p5_06_phone_one():
    img = vgrad(W, H, (30, 36, 42), (12, 16, 20))
    img = paste_alpha(img, phone(1, signal=False), (0, 0))
    img = frost_on(img, 156, 500, 100)
    finish(img, 'p5_06_phone_one', 0.8)


def p5_07_one_bar():
    img = vgrad(W, H, (30, 36, 42), (12, 16, 20))
    img = paste_alpha(img, phone(1, signal=True), (0, 0))
    img = frost_on(img, 157, 500, 100)
    finish(img, 'p5_07_one_bar', 0.8)


def p5_08_map_pin():
    img = vgrad(W, H, (30, 36, 42), (12, 16, 20))
    img = paste_alpha(img, phone_map(), (0, 0))
    img = frost_on(img, 158, 500, 100)
    finish(img, 'p5_08_map_pin', 0.8)


def p5_10_bubble():
    img = vgrad(W, H, (30, 36, 42), (12, 16, 20))
    img = paste_alpha(img, phone_chat('Полиция'), (0, 0))
    img = frost_on(img, 160, 500, 100)
    finish(img, 'p5_10_bubble', 0.8)


def p5_11_screen_off():
    img = vgrad(W, H, (4, 6, 8), (2, 3, 4))
    L = layer()
    ImageDraw.Draw(L).ellipse([330, 760, 750, 1260], fill=(120, 140, 160, 34))
    img = soft(img, L, 40)
    img = frost_on(img, 161, 300, 90)
    finish(img, 'p5_11_screen_off', 0.9)


def p5_12_crawl_under():
    img = under_truck()
    img = frost_on(img, 162, 700, 120)
    finish(img, 'p5_12_crawl_under', 0.8)


def p5_13_wire():
    img = steel_door(dented=False, seal_light=False, seed=163)
    L = layer()
    d = ImageDraw.Draw(L)
    pts = [(230 + k * 12, 960 + 40 * math.sin(k * 0.9)) for k in range(65)]
    d.line(pts, fill=(196, 206, 214, 255), width=10)
    d.rectangle([520, 900, 600, 1030], fill=(120, 130, 140, 255))
    img = soft(img, L, 1.0)
    img = frost_on(img, 163, 500, 110)
    finish(img, 'p5_13_wire', 0.6)


def p5_15_inside_worker():
    img = interior(lamp=(540, 240), lamp_strength=0.1, cold=(50, 72, 84))
    img = seated_worker(img, 540, 1640, h=880)
    img = frost_on(img, 165, 700, 120)
    finish(img, 'p5_15_inside_worker', 0.75)


def p5_16_worker_vest():
    img = vgrad(W, H, (20, 26, 32), (8, 10, 14))
    img = seated_worker(img, 540, 1820, h=1500)
    img = frost_on(img, 166, 500, 110)
    finish(img, 'p5_16_worker_vest', 0.7)


def p5_17_blue_cold():
    img = vgrad(W, H, (20, 26, 32), (8, 10, 14))
    img = seated_worker(img, 540, 1640, h=880)
    img = glow(img, 540, 1000, 620, (60, 120, 255), 0.25)
    img = frost_on(img, 167, 700, 120)
    finish(img, 'p5_17_blue_cold', 0.75)


def p5_18_breath_alive():
    img = interior(lamp=(540, 240), lamp_strength=0.12, cold=(50, 72, 84))
    img = seated_worker(img, 540, 1640, h=880)
    img = vapor(img, 540, 720, n=6, seed=168, strength=110)
    img = frost_on(img, 168, 700, 120)
    finish(img, 'p5_18_breath_alive', 0.75)


def p5_19_hardhat():
    img = vgrad(W, H, (16, 20, 26), (6, 8, 10))
    img = hard_hat(img, 540, 900, text='КОСТЯ')
    img = frost_on(img, 169, 400, 100)
    finish(img, 'p5_19_hardhat', 0.8)


def p5_20_footsteps_beam():
    img = snow_field(horizon=1000, seed=172)
    img = footprints(img, [(300, 1700, 1.1), (440, 1560, 1.0), (360, 1420, 0.9), (480, 1300, 0.8), (420, 1180, 0.7)])
    img = beam(img, [(0, 0), (200, 0), (900, H), (500, H)], alpha=60, blur=30)
    img = frost_on(img, 172, 500, 110)
    finish(img, 'p5_20_footsteps_beam', 0.7)


def p5_21_beam_trunks():
    img = vgrad(W, H, (10, 14, 18), (4, 6, 8))
    img = trunks(img, seed=173, count=12, base_y=1800, color=(10, 14, 20))
    img = beam(img, [(900, 0), (W, 0), (300, H), (0, 1500)], alpha=110, blur=26)
    img = frost_on(img, 173, 400, 100)
    finish(img, 'p5_21_beam_trunks', 0.8)


def p5_22_under_hidden():
    img = under_truck(beam_pts=[(-100, 980), (1180, 1100), (1180, 1260), (-100, 1120)])
    img = frost_on(img, 174, 600, 120)
    finish(img, 'p5_22_under_hidden', 0.9)


def p5_23_beam_close():
    img = vgrad(W, H, (12, 16, 20), (6, 8, 10))
    img = trunks(img, seed=175, count=6, base_y=1800, color=(10, 14, 20))
    img = beam(img, [(-100, 620), (1180, 880), (1180, 1080), (-100, 820)], alpha=160, blur=18, color=(255, 250, 235))
    img = frost_on(img, 175, 400, 100)
    finish(img, 'p5_23_beam_close', 0.8)


def p5_24_police_lights():
    img = vgrad(W, H, (10, 14, 20), (4, 6, 8))
    img = pines(img, seed=176, base_y=1500, count=12, hmin=600, hmax=1000, dark=(8, 12, 18))
    img = lights_blue_red(img, y=1000, strength=0.6)
    img = frost_on(img, 176, 400, 100)
    finish(img, 'p5_24_police_lights', 0.8)


def p5_25_sirens_snow():
    img = snow_field(horizon=1200, seed=177)
    img = lights_blue_red(img, y=1200, strength=0.7)
    img = frost_on(img, 177, 500, 110)
    finish(img, 'p5_25_sirens_snow', 0.7)


def p5_26_cuffs():
    img = snow_field(horizon=1240, seed=178)
    img = person(img, 300, 1700, h=860, rim_color=(120, 170, 240))
    img = person(img, 800, 1700, h=880, rim_color=(255, 120, 120))
    img = person(img, 540, 1720, h=800, rim_color=(200, 220, 240))
    img = frost_on(img, 178, 500, 110)
    finish(img, 'p5_26_cuffs', 0.7)


def p5_27_ambulance():
    img = ambulance_interior(seed=179)
    img = paste_alpha(img, pass_card('Сергей Котов', 'Выдан: 24.11.2024', x=180, y=1120, w=720, h=440), (0, 0))
    img = frost_on(img, 179, 300, 90)
    finish(img, 'p5_27_ambulance', 0.7)


def p5_28_empty_field():
    img = snow_field(horizon=1000, seed=180)
    img = glow(img, 540, 1000, 900, (255, 190, 140), 0.25)
    L = layer()
    d = ImageDraw.Draw(L)
    d.line([(380, H), (470, 1100)], fill=(40, 50, 60, 200), width=14)
    d.line([(700, H), (610, 1100)], fill=(40, 50, 60, 200), width=14)
    img = soft(img, L, 3)
    img = frost_on(img, 180, 500, 110)
    finish(img, 'p5_28_empty_field', 0.6)


def p5_29_pass_back():
    img = vgrad(W, H, (20, 26, 32), (8, 10, 14))
    img = put(img, pass_back(['Пропуск № 4471', 'Действителен: до 31.12.2024']), 180, 760)
    img = frost_on(img, 181, 500, 110)
    finish(img, 'p5_29_pass_back', 0.7)


def p5_30_spasibo_ink():
    img = vgrad(W, H, (20, 26, 32), (8, 10, 14))
    img = put(img, pass_back(['Спасибо'], ink=(30, 60, 140, 255), size=96), 180, 760)
    img = frost_on(img, 182, 500, 110)
    finish(img, 'p5_30_spasibo_ink', 0.6)


PLATES = [p5_01_recap, p5_02_knock_rings, p5_03_three, p5_04_pause, p5_05_three_again, p5_06_phone_one,
          p5_07_one_bar, p5_08_map_pin, p5_10_bubble, p5_11_screen_off, p5_12_crawl_under, p5_13_wire,
          p5_15_inside_worker, p5_16_worker_vest, p5_17_blue_cold, p5_18_breath_alive, p5_19_hardhat,
          p5_20_footsteps_beam, p5_21_beam_trunks, p5_22_under_hidden, p5_23_beam_close, p5_24_police_lights,
          p5_25_sirens_snow, p5_26_cuffs, p5_27_ambulance, p5_28_empty_field, p5_29_pass_back, p5_30_spasibo_ink]

if __name__ == '__main__':
    for fn in PLATES:
        fn()
