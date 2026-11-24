/**
 * Bean-head characters drawn with Canvas2D (one 600x900 design canvas per pose and expression),
 * shown as flat billboards in the 3D world. Plum ink outline, stick limbs, no blush.
 */

export type Kind = 'kevin' | 'rick' | 'dave' | 'gloria' | 'edna' | 'tommy' | 'cashier' | 'pax';
export type Pose = 'stand' | 'sit' | 'raise' | 'armsup' | 'slump' | 'knit' | 'fork' | 'run' | 'point' | 'thumb' | 'shrug' | 'seated_hand' | 'eat' | 'socks' | 'note';
export type Expr = 'neutral' | 'shock' | 'grin' | 'smug' | 'sleep' | 'panic' | 'angry' | 'proud' | 'bored' | 'pain';

export type CharState = {kind: Kind; pose: Pose; expr: Expr; mouth?: number; variant?: number; blink?: boolean};

const INK = '#241726';
const W = 600;
const H = 900;
const GROUND = 860;

const SKIN = ['#f2b48c', '#e8a377', '#c98a5e', '#f6c4a0', '#d9996f'];
const SKIN_SHADE = ['#d6956f', '#c98a5e', '#a86d46', '#e0ad86', '#b87f58'];

/** Per-kind palette: outfit, accent, hair. */
const PALETTE: Record<Kind, {outfit: string; accent: string; hair: string; skin: number}> = {
  kevin: {outfit: '#3b6fb6', accent: '#23324a', hair: '#5b3a1f', skin: 0},
  rick: {outfit: '#f3f3f0', accent: '#1d3b6e', hair: '#8a8a86', skin: 1},
  dave: {outfit: '#1d3b6e', accent: '#f2c94c', hair: '#2b2118', skin: 0},
  gloria: {outfit: '#1d3b6e', accent: '#d63b3b', hair: '#3a2a1e', skin: 2},
  edna: {outfit: '#9b6bc1', accent: '#e8d9f2', hair: '#c8c8c8', skin: 3},
  tommy: {outfit: '#5fae55', accent: '#2d6a2a', hair: '#6b4424', skin: 4},
  cashier: {outfit: '#ffffff', accent: '#e0453a', hair: '#3a2a1e', skin: 2},
  pax: {outfit: '#c5a46b', accent: '#7a5a33', hair: '#2f2a25', skin: 1},
};

function skinOf(kind: Kind, variant = 0): {skin: string; shade: string} {
  const p = PALETTE[kind];
  const i = (p.skin + variant) % SKIN.length;
  return {skin: SKIN[i], shade: SKIN_SHADE[i]};
}

/** Limb endpoints per pose: [left hand, right hand, left knee/foot, right foot] plus head offset and tilt. */
const POSES: Record<Pose, {lh: [number, number]; rh: [number, number]; lk?: [number, number]; rk?: [number, number]; lf: [number, number]; rf: [number, number]; head: [number, number]; tilt: number}> = {
  stand: {lh: [190, 640], rh: [410, 640], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  sit: {lh: [215, 560], rh: [390, 560], lk: [400, 690], rk: [440, 690], lf: [420, 862], rf: [452, 862], head: [0, 0], tilt: 0},
  eat: {lh: [215, 560], rh: [455, 470], lk: [400, 690], rk: [440, 690], lf: [420, 862], rf: [452, 862], head: [0, 0], tilt: 0},
  socks: {lh: [190, 640], rh: [410, 640], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  note: {lh: [190, 640], rh: [410, 640], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  raise: {lh: [185, 640], rh: [560, 110], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  armsup: {lh: [150, 230], rh: [450, 230], lf: [265, GROUND], rf: [335, GROUND], head: [0, -6], tilt: 0},
  slump: {lh: [250, 640], rh: [350, 630], lk: [400, 690], rk: [440, 690], lf: [420, 862], rf: [452, 862], head: [60, 230], tilt: 0.25},
  knit: {lh: [245, 430], rh: [355, 430], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: -0.05},
  fork: {lh: [190, 640], rh: [480, 520], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  run: {lh: [175, 470], rh: [425, 620], lf: [225, GROUND - 40], rf: [380, GROUND], head: [0, 0], tilt: 0.04},
  point: {lh: [190, 640], rh: [560, 320], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  thumb: {lh: [190, 640], rh: [470, 330], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0.04},
  shrug: {lh: [120, 330], rh: [480, 330], lf: [265, GROUND], rf: [335, GROUND], head: [0, 0], tilt: 0},
  seated_hand: {lh: [215, 560], rh: [480, 470], lk: [400, 690], rk: [440, 690], lf: [420, 862], rf: [452, 862], head: [0, 0], tilt: 0},
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

function shape(ctx: CanvasRenderingContext2D, fill: string, w = 9, draw: () => void) {
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

function hairOf(ctx: CanvasRenderingContext2D, kind: Kind, cx: number, cy: number, s: number) {
  const x = (v: number) => cx + (v - 300) * s;
  const y = (v: number) => cy + (v - 230) * s;
  const hair = PALETTE[kind].hair;
  if (kind === 'rick') {
    // peaked cap
    shape(ctx, PALETTE.rick.accent, 9, () => {
      ctx.moveTo(x(160), y(150));
      ctx.bezierCurveTo(x(170), y(40), x(430), y(40), x(440), y(150));
      ctx.lineTo(x(440), y(165));
      ctx.lineTo(x(160), y(165));
      ctx.closePath();
    });
    shape(ctx, PALETTE.rick.accent, 9, () => {
      ctx.moveTo(x(140), y(160));
      ctx.lineTo(x(460), y(160));
      ctx.lineTo(x(440), y(190));
      ctx.lineTo(x(160), y(190));
      ctx.closePath();
    });
    return;
  }
  if (kind === 'gloria') {
    shape(ctx, PALETTE.gloria.accent, 9, () => {
      ctx.moveTo(x(150), y(230));
      ctx.bezierCurveTo(x(140), y(60), x(460), y(60), x(450), y(230));
      ctx.bezierCurveTo(x(430), y(180), x(170), y(180), x(150), y(230));
      ctx.closePath();
    });
    return;
  }
  if (kind === 'edna') {
    shape(ctx, hair, 9, () => {
      ctx.arc(x(300), y(80), 52 * s, 0, Math.PI * 2);
    });
    shape(ctx, hair, 9, () => {
      ctx.moveTo(x(160), y(230));
      ctx.bezierCurveTo(x(150), y(110), x(230), y(40), x(300), y(40));
      ctx.bezierCurveTo(x(370), y(40), x(450), y(110), x(440), y(230));
      ctx.bezierCurveTo(x(420), y(180), x(180), y(180), x(160), y(230));
      ctx.closePath();
    });
    return;
  }
  if (kind === 'cashier') {
    // paper hat
    shape(ctx, '#ffffff', 9, () => {
      ctx.moveTo(x(170), y(120));
      ctx.lineTo(x(430), y(120));
      ctx.lineTo(x(450), y(40));
      ctx.lineTo(x(150), y(40));
      ctx.closePath();
    });
    shape(ctx, PALETTE.cashier.accent, 6, () => {
      ctx.rect(x(150), y(40), x(450) - x(150), 24 * s);
    });
    return;
  }
  if (kind === 'tommy') {
    shape(ctx, hair, 9, () => {
      ctx.moveTo(x(170), y(230));
      ctx.bezierCurveTo(x(150), y(70), x(440), y(60), x(430), y(230));
      ctx.bezierCurveTo(x(400), y(150), x(200), y(150), x(170), y(230));
      ctx.closePath();
    });
    return;
  }
  // kevin, dave, pax: a messy top
  shape(ctx, hair, 9, () => {
    ctx.moveTo(x(170), y(230));
    ctx.bezierCurveTo(x(150), y(90), x(300), y(60), x(330), y(70));
    ctx.bezierCurveTo(x(420), y(70), x(445), y(150), x(430), y(230));
    ctx.bezierCurveTo(x(410), y(170), x(380), y(160), x(340), y(180));
    ctx.bezierCurveTo(x(300), y(150), x(250), y(170), x(190), y(160));
    ctx.bezierCurveTo(x(180), y(180), x(175), y(200), x(170), y(230));
    ctx.closePath();
  });
}

function faceOf(ctx: CanvasRenderingContext2D, expr: Expr, cx: number, cy: number, s: number, mouth: number, blink: boolean) {
  const x = (v: number) => cx + (v - 300) * s;
  const y = (v: number) => cy + (v - 230) * s;
  const eyeL = [x(238), y(250)];
  const eyeR = [x(362), y(250)];
  // a smug face keeps its smirk while the narrator speaks: no open mouth
  const open = expr !== 'smug' && (mouth ?? 0) > 0.08;
  const mo = Math.max(0, Math.min(1, mouth ?? 0));
  const eyeRx = expr === 'shock' ? 22 : expr === 'sleep' ? 14 : 15;
  const eyeRy = expr === 'shock' ? 28 : expr === 'sleep' ? 3 : expr === 'smug' ? 9 : 17;
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
    if (expr === 'smug') {
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
  const by = expr === 'shock' ? y(196) : expr === 'angry' ? y(214) : expr === 'proud' ? y(214) : y(214);
  if (expr === 'angry') {
    ctx.moveTo(x(222), y(196)); ctx.lineTo(x(268), y(220));
    ctx.moveTo(x(378), y(196)); ctx.lineTo(x(332), y(220));
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
    const hgt = expr === 'sleep' ? 14 : 8 + 26 * (open ? mo : expr === 'shock' ? 0.8 : 0.6);
    shape(ctx, '#3a1d22', 7, () => ctx.ellipse(x(300), y(330), 26 * s, hgt * s, 0, 0, Math.PI * 2));
    if (expr === 'panic') {
      shape(ctx, '#8fd3ff', 4, () => {
        ctx.moveTo(x(440), y(190)); ctx.quadraticCurveTo(x(452), y(220), x(440), y(232));
        ctx.quadraticCurveTo(x(428), y(220), x(440), y(190));
      });
    }
    return;
  }
  ink(ctx, 9);
  ctx.beginPath();
  if (expr === 'grin' || expr === 'proud') {
    ctx.moveTo(x(262), y(318)); ctx.quadraticCurveTo(x(300), y(372), x(338), y(318));
  } else if (expr === 'smug') {
    ctx.moveTo(x(268), y(330)); ctx.quadraticCurveTo(x(320), y(342), x(346), y(312));
  } else if (expr === 'angry' || expr === 'bored' || expr === 'pain') {
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
  const s = st.kind === 'tommy' ? 0.82 : 1;

  // legs (behind the body)
  const legColour = st.kind === 'rick' ? '#1d3b6e' : st.kind === 'gloria' ? '#1d3b6e' : st.kind === 'cashier' ? '#2b2b2b' : '#3a3f4a';
  // a seated pose bends at the knee so the shins reach the floor
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
    shape(ctx, '#2a2320', 8, () => ctx.ellipse(f[0] + (f[0] < 300 ? -10 : 10), GROUND + 6, 34, 14, 0, 0, Math.PI * 2));
  }
  if (st.pose === 'socks') {
    // striped socks above the ankles
    for (const x of [pose.lf[0], pose.rf[0]]) {
      stick(ctx, [x, 740], [x, 790], '#e84a3b', 38);
      stick(ctx, [x, 790], [x, 840], '#fff6d8', 38);
    }
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
  // collar / accent
  if (st.kind === 'rick' || st.kind === 'dave') {
    shape(ctx, p.accent, 7, () => {
      ctx.moveTo(195, 420); ctx.lineTo(250, 430); ctx.lineTo(228, 520); ctx.lineTo(195, 470); ctx.closePath();
    });
    shape(ctx, p.accent, 7, () => {
      ctx.moveTo(405, 420); ctx.lineTo(350, 430); ctx.lineTo(372, 520); ctx.lineTo(405, 470); ctx.closePath();
    });
  }
  if (st.kind === 'gloria') {
    shape(ctx, p.accent, 7, () => {
      ctx.moveTo(240, 420); ctx.lineTo(300, 470); ctx.lineTo(360, 420); ctx.lineTo(360, 650); ctx.lineTo(240, 650); ctx.closePath();
    });
  }
  if (st.kind === 'kevin') {
    // hoodie pocket and drawstring
    shape(ctx, p.accent, 7, () => ctx.rect(240, 560, 120, 60));
    stick(ctx, [270, 430], [268, 500], '#e9e4d8', 6);
    stick(ctx, [330, 430], [332, 500], '#e9e4d8', 6);
  }
  if (st.kind === 'tommy') {
    // dinosaur shirt: green with spots
    for (const [dx, dy] of [[250, 470], [320, 520], [280, 580], [340, 600]]) dot(ctx, dx, dy, 10, '#2d6a2a');
  }
  if (st.kind === 'edna') {
    shape(ctx, p.accent, 7, () => ctx.rect(215, 500, 170, 14));
  }

  // arms
  const armCol = st.kind === 'cashier' ? '#ffffff' : p.outfit;
  stick(ctx, [215, 430], pose.lh, armCol, 20);
  stick(ctx, [385, 430], pose.rh, armCol, 20);
  dot(ctx, pose.lh[0], pose.lh[1], 19, skin);
  dot(ctx, pose.rh[0], pose.rh[1], 19, skin);

  // neck
  shape(ctx, shade, 7, () => ctx.rect(hx - 40, 360, 80, 50));

  // head
  shape(ctx, skin, 9, () => beanPath(ctx, hx, hy, 1));
  // shade on the right side (a single tone, no gradient)
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

  hairOf(ctx, st.kind, hx, hy, 1);
  if (st.kind === 'kevin') {
    // headphones over the top of the head
    ink(ctx, 16);
    ctx.strokeStyle = '#222222';
    ctx.beginPath();
    ctx.arc(hx, hy - 20, 165, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    shape(ctx, '#222222', 9, () => ctx.ellipse(hx - 160, hy + 40, 36, 52, 0, 0, Math.PI * 2));
    shape(ctx, '#222222', 9, () => ctx.ellipse(hx + 160, hy + 40, 36, 52, 0, 0, Math.PI * 2));
  }
  if (st.kind === 'dave') {
    // green face with a tuft
    shape(ctx, '#7bbf6a', 9, () => beanPath(ctx, hx, hy, 1));
  }
  if (st.kind === 'rick') {
    // mustache
    shape(ctx, '#5a3c22', 7, () => {
      ctx.moveTo(hx - 70, hy + 90); ctx.quadraticCurveTo(hx - 30, hy + 60, hx, hy + 84);
      ctx.quadraticCurveTo(hx + 30, hy + 60, hx + 70, hy + 90);
      ctx.quadraticCurveTo(hx, hy + 110, hx - 70, hy + 90);
      ctx.closePath();
    });
  }
  if (st.kind === 'edna') {
    ink(ctx, 7);
    ctx.strokeStyle = '#3a2a1e';
    ctx.beginPath(); ctx.arc(hx - 52, hy + 40, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx + 52, hy + 40, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 18, hy + 40); ctx.lineTo(hx + 18, hy + 40); ctx.stroke();
  }

  faceOf(ctx, st.expr, hx, hy, s, st.mouth ?? 0, st.blink ?? false);

  // pose props
  if (st.pose === 'knit') {
    // needles held up from the hands; the ball of yarn sits beside the needle tips, a strand runs to the hand
    stick(ctx, [245, 430], [160, 330], '#c8c8c8', 8);
    stick(ctx, [355, 430], [440, 330], '#c8c8c8', 8);
    stick(ctx, [245, 430], [130, 452], '#ff8a3d', 4);
    shape(ctx, '#ff8a3d', 7, () => ctx.arc(110, 452, 46, 0, Math.PI * 2));
  }
  if (st.pose === 'note') {
    // a folded note held in the right hand
    shape(ctx, '#ffffff', 5, () => ctx.rect(412, 560, 50, 62));
    ink(ctx, 3);
    ctx.beginPath();
    ctx.moveTo(420, 580); ctx.lineTo(454, 580);
    ctx.moveTo(420, 600); ctx.lineTo(454, 600);
    ctx.stroke();
  }
  if (st.pose === 'eat') {
    // fork in the right hand
    stick(ctx, [455, 470], [505, 400], '#c0c0c0', 7);
    for (const dx of [-8, 0, 8]) stick(ctx, [505 + dx, 400], [505 + dx, 374], '#c0c0c0', 5);
  }
  if (st.pose === 'fork') {
    stick(ctx, [480, 520], [520, 470], '#c0c0c0', 7);
    shape(ctx, '#d9b08c', 7, () => ctx.ellipse(520, 462, 36, 20, -0.4, 0, Math.PI * 2));
  }
  if (st.pose === 'thumb') {
    dot(ctx, 470, 330, 22, skin);
    shape(ctx, skin, 6, () => ctx.ellipse(486, 300, 10, 18, -0.3, 0, Math.PI * 2));
  }
  if (st.pose === 'slump') {
    ink(ctx, 6);
    ctx.fillStyle = INK;
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Z', 470, 130);
  }
  if (st.expr === 'sleep') {
    ink(ctx, 6);
    ctx.fillStyle = INK;
    ctx.font = 'bold 52px Arial';
    ctx.fillText('Z', 468, 150);
    ctx.font = 'bold 40px Arial';
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

/** Stable cache key for a state (rounded mouth so lip-sync re-draws only a few times). */
export function charKey(st: CharState): string {
  const m = Math.round((st.mouth ?? 0) * 4) / 4;
  return [st.kind, st.pose, st.expr, m, st.variant ?? 0, st.blink ? 1 : 0].join('|');
}
