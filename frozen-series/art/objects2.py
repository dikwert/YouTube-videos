"""Объекты для частей 2–5 серии «−20. ЗАПЕРТ В ФУРЕ»: сапоги, решётка, кабина, записка, радио, труба,
колесо, фура, полиция, скорая. Всё рисуется кодом, как в части 1.
Выдуманные названия: фура и склад «СЕВЕРТРАНС», все фамилии вымышленные. Логотипов реальных брендов нет."""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from paint import W, H, vgrad, noise_img, tint, vignette, glow, frost_layer, font, rgba, ribbed_wall, floor_plate, paste_alpha, thermometer  # noqa: F401
from objects import vapor, phone, pass_card, steel_door, truck_exterior, forest_road  # noqa: F401
from plates1 import silhouette  # noqa: F401

BICUBIC = getattr(Image, 'Resampling', Image).BICUBIC


def layer():
    return Image.new('RGBA', (W, H), (0, 0, 0, 0))


def put(img, sub, x=0, y=0):
    """Наложение куска на кадр; края за кадром обрезаются сами."""
    tmp = layer()
    tmp.paste(sub, (int(x), int(y)), sub)
    img.alpha_composite(tmp)
    return img


def soft(img, L, blur=1.0):
    """Наложение слоя с размытием по краям."""
    img.alpha_composite(L.filter(ImageFilter.GaussianBlur(blur)))
    return img


def rim(body, color=(150, 200, 230), strength=2.2):
    """Контровой свет по краю силуэта."""
    edge = body.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1.5))
    col = Image.new('RGBA', body.size, rgba(color, 0))
    col.putalpha(edge.split()[-1].point(lambda v: min(255, int(v * strength))))
    return Image.alpha_composite(body, col)


def person(img, cx, base_y, h=880, angle=0.0, bulky=False, rim_color=(150, 200, 230), color=(10, 12, 16), raised_arm=False):
    """Силуэт человека в тёмной одежде. angle — наклон всего тела вокруг ступней (падение, наклон)."""
    L = layer()
    d = ImageDraw.Draw(L)
    c = (color[0], color[1], color[2], 255)
    k = 1.22 if bulky else 1.0
    d.ellipse([cx - 78, base_y - h * 0.98, cx + 78, base_y - h * 0.98 + 160], fill=c)
    d.rounded_rectangle([cx - 150 * k, base_y - h * 0.80, cx + 150 * k, base_y - h * 0.36], radius=int(90 * k), fill=c)
    d.polygon([(cx - 130 * k, base_y - h * 0.40), (cx - 56 * k, base_y - h * 0.40), (cx - 70, base_y), (cx - 160, base_y)], fill=c)
    d.polygon([(cx + 56 * k, base_y - h * 0.40), (cx + 130 * k, base_y - h * 0.40), (cx + 160, base_y), (cx + 70, base_y)], fill=c)
    d.polygon([(cx - 170 * k, base_y - h * 0.78), (cx - 200 * k, base_y - h * 0.40), (cx - 160 * k, base_y - h * 0.38), (cx - 140 * k, base_y - h * 0.74)], fill=c)
    if raised_arm:
        d.polygon([(cx + 150 * k, base_y - h * 0.78), (cx + 210 * k, base_y - h * 1.02), (cx + 252 * k, base_y - h * 0.98), (cx + 176 * k, base_y - h * 0.72)], fill=c)
    else:
        d.polygon([(cx + 170 * k, base_y - h * 0.78), (cx + 200 * k, base_y - h * 0.40), (cx + 160 * k, base_y - h * 0.38), (cx + 140 * k, base_y - h * 0.74)], fill=c)
    if angle:
        L = L.rotate(angle, resample=BICUBIC, center=(cx, base_y))
    return soft(img, rim(L, rim_color), 1.0)


def lying(img, cx, cy, s=1.0, alpha=255, rim_color=(150, 200, 230)):
    """Человек лёжа на полу: голова слева, ноги справа."""
    L = layer()
    d = ImageDraw.Draw(L)
    c = (10, 12, 16, alpha)
    d.ellipse([cx - 470 * s, cy - 58 * s, cx - 350 * s, cy + 58 * s], fill=c)
    d.rounded_rectangle([cx - 380 * s, cy - 96 * s, cx + 60 * s, cy + 96 * s], radius=int(90 * s), fill=c)
    d.polygon([(cx + 40 * s, cy - 80 * s), (cx + 470 * s, cy - 46 * s), (cx + 470 * s, cy + 46 * s), (cx + 40 * s, cy + 84 * s)], fill=c)
    d.polygon([(cx - 330 * s, cy - 90 * s), (cx + 40 * s, cy - 112 * s), (cx + 20 * s, cy - 150 * s), (cx - 300 * s, cy - 128 * s)], fill=c)
    return soft(img, rim(L, rim_color), 1.0)


def boot(d, x, y, s=1.0, col=(8, 10, 14, 255)):
    """Сапог: голенище и подошва, силуэт. (x, y) — левый нижний угол подошвы."""
    d.rounded_rectangle([x, y - 250 * s, x + 150 * s, y], radius=int(34 * s), fill=col)
    d.rounded_rectangle([x - 16 * s, y - 46 * s, x + 206 * s, y + 26 * s], radius=int(24 * s), fill=col)


def steps_at_door(seed=4, feet=((230, 1640, 1.0), (640, 1660, 0.92))):
    """Дверь с щелью света внизу и две пары сапог за ней."""
    img = steel_door(dented=False, seal_light=False, seed=seed)
    d = ImageDraw.Draw(img)
    d.rectangle([110, 1720, 970, 1744], fill=(255, 176, 96, 230))
    L = layer()
    dl = ImageDraw.Draw(L)
    for x, y, s in feet:
        boot(dl, x, y, s, col=(6, 8, 12, 245))
    return soft(img, L, 2.0)


def cab_interior(mirror_trailer=True):
    """Кабина изнутри: лобовое стекло, приборы, руль, зеркало с отражением фуры."""
    img = vgrad(W, H, (14, 18, 24), (5, 7, 10))
    d = ImageDraw.Draw(img)
    d.rectangle([60, 110, 1020, 760], fill=(12, 20, 32, 255))
    d.ellipse([730, 170, 860, 300], fill=(214, 226, 236, 110))
    d.rectangle([300, 320, 780, 470], fill=(20, 28, 36, 255))
    if mirror_trailer:
        d.rectangle([320, 340, 760, 450], fill=(40, 52, 62, 255))
        d.rectangle([520, 340, 560, 450], fill=(16, 20, 26, 255))
    d.rounded_rectangle([60, 1050, 1020, 1400], radius=60, fill=(20, 24, 30, 255))
    for k in range(8):
        x = 130 + k * 110
        d.rounded_rectangle([x, 1130, x + 70, 1170], radius=10, fill=(255, 170, 84, 200))
    img = glow(img, 540, 1170, 460, (255, 150, 60), 0.22)
    d = ImageDraw.Draw(img)
    d.ellipse([340, 1260, 740, 1700], outline=(8, 10, 12, 255), width=44)
    d.rectangle([520, 1380, 560, 1520], fill=(8, 10, 12, 255))
    return vignette(img, 0.7)


def lights_blue_red(img, y=900, strength=0.5):
    """Синий и красный свет полиции по сторонам кадра."""
    img = glow(img, 260, y, 480, (40, 96, 255), strength)
    img = glow(img, 820, y, 480, (255, 40, 40), strength)
    return img


def paper(lines, w=760, h=520, size=46, tone=((228, 222, 202), (196, 188, 164)), ink=(44, 36, 30, 255)):
    """Лист бумаги с текстом (шрифт DejaVu: настоящего почерка в проекте нет)."""
    p = vgrad(w, h, tone[0], tone[1])
    pd = ImageDraw.Draw(p)
    f = font(size, bold=False)
    for k, t in enumerate(lines):
        pd.text((56, 56 + k * (size + 24)), t, font=f, fill=ink)
    return p


def mini_flyer(name, w=300, h=420, line='2 года назад'):
    """Маленькое объявление «ПРОПАЛ» с вымышленной фамилией."""
    p = vgrad(w, h, (238, 232, 218), (206, 198, 184))
    pd = ImageDraw.Draw(p)
    pd.text((18, 14), 'ПРОПАЛ', font=font(50, True), fill=(160, 22, 22, 255))
    pd.rounded_rectangle([40, 110, w - 40, 280], radius=10, fill=(120, 124, 128, 255))
    pd.ellipse([w / 2 - 40, 140, w / 2 + 40, 220], fill=(150, 154, 158, 255))
    pd.text((18, 300), name, font=font(28, True), fill=(30, 30, 34, 255))
    pd.text((18, 344), line, font=font(22, False), fill=(40, 40, 44, 255))
    pd.rectangle([0, 0, w - 1, h - 1], outline=(96, 90, 80, 255), width=3)
    return p


def scratch(img, text, x, y, size=120, alpha=150, rot=0.0):
    """Надпись, процарапанная в инее."""
    L = layer()
    ImageDraw.Draw(L).text((x, y), text, font=font(size, True), fill=(222, 240, 252, alpha))
    if rot:
        L = L.rotate(rot, resample=BICUBIC, center=(x, y))
    return soft(img, L, 1.1)


def beam(img, pts, alpha=90, blur=36, color=(255, 240, 210)):
    """Луч фонаря: полигон с размытием."""
    L = layer()
    ImageDraw.Draw(L).polygon(pts, fill=(color[0], color[1], color[2], alpha))
    return soft(img, L, blur)


def cracks(img, seed=3, n=26, alpha=150):
    """Трещины в инее: холод становится громче."""
    rng = np.random.default_rng(seed)
    L = layer()
    d = ImageDraw.Draw(L)
    for _ in range(n):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        pts = [(x, y)]
        for _ in range(int(rng.integers(4, 9))):
            x += rng.uniform(-80, 80)
            y += rng.uniform(-120, 120)
            pts.append((x, y))
        d.line(pts, fill=(226, 240, 252, alpha), width=2)
    return soft(img, L, 0.6)


def radio(img, cx=540, cy=980, lit=True):
    """Старое автомобильное радио: шкала, ручки. Включённое — тёплый свет шкалы."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.rounded_rectangle([cx - 330, cy - 170, cx + 330, cy + 170], radius=40, fill=(34, 30, 26, 255))
    d.rounded_rectangle([cx - 290, cy - 120, cx + 120, cy + 120], radius=18, fill=(214, 170, 96, 255 if lit else 50))
    for k in range(21):
        x = cx - 270 + k * 19
        d.line([(x, cy - 100), (x, cy - 84 if k % 5 else cy - 70)], fill=(70, 46, 22, 255), width=3)
    pos = 150 if lit else 40
    d.line([(cx - 240 + pos, cy - 40), (cx - 240 + pos, cy + 80)], fill=(180, 40, 30, 255), width=4)
    d.ellipse([cx + 170, cy - 110, cx + 290, cy + 10], fill=(18, 16, 14, 255))
    d.ellipse([cx + 170, cy + 40, cx + 290, cy + 160], fill=(18, 16, 14, 255))
    img = soft(img, L, 0.8)
    if lit:
        img = glow(img, cx - 90, cy, 420, (255, 170, 80), 0.45)
    return img


def pipe_mouth(img, cx=540, cy=900, r=260, warm=True):
    """Труба: тёмный круг с ободом, внутри тёплый свет."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.ellipse([cx - r - 44, cy - r - 44, cx + r + 44, cy + r + 44], fill=(56, 66, 74, 255))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(10, 9, 9, 255))
    img = soft(img, L, 2.0)
    if warm:
        img = glow(img, cx, cy, r * 1.1, (255, 150, 70), 0.9)
    return img


def tire(img, cx, cy, r=520):
    """Колесо крупно: протектор и диск."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(14, 16, 18, 255))
    for k in range(0, 360, 15):
        a = math.radians(k)
        d.line([(cx + math.cos(a) * r * 0.86, cy + math.sin(a) * r * 0.86),
                (cx + math.cos(a) * r * 0.98, cy + math.sin(a) * r * 0.98)], fill=(44, 48, 52, 255), width=18)
    d.ellipse([cx - r * 0.56, cy - r * 0.56, cx + r * 0.56, cy + r * 0.56], fill=(60, 66, 72, 255))
    d.ellipse([cx - r * 0.25, cy - r * 0.25, cx + r * 0.25, cy + r * 0.25], fill=(120, 128, 136, 255))
    for k in range(5):
        a = math.radians(k * 72)
        d.line([(cx, cy), (cx + math.cos(a) * r * 0.45, cy + math.sin(a) * r * 0.45)], fill=(70, 76, 82, 255), width=30)
    return soft(img, L, 2.0)


def snow_field(horizon=1240, seed=5):
    """Ночной снег: небо сверху, заснеженная земля снизу."""
    sky = vgrad(W, horizon, (28, 40, 54), (66, 86, 102))
    ground = vgrad(W, H - horizon, (196, 210, 220), (92, 108, 120))
    img = Image.new('RGBA', (W, H))
    img.paste(sky, (0, 0))
    img.paste(ground, (0, horizon))
    return tint(img, noise_img(W, H, amp=10, seed=seed, blur=0.5))


def pines(img, seed=1, base_y=1260, count=12, hmin=520, hmax=980, dark=(14, 24, 34), jitter=40, snow=True):
    """Ёлки с белыми верхушками: лес вдоль дороги."""
    rng = np.random.default_rng(seed)
    L = layer()
    d = ImageDraw.Draw(L)
    for x in np.linspace(-40, W + 40, count):
        x = x + rng.uniform(-jitter, jitter)
        h = rng.uniform(hmin, hmax)
        w = h * rng.uniform(0.26, 0.36)
        d.rectangle([x - 6, base_y - 10, x + 6, base_y + 24], fill=dark + (255,))
        d.polygon([(x, base_y - h), (x + w / 2, base_y), (x - w / 2, base_y)], fill=dark + (255,))
        if snow:
            d.polygon([(x, base_y - h), (x + w * 0.18, base_y - h * 0.62), (x - w * 0.18, base_y - h * 0.62)], fill=(214, 226, 236, 170))
    return soft(img, L, 1.2)


def trunks(img, seed=2, count=14, base_y=1700, color=(12, 18, 24)):
    """Тонкие стволы в темноте."""
    rng = np.random.default_rng(seed)
    L = layer()
    d = ImageDraw.Draw(L)
    for x in rng.uniform(0, W, count):
        w = rng.uniform(14, 36)
        top = rng.uniform(0, 500)
        d.rectangle([x - w / 2, top, x + w / 2, base_y], fill=color + (255,))
    return soft(img, L, 2.0)


def footprints(img, pts):
    """Следы в снегу: (x, y, масштаб), от камеры к горизонту."""
    L = layer()
    d = ImageDraw.Draw(L)
    for x, y, s in pts:
        d.ellipse([x - 30 * s, y - 58 * s, x + 30 * s, y + 58 * s], fill=(40, 52, 66, 220))
    return soft(img, L, 2.0)


def corridor(img, vp=(540, 880)):
    """Коридор из паллетов: пол и ряды паллетов сходятся к точке схода."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.polygon([(0, H), (W, H), (vp[0] + 170, vp[1] + 70), (vp[0] - 170, vp[1] + 70)], fill=(70, 86, 96, 255))
    for z in (6.0, 4.2, 3.0, 2.2, 1.6):
        sc = 1.0 / z
        h, w = 640 * sc, 380 * sc
        yb = vp[1] + 280 * sc
        for x in (vp[0] - 430 * sc, vp[0] + 50 * sc):
            d.rectangle([x, yb - h, x + w, yb], fill=(120, 96, 70, 255))
            d.rectangle([x, yb - h * 0.8, x + w, yb - h * 0.5], fill=(170, 176, 182, 110))
    return soft(img, L, 1.5)


def grate(img, x0, y0, w, h, bolts=((0, 0), (1, 0), (0, 1), (1, 1))):
    """Решётка на болтах: слоты, шляпки болтов со шлицем."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.rectangle([x0, y0, x0 + w, y0 + h], fill=(50, 58, 66, 255))
    for x in range(int(x0 + 16), int(x0 + w - 8), 24):
        d.line([(x, y0 + 12), (x, y0 + h - 12)], fill=(22, 28, 34, 255), width=7)
        d.line([(x + 3, y0 + 12), (x + 3, y0 + h - 12)], fill=(150, 170, 182, 70), width=2)
    for fx, fy in bolts:
        bx = x0 + 34 + fx * (w - 68)
        by = y0 + 34 + fy * (h - 68)
        d.ellipse([bx - 20, by - 20, bx + 20, by + 20], fill=(118, 128, 136, 255))
        d.line([(bx - 12, by), (bx + 12, by)], fill=(40, 46, 52, 255), width=5)
    d.rectangle([x0, y0, x0 + w, y0 + h], outline=(18, 22, 26, 255), width=6)
    return soft(img, L, 0.8)


def belt_buckle(img, cx, cy, s=1.0):
    """Ремень: пряжка с язычком, лежит на решётке."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.rounded_rectangle([cx - 120 * s, cy - 60 * s, cx + 120 * s, cy + 60 * s], radius=int(20 * s), fill=(70, 46, 26, 255))
    d.rounded_rectangle([cx - 80 * s, cy - 44 * s, cx + 80 * s, cy + 44 * s], radius=int(14 * s), fill=(176, 186, 194, 255))
    d.rectangle([cx - 4 * s, cy - 40 * s, cx + 4 * s, cy + 40 * s], fill=(90, 100, 108, 255))
    return soft(img, L, 1.2)


def hand_dark(img, cx, cy, s=1.0, color=(10, 12, 16, 255)):
    """Рука, согнутая на металле: ладонь и четыре пальца."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.rounded_rectangle([cx - 80 * s, cy - 40 * s, cx + 80 * s, cy + 120 * s], radius=int(40 * s), fill=color)
    for k, dx in enumerate((-64, -22, 22, 62)):
        top = cy - (150 - 12 * abs(k - 1.5)) * s
        d.rounded_rectangle([cx + dx * s - 18 * s, top, cx + dx * s + 18 * s, cy - 20 * s], radius=int(18 * s), fill=color)
    d.ellipse([cx - 130 * s, cy - 10 * s, cx - 60 * s, cy + 60 * s], fill=color)
    return soft(img, L, 1.0)


def smear(img, cx, cy, rx, ry, color=(120, 40, 36), alpha=110, blur=14):
    """Тёмное пятно на металле (без крови крупным планом)."""
    L = layer()
    ImageDraw.Draw(L).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color + (alpha,))
    return soft(img, L, blur)


def streaks(img, seed=4, n=40, alpha=90):
    """Полосы движения: бег между стволами."""
    rng = np.random.default_rng(seed)
    L = layer()
    d = ImageDraw.Draw(L)
    for _ in range(n):
        x = rng.uniform(0, W)
        y = rng.uniform(300, 1700)
        d.line([(x, y), (x + rng.uniform(-30, 30), y + rng.uniform(200, 600))],
               fill=(200, 220, 235, alpha), width=int(rng.uniform(2, 6)))
    return soft(img, L, 1.5)


def reefer_side(img, x, y, w, h, logo=True, lit=False):
    """Бок рефрижератора: гофрированный металл, шасси, название компании."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.rectangle([x, y, x + w, y + h], fill=(206, 216, 224, 255))
    for xx in range(int(x + 24), int(x + w - 12), 30):
        d.line([(xx, y + 14), (xx, y + h - 14)], fill=(156, 168, 178, 255), width=3)
    d.rectangle([x, y + h - 46, x + w, y + h], fill=(58, 68, 78, 255))
    if logo:
        bh = h * 0.22
        d.rounded_rectangle([x + w * 0.1, y + h * 0.36, x + w * 0.9, y + h * 0.36 + bh], radius=14, fill=(22, 60, 92, 255))
        d.text((x + w * 0.15, y + h * 0.36 + bh * 0.2), 'СЕВЕРТРАНС', font=font(max(12, min(int(bh * 0.52), int(w * 0.8 / 8.0))), True), fill=(255, 230, 170, 255))
    if lit:
        d.rectangle([x + w * 0.4, y + 40, x + w * 0.6, y + h - 60], fill=(255, 176, 96, 110))
    return soft(img, L, 0.6)


def reefer_rear(img, cx, base_y, w=520, h=640):
    """Задняя часть фуры: две створки, фонари, название компании."""
    x0, y0 = cx - w / 2, base_y - h
    L = layer()
    d = ImageDraw.Draw(L)
    d.rectangle([x0, y0, x0 + w, base_y], fill=(206, 216, 224, 255))
    d.rectangle([x0 + w * 0.5 - 4, y0 + 20, x0 + w * 0.5 + 4, base_y - 40], fill=(70, 80, 90, 255))
    d.rectangle([x0 + 20, y0 + h * 0.36, x0 + w - 20, y0 + h * 0.36 + 60], fill=(22, 60, 92, 255))
    d.text((x0 + 40, y0 + h * 0.36 + 10), 'СЕВЕРТРАНС', font=font(54, True), fill=(255, 230, 170, 255))
    d.rectangle([x0, base_y - 40, x0 + w, base_y], fill=(40, 46, 52, 255))
    for xl in (x0 + 30, x0 + w - 60):
        d.rectangle([xl, y0 + h * 0.66, xl + 30, y0 + h * 0.66 + 26], fill=(255, 40, 40, 255))
    return soft(img, L, 0.8)


def phone_map(battery=44):
    """Телефон с картой: маршрут, синяя точка и красная метка."""
    img = layer()
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = 180, 520, 900, 1560
    d.rounded_rectangle([x0 - 26, y0 - 26, x1 + 26, y1 + 26], radius=86, fill=(24, 26, 30, 255))
    sw, sh = x1 - x0, y1 - y0
    scr = Image.new('RGBA', (sw, sh), (30, 40, 46, 255))
    sd = ImageDraw.Draw(scr)
    for k in range(0, sh, 96):
        sd.line([(0, k), (sw, k + 40)], fill=(62, 74, 80, 255), width=12)
    for k in range(-200, sw + 200, 150):
        sd.line([(k, 0), (k + 220, sh)], fill=(52, 64, 70, 255), width=10)
    sd.line([(90, 880), (330, 640), (520, 430), (640, 300)], fill=(96, 160, 176, 255), width=22)
    sd.ellipse([330 - 18, 640 - 18, 330 + 18, 640 + 18], fill=(90, 160, 255, 255))
    px, py = 560, 260
    sd.polygon([(px, py + 150), (px - 58, py + 40), (px + 58, py + 40)], fill=(255, 60, 60, 255))
    sd.ellipse([px - 60, py - 60, px + 60, py + 60], fill=(255, 60, 60, 255))
    sd.ellipse([px - 22, py - 22, px + 22, py + 22], fill=(255, 255, 255, 255))
    mask = Image.new('L', (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1], radius=66, fill=255)
    img.paste(scr, (x0, y0), mask)
    return img


def phone_chat(text='Полиция'):
    """Телефон с перепиской: отправленное слово справа, геолокация отправлена."""
    img = layer()
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = 180, 520, 900, 1560
    d.rounded_rectangle([x0 - 26, y0 - 26, x1 + 26, y1 + 26], radius=86, fill=(24, 26, 30, 255))
    sw, sh = x1 - x0, y1 - y0
    scr = vgrad(sw, sh, (14, 22, 30), (6, 9, 12))
    sd = ImageDraw.Draw(scr)
    sd.rounded_rectangle([60, 130, sw - 60, 300], radius=44, fill=(44, 92, 130, 255))
    sd.text((96, 180), 'Брат', font=font(54, True), fill=(230, 240, 246, 255))
    sd.rounded_rectangle([sw - 560, 420, sw - 60, 580], radius=48, fill=(56, 120, 200, 255))
    sd.text((sw - 520, 468), text, font=font(80, True), fill=(240, 246, 252, 255))
    sd.text((70, 720), 'Геолокация отправлена', font=font(36, False), fill=(180, 200, 210, 255))
    mask = Image.new('L', (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1], radius=66, fill=255)
    img.paste(scr, (x0, y0), mask)
    return img


def ambulance_interior(seed=1):
    """Салон скорой: белые стены, красная полоса, носилки под холодным светом."""
    img = vgrad(W, H, (200, 214, 224), (106, 120, 132))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 1420, W, H], fill=(64, 72, 80, 255))
    d.rectangle([120, 300, 960, 336], fill=(190, 60, 60, 255))
    d.rounded_rectangle([250, 980, 830, 1120], radius=30, fill=(96, 104, 112, 255))
    d.rectangle([330, 760, 760, 990], fill=(230, 236, 240, 255))
    img = glow(img, 540, 260, 520, (255, 236, 210), 0.22)
    return vignette(tint(img, noise_img(W, H, amp=8, seed=seed, blur=0.5)), 0.6)


def seated_worker(img, cx, base_y, h=900, vest=True):
    """Человек сидит в жилете со светоотражающими полосами."""
    img = silhouette(img, cx, base_y, height=h, seated=True, rim=(255, 180, 120))
    if vest:
        L = layer()
        d = ImageDraw.Draw(L)
        top = base_y - h * 0.60
        for k in range(3):
            y = top + (base_y - h * 0.24 - top) * (0.25 + 0.28 * k)
            d.polygon([(cx - 150, y), (cx + 150, y), (cx + 150, y + 24), (cx - 150, y + 24)], fill=(255, 150, 40, 210))
        soft(img, L, 0.8)
    return img


def hard_hat(img, cx, cy, text='КОСТЯ'):
    """Каска со стикером: имя на наклейке."""
    L = layer()
    d = ImageDraw.Draw(L)
    d.pieslice([cx - 260, cy - 260, cx + 260, cy + 260], 180, 360, fill=(246, 196, 40, 255))
    d.rounded_rectangle([cx - 300, cy - 8, cx + 300, cy + 40], radius=20, fill=(214, 168, 32, 255))
    d.rounded_rectangle([cx - 150, cy - 150, cx + 150, cy - 40], radius=18, fill=(255, 255, 255, 230))
    d.text((cx - 130, cy - 128), text, font=font(64, True), fill=(20, 24, 30, 255))
    return soft(img, L, 1.2)


def handprint(img, cx, cy, s=1.0):
    """Отпечаток ладони в инее, изнутри двери."""
    L = layer()
    d = ImageDraw.Draw(L)
    col = (232, 246, 255, 200)
    d.ellipse([cx - 60 * s, cy - 20 * s, cx + 60 * s, cy + 110 * s], fill=col)
    for dx in (-70, -30, 12, 52):
        d.ellipse([cx + dx * s - 16 * s, cy - 130 * s, cx + dx * s + 16 * s, cy - 30 * s], fill=col)
    d.ellipse([cx - 120 * s, cy - 30 * s, cx - 60 * s, cy + 40 * s], fill=col)
    return soft(img, L, 1.2)


def dust(img, seed=6, n=160, alpha=110):
    """Пыль и иней в воздухе."""
    img.alpha_composite(frost_layer(seed=seed, count=n, alpha=alpha))
    return img
