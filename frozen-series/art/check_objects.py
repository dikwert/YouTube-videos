import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from objects import *  # noqa
out = Path(__file__).resolve().parents[1] / 'plates'
base = vgrad(W, H, (40, 52, 60), (14, 20, 26))
f = face('fear', 'open', frost=True)
paste_alpha(base, f).convert('RGB').save(out / 'check_face.png')
p = phone(11)
paste_alpha(vgrad(W, H, (30, 36, 42), (12, 16, 20)), p).convert('RGB').save(out / 'check_phone.png')
print('ok')
