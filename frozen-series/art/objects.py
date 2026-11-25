"""Объекты и персонажи для кадров серии. Всё рисуется кодом: лица, руки, телефон, пропуск, объявление, дверь, фура."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from paint import W, H, vgrad, noise_img, tint, vignette, grain, glow, frost_layer, paste_alpha, font, label, rgba, ribbed_wall, floor_plate, pallet_wrapped, thermometer


def soft_blob(size, color, blur=18, alpha=180):
    w, h = size
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).ellipse([w * 0.15, h * 0.15, w * 0.85, h * 0.85], fill=rgba(color, alpha))
    return img.filter(ImageFilter.GaussianBlur(blur))


def vapor(img, cx, cy, n=7, seed=3, strength=110):
    rng = np.random.default_rng(seed)
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(n):
        r = rng.uniform(22, 46) * (1 + i * 0.15)
        x = cx + rng.uniform(-30, 30) + i * rng.uniform(-6, 6)
        y = cy - i * 42 + rng.uniform(-10, 10)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(235, 245, 250, max(10, strength - i * 12)))
    layer = layer.filter(ImageFilter.GaussianBlur(14))
    img.alpha_composite(layer)
    return img


def face(expr='fear', lips='closed', frost=True, cold_cheeks=True, seed=21):
    """Лицо крупным планом, полуреалистичное, в тёмном свете: тени, иней на ресницах, синеющие губы."""
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = W * 0.5, H * 0.46
    # шея и плечи (воротник куртки)
    d.polygon([(cx - 210, cy + 420), (cx - 150, cy + 250), (cx + 150, cy + 250), (cx + 210, cy + 420), (W, H), (0, H)], fill=(48, 56, 66, 255))
    for k in range(7):
        y = cy + 300 + k * 26
        d.arc([cx - 260 + k * 8, y, cx + 260 - k * 8, y + 80], 10, 170, fill=(20, 26, 32, 200), width=3)
    d.polygon([(cx - 90, cy + 220), (cx + 90, cy + 220), (cx + 110, cy + 330), (cx - 110, cy + 330)], fill=(86, 96, 104, 255))
    # голова
    head = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(head)
    hd.ellipse([cx - 232, cy - 330, cx + 232, cy + 300], fill=(186, 150, 130, 255))
    head = head.filter(ImageFilter.GaussianBlur(1.2))
    shade = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    sd.ellipse([cx - 232, cy - 330, cx + 60, cy + 300], fill=(20, 30, 46, 110))
    sd.ellipse([cx - 150, cy + 60, cx + 230, cy + 330], fill=(20, 30, 46, 40))
    shade = shade.filter(ImageFilter.GaussianBlur(40))
    head.alpha_composite(shade.point(lambda v: v))
    img.alpha_composite(head)
    # волосы: короткие, тёмные, со стороны лба
    hair = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hr = ImageDraw.Draw(hair)
    hr.pieslice([cx - 240, cy - 360, cx + 240, cy + 40], 180, 360, fill=(28, 26, 30, 255))
    hr.polygon([(cx - 240, cy - 120), (cx - 230, cy - 210), (cx - 170, cy - 300), (cx - 60, cy - 340)], fill=(28, 26, 30, 255))
    img.alpha_composite(hair.filter(ImageFilter.GaussianBlur(2)))
    # глаза: белки в тени, радужка, зрачок, веки, иней на ресницах
    def eye(x, y, open_=0.8, wide=1.0):
        ew, eh = 74 * wide, 40 * open_
        d.ellipse([x - ew, y - eh, x + ew, y + eh], fill=(214, 220, 226, 255))
        d.ellipse([x - 28, y - 28, x + 28, y + 28], fill=(60, 84, 96, 255))
        d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=(10, 14, 18, 255))
        d.ellipse([x - 22, y - 26, x - 12, y - 16], fill=(255, 255, 255, 230))
        d.arc([x - ew - 6, y - eh - 10, x + ew + 6, y + eh + 8], 190, 350, fill=(18, 18, 22, 255), width=9)
        if frost:
            rng = np.random.default_rng(seed + int(x))
            for t in np.linspace(math.pi * 1.1, math.pi * 1.9, 14):
                px = x + math.cos(t) * (ew + 4) + rng.uniform(-3, 3)
                py = y - eh * 0.6 + math.sin(t) * (eh + 4) * 0.7
                d.ellipse([px - 2, py - 2, px + 2, py + 2], fill=(240, 250, 255, 230))
    if expr == 'fear':
        eye(cx - 92, cy - 40, open_=1.0, wide=1.08)
        eye(cx + 92, cy - 40, open_=1.0, wide=1.08)
        d.line([(cx - 170, cy - 110), (cx - 40, cy - 124)], fill=(34, 30, 30, 255), width=10)
        d.line([(cx + 40, cy - 124), (cx + 170, cy - 110)], fill=(34, 30, 30, 255), width=10)
    else:
        eye(cx - 92, cy - 40, open_=0.5)
        eye(cx + 92, cy - 40, open_=0.5)
        d.line([(cx - 170, cy - 100), (cx - 40, cy - 96)], fill=(34, 30, 30, 255), width=9)
        d.line([(cx + 40, cy - 96), (cx + 170, cy - 100)], fill=(34, 30, 30, 255), width=9)
    # нос
    d.line([(cx, cy - 20), (cx - 10, cy + 60), (cx + 12, cy + 66)], fill=(150, 116, 100, 255), width=6)
    d.ellipse([cx - 26, cy + 56, cx - 4, cy + 72], fill=(120, 88, 74, 255))
    d.ellipse([cx + 4, cy + 56, cx + 26, cy + 72], fill=(120, 88, 74, 255))
    # губы: закрытые, открытые (для синхронизации), синеющие
    lip = (96, 120, 180, 255) if cold_cheeks else (150, 90, 84, 255)
    if lips == 'open':
        d.ellipse([cx - 70, cy + 124, cx + 70, cy + 210], fill=(20, 12, 14, 255))
        d.arc([cx - 84, cy + 116, cx + 84, cy + 170], 180, 360, fill=lip, width=18)
        d.arc([cx - 84, cy + 160, cx + 84, cy + 220], 0, 180, fill=lip, width=18)
    else:
        d.arc([cx - 84, cy + 120, cx + 84, cy + 184], 0, 180, fill=lip, width=16)
        d.arc([cx - 80, cy + 104, cx + 80, cy + 150], 180, 360, fill=lip, width=14)
    # холодный румянец и тень под глазами
    if cold_cheeks:
        img.alpha_composite(soft_blob((300, 200), (150, 200, 230), blur=30, alpha=70).resize((300, 200)), (int(cx - 260), int(cy + 40)))
        img.alpha_composite(soft_blob((300, 200), (150, 200, 230), blur=30, alpha=70), (int(cx + 40), int(cy + 40)))
    return img


def gloved_hands(frost=True, shake=0.0):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = W * 0.5, H * 0.55
    for side in (-1, 1):
        x0 = cx + side * 150
        d.polygon([(x0 - 150 * side, cy + 260), (x0 - 70 * side, cy - 30 + shake), (x0 + 120 * side, cy - 60), (x0 + 210 * side, cy + 140), (x0 + 170 * side, cy + 420)], fill=(42, 48, 56, 255))
        for k in range(6):
            fx = x0 + side * (20 + k * 30) + shake
            d.line([(fx, cy - 40 + k * 4), (fx + side * 12, cy - 170 - k * 6)], fill=(38, 44, 52, 255), width=24)
        d.line([(x0 - side * 120, cy + 200), (x0 + side * 120, cy + 110)], fill=(20, 24, 30, 255), width=8)
    if frost:
        rng = np.random.default_rng(31)
        for _ in range(260):
            x = rng.uniform(cx - 330, cx + 330)
            y = rng.uniform(cy - 260, cy + 420)
            r = rng.uniform(1.5, 4.5)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(232, 246, 255, 200))
    return img.filter(ImageFilter.GaussianBlur(0.6))


def phone(battery=11, signal=False, time_text='03:14'):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = 180, 520, 900, 1560
    d.rounded_rectangle([x0 - 26, y0 - 26, x1 + 26, y1 + 26], radius=86, fill=(24, 26, 30, 255))
    d.rounded_rectangle([x0, y0, x1, y1], radius=66, fill=(10, 14, 18, 255))
    scr = vgrad(x1 - x0 - 40, y1 - y0 - 40, (14, 30, 44), (4, 8, 12))
    img.alpha_composite(scr, (x0 + 20, y0 + 20))
    d.text((x0 + 80, y0 + 110), time_text, font=font(120, True), fill=(230, 240, 246, 255))
    d.text((x0 + 84, y0 + 260), 'Сети нет' if not signal else 'LTE', font=font(56, False), fill=(190, 210, 220, 255))
    bx, by = x0 + 140, y0 + 470
    d.rounded_rectangle([bx, by, bx + 380, by + 140], radius=26, outline=(230, 240, 246, 255), width=10)
    d.rectangle([bx + 386, by + 42, bx + 404, by + 98], fill=(230, 240, 246, 255))
    fill_w = int(360 * battery / 100)
    d.rounded_rectangle([bx + 10, by + 10, bx + 10 + fill_w, by + 130], radius=16, fill=(255, 92, 84, 255) if battery < 20 else (120, 220, 170, 255))
    d.text((bx + 120, by + 170), f'{battery}%', font=font(110, True), fill=(255, 92, 84, 255) if battery < 20 else (230, 240, 246, 255))
    return img


def pass_card(name='Сергей Котов', issued='Выдан: 24.11.2024', x=190, y=640, w=700, h=440):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x + 16, y + 22, x + w + 16, y + h + 22], radius=28, fill=(0, 0, 0, 150))
    card = vgrad(w, h, (226, 232, 236), (186, 196, 204))
    cd = ImageDraw.Draw(card)
    cd.rectangle([0, 0, w, 96], fill=(40, 72, 96, 255))
    cd.text((26, 22), 'СЕВЕРТРАНС', font=font(52, True), fill=(255, 255, 255, 255))
    cd.rounded_rectangle([34, 130, 254, 400], radius=14, fill=(120, 132, 140, 255))
    cd.ellipse([96, 170, 192, 266], fill=(150, 160, 168, 255))
    cd.rounded_rectangle([60, 280, 228, 380], radius=50, fill=(150, 160, 168, 255))
    cd.text((286, 150), name, font=font(46, True), fill=(20, 26, 32, 255))
    cd.text((286, 220), 'Грузчик, ночная смена', font=font(32, False), fill=(60, 66, 72, 255))
    cd.text((286, 300), issued, font=font(30, False), fill=(60, 66, 72, 255))
    cd.text((286, 350), 'Пропуск № 4471', font=font(30, False), fill=(60, 66, 72, 255))
    img.alpha_composite(card, (x, y))
    d.rounded_rectangle([x, y, x + w, y + h], radius=28, outline=(120, 130, 140, 255), width=3)
    return img


def flyer(x=160, y=170, w=760, h=1000):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([x + 18, y + 26, x + w + 18, y + h + 26], fill=(0, 0, 0, 160))
    paper = vgrad(w, h, (238, 232, 218), (206, 198, 184))
    pd = ImageDraw.Draw(paper)
    pd.text((70, 56), 'ПРОПАЛ', font=font(120, True), fill=(160, 22, 22, 255))
    pd.rounded_rectangle([130, 260, 630, 640], radius=12, fill=(120, 124, 128, 255))
    pd.ellipse([300, 320, 460, 480], fill=(150, 154, 158, 255))
    pd.rounded_rectangle([250, 500, 510, 620], radius=60, fill=(150, 154, 158, 255))
    pd.text((70, 690), 'Котов Сергей', font=font(60, True), fill=(30, 30, 34, 255))
    pd.text((70, 770), 'Грузчик «СЕВЕРТРАНС»', font=font(36, False), fill=(40, 40, 44, 255))
    pd.text((70, 830), 'Последний раз виден у ворот', font=font(36, False), fill=(40, 40, 44, 255))
    pd.text((70, 880), '2 года назад. Ищем.', font=font(36, False), fill=(40, 40, 44, 255))
    pd.text((70, 930), 'Телефон: 8 (800) 555-01-01', font=font(34, False), fill=(40, 40, 44, 255))
    img.alpha_composite(paper, (x, y))
    d.rectangle([x, y, x + w, y + h], outline=(96, 90, 80, 255), width=3)
    return img


def steel_door(dented=True, seal_light=True, seed=4):
    img = ribbed_wall(W, H, base=(62, 88, 100), rib=96, seed=seed)
    d = ImageDraw.Draw(img)
    d.rectangle([110, 180, 970, 1740], fill=(90, 112, 122, 255))
    for x in range(140, 960, 80):
        d.line([(x, 200), (x, 1720)], fill=(60, 80, 90, 255), width=6)
        d.line([(x + 4, 200), (x + 4, 1720)], fill=(160, 186, 196, 60), width=2)
    d.rectangle([520, 180, 560, 1740], fill=(40, 52, 58, 255))
    if seal_light:
        d.rectangle([522, 180, 558, 1740], fill=(255, 170, 90, 120))
    if dented:
        for cx_, cy_, r in ((300, 720, 130), (760, 1100, 110), (400, 1350, 90)):
            d.ellipse([cx_ - r, cy_ - r * 0.7, cx_ + r, cy_ + r * 0.7], fill=(60, 74, 82, 255))
            d.ellipse([cx_ - r * 0.7, cy_ - r * 0.5, cx_ + r * 0.5, cy_ + r * 0.5], fill=(120, 140, 150, 80))
    d.rounded_rectangle([580, 880, 640, 1040], radius=18, fill=(28, 34, 40, 255))
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    return grain(img, 9)


def truck_exterior(warm_door=False, seed=8):
    """Рефрижератор сзади, ночь, тёплый свет фонарей склада, снег."""
    img = vgrad(W, H, (28, 40, 52), (10, 14, 20))
    d = ImageDraw.Draw(img)
    # здание склада со светом
    d.rectangle([0, 500, W, 1290], fill=(44, 52, 60, 255))
    for x in range(40, W, 180):
        d.rectangle([x, 580, x + 110, 760], fill=(255, 196, 120, 150))
    d.rectangle([0, 1290, W, H], fill=(70, 80, 88, 255))
    # вывеска
    d.rounded_rectangle([160, 430, 920, 540], radius=18, fill=(22, 60, 92, 255))
    d.text((200, 452), 'СЕВЕРТРАНС', font=font(72, True), fill=(255, 230, 170, 255))
    # фура сзади
    d.rectangle([180, 640, 900, 1420], fill=(206, 216, 224, 255))
    for x in range(200, 900, 30):
        d.line([(x, 660), (x, 1400)], fill=(160, 170, 180, 255), width=4)
    d.rectangle([420, 700, 660, 1400], fill=(90, 100, 108, 255))
    d.line([(540, 700), (540, 1400)], fill=(60, 66, 72, 255), width=8)
    if warm_door:
        d.rectangle([424, 706, 536, 1396], fill=(255, 170, 90, 90))
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    img = glow(img, 540, 1000, 800, (255, 150, 70), 0.12)
    return grain(vignette(img, 0.5), 8)


def forest_road(stopped=True, seed=12):
    img = vgrad(W, H, (16, 26, 38), (6, 10, 16))
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(seed)
    d.ellipse([720, 140, 900, 320], fill=(214, 226, 236, 230))
    for layer, (dark, step) in enumerate([((22, 34, 46), 60), ((14, 22, 32), 110)]):
        for x in range(-40, W + 60, step):
            hgt = rng.uniform(420, 720) if layer == 0 else rng.uniform(640, 980)
            base_y = 1280 + layer * 80
            d.polygon([(x, base_y), (x + step * 0.6, base_y - hgt), (x + step * 1.2, base_y)], fill=dark + (255,))
            d.polygon([(x + 6, base_y - hgt * 0.5), (x + step * 0.6, base_y - hgt), (x + step * 0.9, base_y - hgt * 0.5)], fill=(220, 232, 240, 90))
    d.rectangle([0, 1280, W, H], fill=(190, 204, 214, 255))
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img = glow(img, 810, 230, 300, (120, 150, 180), 0.25)
    if stopped:
        img.alpha_composite(vapor(Image.new('RGBA', (W, H), (0, 0, 0, 0)), 520, 1300, n=4, seed=2, strength=60))
    return grain(vignette(img, 0.55), 10)


def door_shadow(seed=15):
    img = steel_door(dented=False, seal_light=True, seed=seed)
    d = ImageDraw.Draw(img)
    d.polygon([(520, 320), (560, 320), (600, 1500), (500, 1500)], fill=(255, 176, 96, 60))
    d.ellipse([430, 760, 650, 1420], fill=(10, 14, 18, 130))
    return img.filter(ImageFilter.GaussianBlur(2))
