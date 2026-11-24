/**
 * Bean-head characters for the Janitor Short (Canvas2D, 600x900 design canvas), shown as flat billboards.
 * Plum ink outline, stick limbs, no blush. The cat is drawn separately (drawCat).
 */

export type Kind = 'gary' | 'linda' | 'ops' | 'pike';
export type Pose = 'stand' | 'sit' | 'float' | 'raise' | 'point' | 'thumb' | 'mop' | 'phone' | 'nap' | 'spit' | 'shrug' | 'drink';
export type Expr = 'neutral' | 'shock' | 'grin' | 'smug' | 'sleep' | 'panic' | 'angry' | 'proud' | 'bored' | 'worry' | 'dazed';
export type CharState = {kind: Kind; pose: Pose; expr: Expr; mouth?: number; variant?: number; blink?: boolean};

const INK = '#241726';
const W = 600;
const H = 900;
const GROUND = 860;

const SKIN = ['#f2b48c', '#e8a377', '#c98a5e', '#f6c4a0', '#d9996f'];
const SKIN_SHADE = ['#d6956f', '#c98a5e', '#a86d46', '#e0ad86', '#b87f58'];

/** Per-kind palette: outfit, accent, hair, skin index. */
const PALETTE: Record<Kind, {outfit: string; accent: string; hair: string; skin: number}> = {
  gary: {outfit: '#3b6fb6', accent: '#1d3b6e', hair: '#9a9a96', skin: 1},
  linda: {outfit: '#2d2f3a', accent: '#f2c94c', hair: '#6b4424', skin: 2},
  ops: {outfit: '#1d3b6e', accent: '#d63b3b', hair: '#2b2118', skin: 0},
  pike: {outfit: '#24252b', accent: '#c02b2b', hair: '#2b2118', skin: 3},
};

function skinOf(kind: Kind, variant = 0): {skin: string; shade: string} {
  const i = (PALETTE[kind].skin + variant) % SKIN.length;
  return {skin: SKIN[i], shade: SKIN_SHADE[i]};
}

/** Limb endpoints per pose (design canvas), plus head offset and tilt. */
type Limbs = {lh: [number, number]; rh: [number, number]; lk?: [number, number]; rk?: [number, number];
  lf: [number, number]; rf: [number, number]; head: [number, number]; tilt: number};
const POSES: Record<Pose, Limbs> = {
  stand: {lh: [190, 640], rh: [410, 640], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  sit: {lh: [215, 560], rh: [390, 560], lk: [400, 690], rk: [440, 690], lf: [420, 862], rf: [452, 862], head: [0, 0], tilt: 0},
  float: {lh: [120, 430], rh: [480, 420], lf: [230, 790], rf: [370, 800], head: [0, -10], tilt: 0.12},
  raise: {lh: [185, 640], rh: [560, 110], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  point: {lh: [190, 640], rh: [560, 320], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  thumb: {lh: [190, 640], rh: [470, 330], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0.04},
  mop: {lh: [250, 560], rh: [360, 520], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  phone: {lh: [190, 640], rh: [400, 300], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  nap: {lh: [215, 560], rh: [390, 560], lk: [400, 690], rk: [440, 690], lf: [420, 862], rf: [452, 862], head: [30, 40], tilt: 0.3},
  spit: {lh: [190, 640], rh: [410, 640], lf: [265, GROUND], rf: [335, GROUND], head: [0, -10], tilt: -0.2},
  shrug: {lh: [188, 470], rh: [412, 470], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  drink: {lh: [190, 640], rh: [360, 420], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
};

function ink(ctx: CanvasRenderingContext2D, w: number) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function stick(ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number], colour: string, w = 18) {
  ink(ctx, w + 8);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
  ctx.strokeStyle = colour;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: string) {
  ink(ctx, 7);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function shape(ctx: CanvasRenderingContext2D, fill: string, w: number, draw: () => void) {
  ink(ctx, w);
  ctx.fillStyle = fill;
  ctx.beginPath();
  draw();
  ctx.fill();
  ctx.stroke();
}

/** Bean head: round crown, narrower chin. Centre (cx, cy). */
function beanPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, s = 1) {
  const x = (v: number) => cx + (v - 300) * s;
  const y = (v: number) => cy + (v - 230) * s;
  ctx.moveTo(x(300), y(70));
  ctx.bezierCurveTo(x(430), y(70), x(440), y(200), x(430), y(250));
  ctx.bezierCurveTo(x(420), y(330), x(360), y(380), x(300), y(384));
  ctx.bezierCurveTo(x(240), y(380), x(180), y(330), x(170), y(250));
  ctx.bezierCurveTo(x(160), y(200), x(170), y(70), x(300), y(70));
  ctx.closePath();
}

function hairOf(ctx: CanvasRenderingContext2D, kind: Kind, cx: number, cy: number, s: number, floating: boolean) {
  const x = (v: number) => cx + (v - 300) * s;
  const y = (v: number) => cy + (v - 230) * s;
  const hair = PALETTE[kind].hair;
  if (kind === 'gary') {
    // cap (a blue work cap with a peak), grey side hair
    shape(ctx, PALETTE.gary.accent, 9, () => {
      ctx.moveTo(x(165), y(150));
      ctx.bezierCurveTo(x(170), y(40), x(430), y(40), x(435), y(150));
      ctx.lineTo(x(435), y(165));
      ctx.lineTo(x(165), y(165));
      ctx.closePath();
    });
    shape(ctx, PALETTE.gary.accent, 9, () => {
      ctx.moveTo(x(140), y(160));
      ctx.lineTo(x(460), y(160));
      ctx.lineTo(x(440), y(186));
      ctx.lineTo(x(160), y(186));
      ctx.closePath();
    });
    // grey hair at the sides, lifted when floating
    const lift = floating ? -40 : 0;
    shape(ctx, hair, 9, () => {
      ctx.moveTo(x(168), y(170 + lift));
      ctx.bezierCurveTo(x(150), y(200), x(168), y(240), x(178), y(250));
      ctx.lineTo(x(200), y(200));
      ctx.closePath();
      ctx.moveTo(x(432), y(170 + lift));
      ctx.bezierCurveTo(x(450), y(200), x(432), y(240), x(422), y(250));
      ctx.lineTo(x(400), y(200));
      ctx.closePath();
    });
    return;
  }
  if (kind === 'linda') {
    // hair in a bun, glasses come with the face
    shape(ctx, hair, 9, () => ctx.arc(x(300), y(60), 48 * s, 0, Math.PI * 2));
    shape(ctx, hair, 9, () => {
      ctx.moveTo(x(165), y(230));
      ctx.bezierCurveTo(x(150), y(100), x(250), y(60), x(300), y(60));
      ctx.bezierCurveTo(x(360), y(60), x(455), y(100), x(440), y(230));
      ctx.bezierCurveTo(x(420), y(170), x(180), y(170), x(165), y(230));
      ctx.closePath();
    });
    // headset band
    ink(ctx, 12);
    ctx.strokeStyle = '#222222';
    ctx.beginPath();
    ctx.arc(x(300), y(200), 170 * s, Math.PI * 1.05, Math.PI * 1.9);
    ctx.stroke();
    shape(ctx, '#222222', 8, () => ctx.ellipse(x(150), y(250), 30, 42, 0, 0, Math.PI * 2));
    return;
  }
  if (kind === 'pike') {
    // slicked-back hair
    shape(ctx, hair, 9, () => {
      ctx.moveTo(x(170), y(230));
      ctx.bezierCurveTo(x(160), y(100), x(300), y(60), x(320), y(70));
      ctx.bezierCurveTo(x(420), y(80), x(440), y(160), x(430), y(230));
      ctx.bezierCurveTo(x(410), y(180), x(180), y(180), x(170), y(230));
      ctx.closePath();
    });
    return;
  }
  // ops: a headset over short hair
  shape(ctx, hair, 9, () => {
    ctx.moveTo(x(170), y(230));
    ctx.bezierCurveTo(x(150), y(90), x(300), y(60), x(330), y(70));
    ctx.bezierCurveTo(x(420), y(70), x(445), y(150), x(430), y(230));
    ctx.bezierCurveTo(x(410), y(170), x(380), y(160), x(340), y(180));
    ctx.bezierCurveTo(x(300), y(150), x(250), y(170), x(190), y(160));
    ctx.bezierCurveTo(x(180), y(180), x(175), y(200), x(170), y(230));
    ctx.closePath();
  });
  ink(ctx, 10);
  ctx.strokeStyle = '#222222';
  ctx.beginPath();
  ctx.arc(x(300), y(200), 160 * s, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
}

function faceOf(ctx: CanvasRenderingContext2D, expr: Expr, cx: number, cy: number, s: number, mouth: number, blink: boolean) {
  const x = (v: number) => cx + (v - 300) * s;
  const y = (v: number) => cy + (v - 230) * s;
  const eyeL = [x(238), y(250)];
  const eyeR = [x(362), y(250)];
  const open = expr !== 'smug' && (mouth ?? 0) > 0.08;
  const mo = Math.max(0, Math.min(1, mouth ?? 0));
  const eyeRx = expr === 'shock' || expr === 'panic' ? 22 : expr === 'sleep' ? 14 : 15;
  const eyeRy = expr === 'shock' || expr === 'panic' ? 28 : expr === 'sleep' ? 3 : expr === 'smug' || expr === 'bored' ? 9 : 17;
  for (const [ex, ey] of [eyeL, eyeR]) {
    if (blink || expr === 'sleep') {
      ink(ctx, 8);
      ctx.beginPath();
      ctx.moveTo(ex - 16 * s, ey + 2);
      ctx.quadraticCurveTo(ex, ey + 14 * s, ex + 16 * s, ey + 2);
      ctx.stroke();
      continue;
    }
    shape(ctx, '#ffffff', 7, () => ctx.ellipse(ex, ey, eyeRx * s, eyeRy * s, 0, 0, Math.PI * 2));
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(ex + (expr === 'angry' ? 2 : 0), ey + (expr === 'shock' ? 2 : 3), (expr === 'shock' ? 6 : 8) * s, 0, Math.PI * 2);
    ctx.fill();
    if (expr === 'smug' || expr === 'bored') {
      // half-lidded: a lid line across the top of each eye
      ink(ctx, 9);
      ctx.beginPath();
      ctx.moveTo(ex - eyeRx * s - 2, ey - eyeRy * s * 0.45);
      ctx.lineTo(ex + eyeRx * s + 2, ey - eyeRy * s * 0.45);
      ctx.stroke();
    }
  }
  // brows
  ink(ctx, 10);
  ctx.beginPath();
  const by = expr === 'shock' || expr === 'panic' ? y(192) : y(214);
  if (expr === 'angry') {
    ctx.moveTo(x(222), y(196)); ctx.lineTo(x(268), y(220));
    ctx.moveTo(x(378), y(196)); ctx.lineTo(x(332), y(220));
  } else if (expr === 'worry') {
    ctx.moveTo(x(222), y(206)); ctx.lineTo(x(262), y(196));
    ctx.moveTo(x(338), y(196)); ctx.lineTo(x(378), y(206));
  } else if (expr === 'smug') {
    ctx.moveTo(x(222), y(228)); ctx.lineTo(x(262), y(222));
    ctx.moveTo(x(340), y(218)); ctx.lineTo(x(378), y(230));
  } else {
    ctx.moveTo(x(222), by); ctx.quadraticCurveTo(x(240), by - 12 * s, x(262), by);
    ctx.moveTo(x(338), by); ctx.quadraticCurveTo(x(360), by - 12 * s, x(378), by);
  }
  ctx.stroke();
  // mouth
  ctx.strokeStyle = INK;
  if (open || expr === 'shock' || expr === 'panic' || expr === 'sleep') {
    const hgt = expr === 'sleep' ? 14 : 8 + 26 * (open ? mo : expr === 'shock' || expr === 'panic' ? 0.9 : 0.6);
    shape(ctx, '#3a1d22', 7, () => ctx.ellipse(x(300), y(330), 26 * s, hgt * s, 0, 0, Math.PI * 2));
    return;
  }
  ink(ctx, 9);
  ctx.beginPath();
  if (expr === 'grin' || expr === 'proud') {
    ctx.moveTo(x(262), y(318)); ctx.quadraticCurveTo(x(300), y(372), x(338), y(318));
  } else if (expr === 'smug') {
    ctx.moveTo(x(268), y(330)); ctx.quadraticCurveTo(x(320), y(342), x(346), y(312));
  } else if (expr === 'angry' || expr === 'bored' || expr === 'worry') {
    ctx.moveTo(x(266), y(332)); ctx.lineTo(x(334), y(332));
  } else {
    ctx.moveTo(x(270), y(326)); ctx.quadraticCurveTo(x(300), y(334), x(330), y(326));
  }
  ctx.stroke();
}

/** Draws one character state into a fresh canvas. */
export function drawChar(st: CharState): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  const p = PALETTE[st.kind];
  const {skin, shade} = skinOf(st.kind, st.variant ?? 0);
  const pose = POSES[st.pose];
  const hx = 300 + pose.head[0];
  const hy = 230 + pose.head[1];
  const floating = st.pose === 'float';

  // legs (behind the body); seated and napping poses bend at the knee
  const legColour = st.kind === 'gary' ? '#2f4f7a' : st.kind === 'pike' ? '#1d1e22' : '#3a3f4a';
  const leg = (hip: [number, number], knee: [number, number] | undefined, foot: [number, number]) => {
    if (knee) {
      stick(ctx, hip, knee, legColour, 24);
      stick(ctx, knee, foot, legColour, 24);
    } else {
      stick(ctx, hip, foot, legColour, 24);
    }
  };
  leg([265, 650], pose.lk, pose.lf);
  leg([335, 650], pose.rk, pose.rf);
  for (const f of [pose.lf, pose.rf]) {
    shape(ctx, '#2a2320', 8, () => ctx.ellipse(f[0] + (f[0] < 300 ? -10 : 10), f[1] + 6, 34, 14, 0, 0, Math.PI * 2));
  }

  // body
  shape(ctx, p.outfit, 9, () => {
    ctx.moveTo(195, 400);
    ctx.quadraticCurveTo(300, 380, 405, 400);
    ctx.quadraticCurveTo(425, 470, 415, 650);
    ctx.lineTo(185, 650);
    ctx.quadraticCurveTo(175, 470, 195, 400);
    ctx.closePath();
  });
  if (st.kind === 'gary') {
    // jumpsuit zip, belly, and the name badge
    stick(ctx, [300, 420], [300, 640], '#1d3b6e', 6);
    shape(ctx, '#ffffff', 6, () => ctx.rect(236, 470, 128, 56));
    ctx.fillStyle = '#1d3b6e';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GARY', 300, 500);
    shape(ctx, '#f2d6a6', 8, () => ctx.ellipse(300, 585, 92, 58, 0, 0, Math.PI * 2));
  }
  if (st.kind === 'linda') {
    shape(ctx, p.accent, 7, () => ctx.rect(255, 430, 90, 22));
  }
  if (st.kind === 'pike') {
    // tie
    shape(ctx, p.accent, 7, () => {
      ctx.moveTo(300, 420); ctx.lineTo(318, 440); ctx.lineTo(310, 560); ctx.lineTo(300, 575); ctx.lineTo(290, 560); ctx.lineTo(282, 440);
      ctx.closePath();
    });
  }
  if (st.kind === 'ops') {
    shape(ctx, p.accent, 7, () => ctx.rect(256, 430, 88, 16));
  }

  // arms
  const armCol = st.kind === 'gary' ? '#3b6fb6' : p.outfit;
  stick(ctx, [215, 430], pose.lh, armCol, 20);
  stick(ctx, [385, 430], pose.rh, armCol, 20);
  // Gary's hands are yellow rubber gloves
  const hand = st.kind === 'gary' ? '#f5c518' : skin;
  dot(ctx, pose.lh[0], pose.lh[1], 19, hand);
  dot(ctx, pose.rh[0], pose.rh[1], 19, hand);

  // neck and head
  shape(ctx, shade, 7, () => ctx.rect(hx - 40, 360, 80, 50));
  shape(ctx, skin, 9, () => beanPath(ctx, hx, hy, 1));
  ctx.save();
  ctx.beginPath();
  beanPath(ctx, hx, hy, 1);
  ctx.clip();
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.ellipse(hx + 150, hy + 40, 100, 200, 0, 0, Math.PI * 2);
  ctx.globalAlpha = 0.45;
  ctx.fill();
  ctx.restore();

  hairOf(ctx, st.kind, hx, hy, 1, floating);
  if (st.kind === 'gary') {
    // grey moustache
    shape(ctx, '#8a8a86', 7, () => {
      ctx.moveTo(hx - 70, hy + 90); ctx.quadraticCurveTo(hx - 30, hy + 60, hx, hy + 84);
      ctx.quadraticCurveTo(hx + 30, hy + 60, hx + 70, hy + 90);
      ctx.quadraticCurveTo(hx, hy + 110, hx - 70, hy + 90);
      ctx.closePath();
    });
  }
  if (st.kind === 'pike') {
    // a thin moustache and a stone face
    shape(ctx, '#2b2118', 6, () => {
      ctx.moveTo(hx - 40, hy + 92); ctx.lineTo(hx + 40, hy + 92); ctx.lineTo(hx + 36, hy + 100); ctx.lineTo(hx - 36, hy + 100);
      ctx.closePath();
    });
  }
  faceOf(ctx, st.expr, hx, hy, 1, st.mouth ?? 0, st.blink ?? false);

  // pose props
  if (st.pose === 'mop') {
    // a mop: handle from the right hand down to the floor, a grey head with strands
    stick(ctx, [360, 520], [520, 870], '#b08a5a', 12);
    shape(ctx, '#d9d4c6', 6, () => ctx.ellipse(540, 868, 66, 22, -0.2, 0, Math.PI * 2));
  }
  if (st.pose === 'phone') {
    shape(ctx, '#1b2026', 6, () => ctx.rect(372, 262, 56, 96));
    shape(ctx, '#7fe0ff', 4, () => ctx.rect(380, 272, 40, 70));
  }
  if (st.pose === 'drink') {
    // a water pouch at the mouth
    shape(ctx, '#b8e3ff', 6, () => ctx.rect(340, 300, 44, 70));
  }
  if (st.pose === 'spit') {
    // coffee spray
    for (const [dx, dy] of [[90, -60], [120, -30], [60, -90], [140, -70], [170, -110], [200, -50]]) dot(ctx, 300 + dx, 300 + dy, 20, '#6b3e1f');
  }
  if (st.expr === 'sleep' && st.pose !== 'nap') {  // the nap's Zs float in the shot (ZLetter)
    // light letters with a plum outline, so they read on the dark capsule wall
    ctx.lineJoin = 'round';
    ctx.lineWidth = 9;
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#eaf4ff';
    ctx.font = 'bold 52px Arial';
    ctx.strokeText('Z', 470, 150);
    ctx.fillText('Z', 470, 150);
    ctx.font = 'bold 40px Arial';
    ctx.strokeText('z', 510, 110);
    ctx.fillText('z', 510, 110);
  }
  if (st.expr === 'panic') {
    shape(ctx, '#8fd3ff', 6, () => {
      ctx.moveTo(hx + 128, hy - 80); ctx.quadraticCurveTo(hx + 150, hy - 40, hx + 128, hy - 20);
      ctx.quadraticCurveTo(hx + 106, hy - 40, hx + 128, hy - 80);
    });
  }
  return canvas;
}

/** A tabby cat in a small vest with a patch. Looks at the camera; expr 'judge' is the stare. */
export function drawCat(expr: 'judge' | 'smug' | 'sleepy' | 'turn'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 600;
  c.height = 600;
  const g = c.getContext('2d')!;
  // tail
  ink(g, 22);
  g.strokeStyle = '#d9822b';
  g.lineWidth = 34;
  g.beginPath();
  g.moveTo(430, 460); g.quadraticCurveTo(580, 430, 540, 300);
  g.stroke();
  ink(g, 8);
  // body and vest
  shape(g, '#e8923a', 9, () => g.ellipse(300, 430, 170, 130, 0, 0, Math.PI * 2));
  shape(g, '#3b6fb6', 8, () => g.rect(190, 380, 220, 140));
  shape(g, '#f2c94c', 6, () => g.rect(268, 420, 64, 44));
  // stripes on the body
  ink(g, 9);
  g.beginPath();
  for (const dx of [-90, -40, 10, 60]) {
    g.moveTo(300 + dx, 310); g.lineTo(300 + dx + 14, 335);
  }
  g.stroke();
  // ears and head
  shape(g, '#e8923a', 9, () => {
    g.moveTo(190, 230); g.lineTo(200, 90); g.lineTo(270, 190); g.closePath();
  });
  shape(g, '#e8923a', 9, () => {
    g.moveTo(410, 230); g.lineTo(400, 90); g.lineTo(330, 190); g.closePath();
  });
  shape(g, '#e8923a', 9, () => g.ellipse(300, 240, 120, 110, 0, 0, Math.PI * 2));
  // face: eyes, nose, mouth, whiskers
  const eyeY = expr === 'sleepy' ? 240 : 230;
  const eyeH = expr === 'judge' ? 14 : expr === 'sleepy' ? 6 : 24;
  shape(g, '#ffffff', 6, () => g.ellipse(255, eyeY, 26, eyeH, 0, 0, Math.PI * 2));
  shape(g, '#ffffff', 6, () => g.ellipse(345, eyeY, 26, eyeH, 0, 0, Math.PI * 2));
  g.fillStyle = INK;
  g.beginPath();
  g.arc(expr === 'turn' ? 240 : 255, eyeY + 2, 9, 0, Math.PI * 2);
  g.arc(expr === 'turn' ? 330 : 345, eyeY + 2, 9, 0, Math.PI * 2);
  g.fill();
  shape(g, '#f0a0a0', 5, () => {
    g.moveTo(290, 282); g.lineTo(310, 282); g.lineTo(300, 296); g.closePath();
  });
  ink(g, 6);
  g.beginPath();
  g.moveTo(300, 296); g.lineTo(300, 308);
  g.moveTo(300, 308); g.quadraticCurveTo(284, 322, 270, 312);
  g.moveTo(300, 308); g.quadraticCurveTo(316, 322, 330, 312);
  g.stroke();
  ink(g, 4);
  g.beginPath();
  for (const side of [-1, 1]) {
    g.moveTo(300 + side * 60, 290); g.lineTo(300 + side * 150, 280);
    g.moveTo(300 + side * 60, 302); g.lineTo(300 + side * 150, 312);
  }
  g.stroke();
  return c;
}

/** Stable cache key for a state (rounded mouth so lip-sync re-draws only a few times). */
export function charKey(st: CharState): string {
  const m = Math.round((st.mouth ?? 0) * 4) / 4;
  return [st.kind, st.pose, st.expr, m, st.variant ?? 0, st.blink ? 1 : 0].join('|');
}
