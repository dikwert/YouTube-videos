import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CharState, charKey, drawChar, Kind, Pose, Expr} from './chars';

/** Module-level texture cache: each canvas texture is painted once per render process. */
const TEX = new Map<string, THREE.Texture>();
function cached(key: string, paint: () => HTMLCanvasElement, repeat?: [number, number]): THREE.Texture {
  const hit = TEX.get(key);
  if (hit) return hit;
  const t = new THREE.CanvasTexture(paint());
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.anisotropy = 4;
  TEX.set(key, t);
  return t;
}

function canvas(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  paint(c.getContext('2d')!);
  return c;
}

const rnd = (seed: number) => {
  let s = seed | 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------- painted textures ----------

const skyTex = () =>
  cached('sky', () =>
    canvas(512, 512, (g) => {
      const grd = g.createLinearGradient(0, 0, 0, 512);
      grd.addColorStop(0, '#3e7fd2');
      grd.addColorStop(0.55, '#8fb9e6');
      grd.addColorStop(1, '#f1e4c6');
      g.fillStyle = grd;
      g.fillRect(0, 0, 512, 512);
    }),
  );

const cloudTex = () =>
  cached('cloud', () =>
    canvas(256, 128, (g) => {
      const r = rnd(7);
      for (let i = 0; i < 14; i++) {
        const x = 40 + r() * 176;
        const y = 50 + r() * 30;
        const rad = 22 + r() * 30;
        const grd = g.createRadialGradient(x, y, 2, x, y, rad);
        grd.addColorStop(0, 'rgba(255,255,255,0.95)');
        grd.addColorStop(0.7, 'rgba(255,255,255,0.8)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.arc(x, y, rad, 0, Math.PI * 2);
        g.fill();
      }
    }),
  );

const carpetTex = () =>
  cached(
    'carpet',
    () =>
      canvas(256, 256, (g) => {
        g.fillStyle = '#7d3c4e';
        g.fillRect(0, 0, 256, 256);
        g.fillStyle = '#c59b58';
        for (let y = 0; y < 256; y += 64)
          for (let x = (y / 64) % 2 === 0 ? 0 : 32; x < 256; x += 64) {
            g.beginPath();
            g.moveTo(x + 32, y + 6);
            g.lineTo(x + 58, y + 32);
            g.lineTo(x + 32, y + 58);
            g.lineTo(x + 6, y + 32);
            g.closePath();
            g.fill();
          }
      }),
    [4, 4],
  );

const seatTex = () =>
  cached(
    'seat',
    () =>
      canvas(128, 128, (g) => {
        g.fillStyle = '#4f6175';
        g.fillRect(0, 0, 128, 128);
        g.strokeStyle = '#6f8398';
        g.lineWidth = 3;
        for (let x = 0; x < 128; x += 16) {
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, 128);
          g.stroke();
        }
      }),
    [1, 1],
  );

export const panelTex = () =>
  cached('panel', () =>
    canvas(1024, 512, (g) => {
      g.fillStyle = '#1b2026';
      g.fillRect(0, 0, 1024, 512);
      const r = rnd(11);
      const dial = (x: number, y: number, rad: number, col: string) => {
        g.fillStyle = '#05080a';
        g.beginPath();
        g.arc(x, y, rad, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = col;
        g.lineWidth = 6;
        g.beginPath();
        g.arc(x, y, rad * 0.86, Math.PI * 1.1, Math.PI * 1.9);
        g.stroke();
        g.lineWidth = 4;
        const a = -2.2 + r() * 2.4;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * rad * 0.7, y + Math.sin(a) * rad * 0.7);
        g.stroke();
      };
      dial(180, 220, 110, '#ffb347');
      dial(420, 220, 110, '#7fe0ff');
      dial(660, 220, 90, '#ffb347');
      for (let i = 0; i < 80; i++) {
        g.fillStyle = ['#ff3b30', '#34d399', '#fbbf24', '#60a5fa'][Math.floor(r() * 4)];
        g.beginPath();
        g.arc(780 + (i % 8) * 26, 80 + Math.floor(i / 8) * 26, 7, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#0a1620';
      g.fillRect(540, 340, 440, 110);
      g.strokeStyle = '#5ee3ff';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(560, 420);
      g.lineTo(640, 380);
      g.lineTo(720, 400);
      g.lineTo(820, 360);
      g.lineTo(960, 376);
      g.stroke();
    }),
  );

const bodyTex = (colour: string, key: string) =>
  cached(key, () =>
    canvas(64, 64, (g) => {
      g.fillStyle = colour;
      g.fillRect(0, 0, 64, 64);
    }),
  );

const roadTex = () =>
  cached(
    'road',
    () =>
      canvas(256, 512, (g) => {
        g.fillStyle = '#3a3d42';
        g.fillRect(0, 0, 256, 512);
        const r = rnd(5);
        for (let i = 0; i < 300; i++) {
          g.fillStyle = r() > 0.5 ? '#44484e' : '#2e3136';
          g.fillRect(r() * 256, r() * 512, 2, 2);
        }
        g.fillStyle = '#f2f2ee';
        for (let y = 0; y < 512; y += 128) g.fillRect(124, y, 8, 64);
        g.fillRect(8, 0, 6, 512);
        g.fillRect(242, 0, 6, 512);
      }),
    [1, 4],
  );

const grassTex = () =>
  cached(
    'grass',
    () =>
      canvas(256, 256, (g) => {
        g.fillStyle = '#5aa04d';
        g.fillRect(0, 0, 256, 256);
        const r = rnd(9);
        for (let i = 0; i < 600; i++) {
          g.fillStyle = r() > 0.5 ? '#6fb55d' : '#4b8c42';
          g.fillRect(r() * 256, r() * 256, 3, 3);
        }
      }),
    [24, 24],
  );

const burgerSignTex = () =>
  cached('burgersign', () =>
    canvas(512, 160, (g) => {
      g.fillStyle = '#e8482f';
      g.fillRect(0, 0, 512, 160);
      g.fillStyle = '#ffd23a';
      g.beginPath();
      g.arc(70, 80, 46, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffffff';
      g.font = 'bold 84px Arial Black, Arial';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('BURGER', 300, 84);
    }),
  );

export const fishTex = () =>
  cached('fish', () =>
    canvas(256, 160, (g) => {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, 256, 160);
      g.fillStyle = '#e7a86b';
      g.beginPath();
      g.ellipse(110, 80, 80, 40, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(180, 80);
      g.lineTo(240, 40);
      g.lineTo(240, 120);
      g.closePath();
      g.fill();
      g.fillStyle = '#241726';
      g.beginPath();
      g.arc(70, 70, 6, 0, Math.PI * 2);
      g.fill();
    }),
  );

export const pastaTex = () =>
  cached('pasta', () =>
    canvas(256, 160, (g) => {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, 256, 160);
      g.fillStyle = '#f3d16a';
      g.beginPath();
      g.ellipse(128, 80, 96, 48, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#d9a93d';
      g.lineWidth = 6;
      for (let i = 0; i < 8; i++) {
        g.beginPath();
        g.arc(128, 80, 12 + i * 9, 0.3 * i, 0.3 * i + 2.6);
        g.stroke();
      }
    }),
  );

const doorTex = (kind: 'bath' | 'cockpit') =>
  cached(`door_${kind}`, () =>
    canvas(256, 512, (g) => {
      g.fillStyle = kind === 'cockpit' ? '#7d8790' : '#9db3c8';
      g.fillRect(0, 0, 256, 512);
      g.strokeStyle = '#4b5561';
      g.lineWidth = 6;
      g.strokeRect(14, 14, 228, 484);
      if (kind === 'cockpit') {
        g.fillStyle = '#2d333a';
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
          g.beginPath();
          g.arc(50 + i * 32, 60 + j * 110, 6, 0, Math.PI * 2);
          g.fill();
        }
        // bullet dents: a dark hole with a pale rim
        for (const [dx, dy] of [[98, 225], [178, 335], [130, 120]]) {
          g.fillStyle = '#c3cbd3';
          g.beginPath();
          g.arc(dx, dy, 15, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#1b1f24';
          g.beginPath();
          g.arc(dx, dy, 8, 0, Math.PI * 2);
          g.fill();
        }
      } else {
        g.fillStyle = '#0c0d0f';
        g.fillRect(96, 260, 64, 10);
      }
    }),
  );

// ---------- characters ----------

/** A flat bean-head character facing the camera. `feet` is the ground point under the figure. */
export const Person: React.FC<{st: CharState; feet: [number, number, number]; height: number; ry?: number}> = ({st, feet, height, ry = 0}) => {
  const key = charKey(st);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(drawChar(st));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const w = height * (600 / 900);
  return (
    <mesh position={[feet[0], feet[1] + height / 2, feet[2]]} rotation={[0, ry, 0]}>
      <planeGeometry args={[w, height]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.35} toneMapped={false} />
    </mesh>
  );
};

// ---------- props ----------

export const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; r?: number}> = ({p, s, c, r = 0}) => (
  <mesh position={p} rotation={[0, r, 0]}>
    <boxGeometry args={s} />
    <meshLambertMaterial color={c} />
  </mesh>
);

export const Cyl: React.FC<{p: [number, number, number]; r: number; h: number; c: string; rot?: [number, number, number]; seg?: number}> = ({p, r, h, c, rot = [0, 0, 0], seg = 20}) => (
  <mesh position={p} rotation={rot}>
    <cylinderGeometry args={[r, r, h, seg]} />
    <meshLambertMaterial color={c} />
  </mesh>
);

export const Sphere: React.FC<{p: [number, number, number]; r: number; c: string}> = ({p, r, c}) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 20, 14]} />
    <meshLambertMaterial color={c} />
  </mesh>
);

/** A flat picture plane with a texture (unlit), e.g. a window, a sign or a screen. */
export const Pic: React.FC<{p: [number, number, number]; s: [number, number]; tex: THREE.Texture; ry?: number; rx?: number; cut?: boolean}> = ({p, s, tex, ry = 0, rx = 0, cut = false}) => (
  <mesh position={p} rotation={[rx, ry, 0]}>
    <planeGeometry args={s} />
    <meshBasicMaterial map={tex} toneMapped={false} transparent={cut} alphaTest={cut ? 0.1 : 0} />
  </mesh>
);

// ---------- sky ----------

export const SkyDome: React.FC = () => (
  <mesh>
    <sphereGeometry args={[420, 32, 20]} />
    <meshBasicMaterial map={skyTex()} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
  </mesh>
);

export const SunDisc: React.FC<{p: [number, number, number]}> = ({p}) => (
  <mesh position={p}>
    <sphereGeometry args={[9, 24, 16]} />
    <meshBasicMaterial color="#fff3c4" toneMapped={false} />
  </mesh>
);

export const Clouds: React.FC<{seed: number; n: number; span: number; y: [number, number]; near?: boolean}> = ({seed, n, span, y, near = false}) => {
  const r = rnd(seed);
  const items = Array.from({length: n}, () => ({
    x: (r() - 0.5) * span * 2,
    y: y[0] + r() * (y[1] - y[0]),
    z: near ? -14 - r() * 70 : -40 - r() * 260,
    w: near ? 10 + r() * 16 : 60 + r() * 90,
  }));
  return (
    <>
      {items.map((c, i) => (
        <Pic key={i} p={[c.x, c.y, c.z]} s={[c.w, c.w * 0.5]} tex={cloudTex()} cut />
      ))}
    </>
  );
};

// ---------- aircraft (exterior) ----------

/** A SKYPAL airliner, nose towards +z. Built from a fuselage, a blue livery band, wings, tail and two engines. */
export const Airliner: React.FC<{p: [number, number, number]; s?: number; ry?: number}> = ({p, s = 1, ry = 0}) => (
  <group position={p} scale={s} rotation={[0, ry, 0]}>
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[2.2, 2.2, 18, 28]} />
      <meshBasicMaterial color="#f4f4f1" toneMapped={false} />
    </mesh>
    {/* nose and tail cones */}
    <mesh position={[0, 0, 10.3]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[2.2, 2.6, 28]} />
      <meshBasicMaterial color="#f4f4f1" toneMapped={false} />
    </mesh>
    <mesh position={[0, 0, -10.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <coneGeometry args={[2.2, 2.4, 28]} />
      <meshBasicMaterial color="#f4f4f1" toneMapped={false} />
    </mesh>
    {/* blue livery stripe along each side, cabin windows above it */}
    {[-1, 1].map((side) => (
      <React.Fragment key={side}>
        <Box p={[side * 2.23, 0.2, 0]} s={[0.05, 0.5, 17]} c="#2c6bd6" />
        {Array.from({length: 9}, (_, i) => (
          <Box key={i} p={[side * 2.23, 0.75, -6 + i * 1.5]} s={[0.05, 0.36, 0.55]} c="#1d2a3a" />
        ))}
      </React.Fragment>
    ))}
    {/* wings, tail fin and tailplane */}
    <Box p={[0, -0.7, -1.5]} s={[13, 0.25, 3.6]} c="#e7e7e3" />
    <Box p={[0, 0.9, -8]} s={[0.25, 3.6, 2.2]} c="#2c6bd6" />
    <Box p={[0, 0.2, -7.4]} s={[6, 0.15, 1.6]} c="#e7e7e3" />
    {/* engines under the wings */}
    <Cyl p={[-3.4, -1.7, 1.2]} r={0.8} h={2.2} c="#2a2f36" rot={[Math.PI / 2, 0, 0]} seg={18} />
    <Cyl p={[3.4, -1.7, 1.2]} r={0.8} h={2.2} c="#2a2f36" rot={[Math.PI / 2, 0, 0]} seg={18} />
    {/* landing gear: two main wheels under the wings, a nose wheel */}
    {[-1.8, 1.8].map((x) => (
      <Cyl key={x} p={[x, -2.0, -1.5]} r={0.5} h={0.4} c="#1d1f24" rot={[0, 0, Math.PI / 2]} seg={16} />
    ))}
    <Cyl p={[0, -2.0, 7]} r={0.5} h={0.4} c="#1d1f24" rot={[0, 0, Math.PI / 2]} seg={16} />
  </group>
);

// ---------- cabin set ----------

const SEAT_X = [-2.4, -1.5, -0.7, 0.7, 1.5, 2.4];
export const ROW_Z = (r: number) => -3.2 - r * 1.25;

export const CabinSet: React.FC<{passengers?: boolean; bathroomOpen?: boolean}> = ({passengers = true, bathroomOpen = false}) => (
  <group>
    <mesh position={[0, -0.02, -12]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, 40]} />
      <meshLambertMaterial map={carpetTex()} />
    </mesh>
    <mesh position={[0, 2.8, -12]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, 40]} />
      <meshBasicMaterial color="#efe8da" toneMapped={false} />
    </mesh>
    {/* end wall of the cabin, so no sky shows past the last row */}
    <mesh position={[0, 1.4, -32.4]}>
      <planeGeometry args={[7, 2.8]} />
      <meshBasicMaterial color="#e6dccb" toneMapped={false} />
    </mesh>
    {[-1, 1].map((side) => (
      <group key={side}>
        <mesh position={[side * 3.5, 1.4, -12]} rotation={[0, -Math.PI / 2 * side, 0]}>
          <planeGeometry args={[40, 2.8]} />
          <meshLambertMaterial color="#e6dccb" />
        </mesh>
        {Array.from({length: 9}, (_, i) => (
          <Pic key={i} p={[side * 3.48, 1.35, -2.5 - i * 3.2]} s={[1.1, 0.8]} tex={skyTex()} ry={-Math.PI / 2 * side} />
        ))}
        <Box p={[side * 2.9, 2.35, -12]} s={[0.9, 0.7, 40]} c="#d7c7a6" />
      </group>
    ))}
    {Array.from({length: bathroomOpen ? 14 : 17}, (_, r) =>
      SEAT_X.map((x) => (
        <group key={`${r}-${x}`}>
          <Box p={[x, 0.36, ROW_Z(r)]} s={[0.55, 0.12, 0.6]} c="#4f6175" />
          <Box p={[x, 0.72, ROW_Z(r) - 0.28]} s={[0.55, 0.62, 0.12]} c="#4f6175" />
        </group>
      )),
    )}
    {passengers && <Passengers />}
    {bathroomOpen ? (
      <>
        {/* the doorway is open: a lit bathroom with a toilet, the door panel swung back against the wall */}
        <mesh position={[0, 1.05, -22.4]}>
          <planeGeometry args={[1.1, 2.1]} />
          <meshBasicMaterial color="#ffe9b0" toneMapped={false} />
        </mesh>
        <Box p={[0, 0.42, -21.9]} s={[0.45, 0.4, 0.55]} c="#f4f4f1" />
        <Box p={[0, 0.86, -22.1]} s={[0.45, 0.5, 0.2]} c="#f4f4f1" />
        <Box p={[-0.55, 1.05, -21.75]} s={[0.05, 2.1, 1.1]} c="#9db3c8" />
      </>
    ) : (
      <mesh position={[0, 1.05, -21.2]}>
        <planeGeometry args={[1.1, 2.1]} />
        <meshBasicMaterial map={doorTex('bath')} toneMapped={false} />
      </mesh>
    )}
    {Array.from({length: 6}, (_, i) => (
      <Box key={i} p={[-0.6, 2.1, -4 - i * 2.5]} s={[0.12, 0.08, 0.12]} c="#fff6d8" />
    ))}
  </group>
);

const Passengers: React.FC = () => (
  <>
    {/* rows 3 and 5 are left empty so close-ups of Kevin in row 2 stay clear */}
    <Person st={{kind: 'pax', pose: 'sit', expr: 'bored', variant: 1}} feet={[-1.5, 0, ROW_Z(2) + 0.2]} height={1.3} />
    <Person st={{kind: 'pax', pose: 'sit', expr: 'neutral', variant: 2}} feet={[1.5, 0, ROW_Z(2) + 0.2]} height={1.3} />
    <Person st={{kind: 'pax', pose: 'sit', expr: 'grin', variant: 3}} feet={[-2.4, 0, ROW_Z(4) + 0.2]} height={1.3} />
    <Person st={{kind: 'pax', pose: 'sit', expr: 'shock', variant: 0}} feet={[2.4, 0, ROW_Z(4) + 0.2]} height={1.3} />
    <Person st={{kind: 'pax', pose: 'sit', expr: 'sleep', variant: 4}} feet={[-1.5, 0, ROW_Z(6) + 0.2]} height={1.3} />
    <Person st={{kind: 'pax', pose: 'sit', expr: 'angry', variant: 2}} feet={[1.5, 0, ROW_Z(6) + 0.2]} height={1.3} />
    <Person st={{kind: 'edna', pose: 'sit', expr: 'bored', variant: 0}} feet={[-2.4, 0, ROW_Z(8) + 0.2]} height={1.3} />
    <Person st={{kind: 'pax', pose: 'sit', expr: 'neutral', variant: 1}} feet={[2.4, 0, ROW_Z(8) + 0.2]} height={1.3} />
    <Person st={{kind: 'tommy', pose: 'sit', expr: 'shock', variant: 0}} feet={[-1.5, 0, ROW_Z(8) + 0.2]} height={1.1} />
    <Person st={{kind: 'pax', pose: 'sit', expr: 'smug', variant: 3}} feet={[1.5, 0, ROW_Z(8) + 0.2]} height={1.3} />
  </>
);

// ---------- cockpit set ----------

type Crew = {pose: Pose; expr: Expr; mouth: number};

/** The cockpit: the captain's seat (Kevin or Rick, when present), the co-pilot Dave, and optional lap trays. */
export const CockpitSet: React.FC<{dave?: 'slump' | 'upright' | 'eat'; kevin?: Crew; rick?: Crew; trays?: {fish?: boolean; pasta?: boolean}}> = ({dave = 'slump', kevin, rick, trays}) => (
  <group>
    <mesh position={[0, 0, -4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, 18]} />
      <meshLambertMaterial color="#2a2f36" />
    </mesh>
    {/* crew seats: a cushion and a backrest for each pilot */}
    {[0, -1.15].map((x) => (
      <group key={x}>
        <Box p={[x, 0.46, -0.85]} s={[0.55, 0.14, 0.55]} c="#3a4656" />
        <Box p={[x, 1.05, -1.12]} s={[0.55, 1.2, 0.12]} c="#3a4656" />
      </group>
    ))}
    <mesh position={[0, 1.42, -1.6]}>
      <planeGeometry args={[3.2, 1.1]} />
      <meshBasicMaterial map={panelTex()} toneMapped={false} />
    </mesh>
    <Box p={[0, 0.55, -1.7]} s={[3.6, 0.9, 0.5]} c="#27303a" />
    <Box p={[0, 2.0, -1.7]} s={[3.6, 0.25, 0.5]} c="#1d2329" />
    <Box p={[-1.9, 1.2, -1.2]} s={[0.25, 1.8, 0.4]} c="#1d2329" />
    <Box p={[1.9, 1.2, -1.2]} s={[0.25, 1.8, 0.4]} c="#1d2329" />
    <Box p={[0, 1.35, -2.1]} s={[0.1, 0.6, 0.1]} c="#515b66" />
    {[-1.48, -0.82, -0.33, 0.33].map((x) => (
      <group key={x} position={[x, 1.1, -1.0]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.32, 0.035, 10, 28]} />
          <meshLambertMaterial color="#1d1f24" />
        </mesh>
        <Box p={[0, 0, 0]} s={[0.07, 0.6, 0.07]} c="#1d1f24" />
      </group>
    ))}
    <Pic p={[0, 1.8, -20]} s={[120, 60]} tex={skyTex()} />
    {kevin && <Person st={{kind: 'kevin', pose: kevin.pose, expr: kevin.expr, mouth: kevin.mouth, variant: 0}} feet={[0.0, 0, -0.4]} height={1.7} />}
    {rick && <Person st={{kind: 'rick', pose: rick.pose, expr: rick.expr, mouth: rick.mouth, variant: 0}} feet={[0.0, 0, -0.4]} height={1.7} />}
    <Person st={{kind: 'dave', pose: dave === 'slump' ? 'slump' : dave === 'eat' ? 'eat' : 'sit', expr: dave === 'slump' ? 'sleep' : dave === 'eat' ? 'grin' : 'bored', variant: 1}} feet={[-1.15, 0, -0.4]} height={1.7} />
    {trays?.fish && <Pic p={[-1.15, 0.62, -0.1]} s={[0.46, 0.28]} tex={fishTex()} rx={-Math.PI / 2} />}
    {trays?.pasta && <Pic p={[0.0, 0.62, -0.1]} s={[0.44, 0.27]} tex={pastaTex()} rx={-Math.PI / 2} />}
  </group>
);

// ---------- highway and drive-thru ----------

export const HighwaySet: React.FC<{airliner?: [number, number, number]; airRy?: number; airS?: number}> = ({airliner, airRy = 0, airS = 1.1}) => (
  <group>
    <mesh position={[0, -0.02, -60]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[600, 600]} />
      <meshLambertMaterial map={grassTex()} />
    </mesh>
    <mesh position={[0, 0.0, -60]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[14, 600]} />
      <meshLambertMaterial map={roadTex()} />
    </mesh>
    {Array.from({length: 26}, (_, i) => {
      const z = 20 - i * 14;
      return (
        <group key={i}>
          <Sphere p={[-10.5 - (i % 3), 1.2, z]} r={1.6 + (i % 2) * 0.4} c={i % 2 ? '#3f7d3a' : '#4f9446'} />
          {/* no bushes between the road and the drive-thru window */}
          {z - 4 > -22 && z - 4 < 0 ? null : <Sphere p={[10 + (i % 4), 1.1, z - 4]} r={1.4 + (i % 3) * 0.3} c={i % 2 ? '#3f7d3a' : '#4f9446'} />}
          <Cyl p={[-8.5, 3.5, z]} r={0.12} h={7} c="#8b8f96" />
        </group>
      );
    })}
    <Box p={[-8.2, 6.6, -30]} s={[4.8, 1.2, 0.2]} c="#2c6bd6" />
    <Pic p={[-8.2, 6.6, -29.85]} s={[4.6, 1.0]} tex={burgerSignTex()} />
    {/* burger shop with drive-thru */}
    {/* a hollow box, open on the road side at the drive-thru window */}
    <Box p={[22.95, 3, -10]} s={[0.1, 6, 8]} c="#e7dcc4" />
    <Box p={[18, 3, -14.05]} s={[10, 6, 0.1]} c="#e7dcc4" />
    <Box p={[18, 3, -5.95]} s={[10, 6, 0.1]} c="#e7dcc4" />
    <Box p={[13.05, 3, -12.6]} s={[0.1, 6, 2.8]} c="#e7dcc4" />
    <Box p={[13.05, 3, -7.4]} s={[0.1, 6, 2.8]} c="#e7dcc4" />
    <Box p={[13.05, 4.5, -10]} s={[0.1, 3, 2.4]} c="#e7dcc4" />
    <Box p={[13.05, 0.7, -10]} s={[0.1, 1.4, 2.4]} c="#e7dcc4" />
    <Box p={[18, 6.4, -10]} s={[10.4, 0.6, 8.4]} c="#b8553f" />
    <Pic p={[18, 4.8, -5.85]} s={[6, 1.9]} tex={burgerSignTex()} />
    {/* the lit kitchen behind the drive-thru window */}
    <mesh position={[13.9, 2.2, -10]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[8, 6]} />
      <meshBasicMaterial color="#ffe9a8" toneMapped={false} />
    </mesh>
    <Box p={[9.2, 1.15, -10]} s={[0.32, 0.5, 0.26]} c="#3a3f47" />
    <mesh position={[9.02, 1.2, -10]} rotation={[0, Math.PI / 2, 0]}>
      <circleGeometry args={[0.13, 20]} />
      <meshBasicMaterial color="#ffb347" toneMapped={false} />
    </mesh>
    <Cyl p={[9.2, 0.55, -10]} r={0.06} h={1.1} c="#6b6f76" />
    {airliner && <Airliner p={airliner} s={airS} ry={airRy} />}
  </group>
);

// ---------- cockpit door (close-up) ----------

/** The reinforced cockpit door in its bulkhead, with a keypad beside it. */
export const CockpitDoor: React.FC = () => (
  <group>
    {/* the bulkhead ceiling, so no sky shows above the wall */}
    <mesh position={[0, 3.0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, 8]} />
      <meshBasicMaterial color="#efe8da" toneMapped={false} />
    </mesh>
    <mesh position={[0, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, 8]} />
      <meshLambertMaterial color="#2a2f36" />
    </mesh>
    <mesh position={[0, 1.2, -1.46]}>
      <planeGeometry args={[4.2, 3.2]} />
      <meshLambertMaterial color="#c9b79a" />
    </mesh>
    <mesh position={[0, 1.05, -1.4]}>
      <planeGeometry args={[1.5, 2.2]} />
      <meshBasicMaterial map={doorTex('cockpit')} toneMapped={false} />
    </mesh>
    <Box p={[1.05, 1.25, -1.38]} s={[0.24, 0.36, 0.04]} c="#1d2329" />
    <Sphere p={[1.05, 1.42, -1.34]} r={0.03} c="#34d399" />
  </group>
);

export const Prop = {Box, Cyl, Sphere, Pic, fishTex, bodyTex};
export type {Kind, Pose, Expr};
