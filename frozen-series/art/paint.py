"""Рисование кадров серии «−20. ЗАПЕРТ В ФУРЕ»: полуреалистичная тёмная 2D-иллюстрация.
Всё рисуется кодом (numpy + Pillow): градиенты, шум, зерно, иней, светотень, объекты. Без логотипов реальных брендов."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
FONT_DIR = '/usr/share/fonts'
_FONT_CACHE = {}


def font(size, bold=True):
    key = (size, bold)
    if key not in _FONT_CACHE:
        path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
        _FONT_CACHE[key] = ImageFont.truetype(path, size)
    return _FONT_CACHE[key]


def rgba(c, a=255):
    return (int(c[0]), int(c[1]), int(c[2]), int(a))


def vgrad(w, h, top, bottom):
    t = np.linspace(0, 1, h)[:, None]
    arr = np.array(top)[None, :] * (1 - t) + np.array(bottom)[None, :] * t
    arr = np.repeat(arr[:, None, :], w, axis=1)
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def noise_img(w, h, amp=10, seed=1, blur=0.6):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, 1, (h, w)) * amp + 128
    img = Image.fromarray(n.clip(0, 255).astype(np.uint8), 'L')
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    return img


def tint(base, overlay_gray, mode='soft'):
    """Накладывает серый шум на базовое изображение (RGBA)."""
    g = overlay_gray.convert('L')
    arr = np.asarray(base.convert('RGB')).astype(np.float32)
    n = (np.asarray(g).astype(np.float32) - 128) / 128.0
    arr = arr * (1 + 0.18 * n[..., None])
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def vignette(img, strength=0.65):
    w, h = img.size
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    m = np.clip(1 - strength * np.clip(d - 0.45, 0, None) ** 1.6, 0, 1)
    arr = np.asarray(img.convert('RGB')).astype(np.float32) * m[..., None]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def grain(img, amount=9, seed=3):
    g = noise_img(img.size[0], img.size[1], amp=amount, seed=seed, blur=0)
    return tint(img, g)


def glow(img, cx, cy, radius, color, strength=0.7):
    w, h = img.size
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / radius
    a = np.clip(1 - d, 0, 1) ** 2 * strength
    arr = np.asarray(img.convert('RGB')).astype(np.float32)
    col = np.array(color, dtype=np.float32)[None, None, :]
    arr = arr + a[..., None] * col
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def frost_layer(seed=7, count=900, alpha=160, edge_bias=True):
    """Иней: тонкие белые веточки и точки. Прозрачный слой."""
    rng = np.random.default_rng(seed)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        x = rng.uniform(0, W)
        y = rng.uniform(0, H)
        if edge_bias and rng.random() < 0.6:
            x = rng.choice([rng.uniform(0, 160), rng.uniform(W - 160, W)])
        r = rng.uniform(1.0, 4.0)
        a = int(alpha * rng.uniform(0.5, 1.0))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(235, 246, 255, a))
        if rng.random() < 0.35:
            ang = rng.uniform(0, 2 * math.pi)
            ln = rng.uniform(8, 26)
            x2, y2 = x + ln * math.cos(ang), y + ln * math.sin(ang)
            d.line([(x, y), (x2, y2)], fill=(225, 240, 255, a), width=1)
    return layer.filter(ImageFilter.GaussianBlur(0.4))


def drop_shadow(mask_img, offset=(10, 14), blur=12, strength=0.6):
    a = mask_img.split()[-1]
    sh = Image.new('RGBA', mask_img.size, (0, 0, 0, 0))
    sh.putalpha(a.point(lambda v: int(v * strength)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    out = Image.new('RGBA', mask_img.size, (0, 0, 0, 0))
    out.alpha_composite(sh, offset)
    out.alpha_composite(mask_img)
    return out


def paste_alpha(base, layer, xy=(0, 0)):
    base.alpha_composite(layer, (int(xy[0]), int(xy[1])))
    return base


def ribbed_wall(w, h, base=(58, 84, 96), rib=64, seed=5):
    img = vgrad(w, h, (base[0] + 12, base[1] + 12, base[2] + 12), (base[0] - 18, base[1] - 18, base[2] - 18))
    d = ImageDraw.Draw(img)
    for x in range(0, w, rib):
        d.rectangle([x, 0, x + 4, h], fill=(20, 32, 40, 200))
        d.rectangle([x + 6, 0, x + 12, h], fill=(150, 188, 200, 70))
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    return tint(img, noise_img(w, h, amp=14, seed=seed, blur=0.5))


def floor_plate(w, h, seed=9):
    img = vgrad(w, h, (96, 118, 126), (42, 56, 62))
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(seed)
    for _ in range(140):
        x = rng.uniform(0, w)
        y = rng.uniform(0, h)
        ln = rng.uniform(40, 220)
        d.line([(x, y), (x + ln, y + rng.uniform(-6, 6))], fill=(170, 200, 210, 40), width=1)
    d.rectangle([0, 0, w, 4], fill=(200, 220, 228, 90))
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    return tint(img, noise_img(w, h, amp=12, seed=seed + 1, blur=0.5))


def pallet_wrapped(w, h, seed=2):
    """Деревянный паллет в плёнке: доски, плёнка с бликами."""
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, h * 0.82, w, h], fill=(96, 70, 44, 255))
    for i in range(4):
        x = w * (i / 4) + 6
        d.rectangle([x, h * 0.82, x + w * 0.16, h], fill=(70, 50, 32, 255))
    d.rectangle([0, 0, w, h * 0.82], fill=(170, 176, 182, 110))
    for y in range(0, int(h * 0.8), 14):
        d.line([(0, y), (w, y + 6)], fill=(230, 240, 246, 46), width=2)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    return tint(img, noise_img(w, h, amp=10, seed=seed, blur=0.4))


def thermometer(value, w=520, h=260):
    """Цифровой термометр на стене: LED-цифры."""
    img = Image.new('RGBA', (w, h), (14, 18, 20, 255))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=26, outline=(70, 80, 88, 255), width=6)
    txt = f'{value:+.0f}°C'.replace('+', '').replace('-', '−')
    f = font(118, bold=True)
    tw = d.textlength(txt, font=f)
    d.text(((w - tw) / 2, (h - 130) / 2), txt, font=f, fill=(120, 255, 210, 255))
    glow_img = img.filter(ImageFilter.GaussianBlur(10))
    img.alpha_composite(glow_img.point(lambda v: int(v * 0.35)))
    return img


def label(text, size=44, color=(255, 255, 255, 255), bold=True):
    f = font(size, bold)
    tmp = Image.new('RGBA', (10, 10))
    dd = ImageDraw.Draw(tmp)
    x0, y0, x1, y1 = dd.textbbox((0, 0), text, font=f)
    img = Image.new('RGBA', (x1 - x0 + 4, y1 - y0 + 4), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((2 - x0, 2 - y0), text, font=f, fill=color)
    return img
