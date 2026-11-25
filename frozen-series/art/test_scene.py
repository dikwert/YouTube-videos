import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from paint import *  # noqa

img = ribbed_wall(W, H)
img = paste_alpha(img, floor_plate(W, 560).resize((W, 560)), (0, H - 560))
img = glow(img, 540, 380, 420, (90, 110, 96), 0.35)
img = paste_alpha(img, pallet_wrapped(360, 420), (80, 1040))
img = paste_alpha(img, pallet_wrapped(360, 420, seed=4), (640, 1080))
img = paste_alpha(img, thermometer(-19, 460, 200), (560, 240))
img = paste_alpha(img, frost_layer(seed=11, count=1400, alpha=150), (0, 0))
img = vignette(img, 0.7)
img = grain(img, 8)
out = Path(__file__).resolve().parents[1] / 'plates' / 'test_thermo.png'
img.convert('RGB').save(out)
print('saved', out)
