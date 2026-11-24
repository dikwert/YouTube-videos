import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CharState, charKey, drawCat, drawChar} from './chars';

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

const skyDayTex = () =>
  cached('skyday', () => canvas(16, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#3e7fd2');
    grd.addColorStop(0.55, '#9ac4ec');
    grd.addColorStop(1, '#e9f3fb');
    g.fillStyle = grd;
    g.fillRect(0, 0, 16, 512);
  }));

const skyDawnTex = () =>
  cached('skydawn', () => canvas(16, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#2c3e6e');
    grd.addColorStop(0.5, '#e28a5a');
    grd.addColorStop(0.62, '#ffd08a');
    grd.addColorStop(1, '#6b4a4a');
    g.fillStyle = grd;
    g.fillRect(0, 0, 16, 512);
  }));

const spaceTex = () =>
  cached('space', () => canvas(1024, 512, (g) => {
    g.fillStyle = '#05060f';
    g.fillRect(0, 0, 1024, 512);
    const r = rnd(42);
    for (let i = 0; i < 700; i++) {
      const v = r();
      g.fillStyle = v > 0.9 ? '#ffffff' : '#9fb4d8';
      g.globalAlpha = 0.4 + r() * 0.6;
      g.fillRect(r() * 1024, r() * 512, v > 0.95 ? 2.4 : 1.4, v > 0.95 ? 2.4 : 1.4);
    }
    g.globalAlpha = 1;
  }));

/** Equirectangular Earth: ocean, land blobs, polar caps. */
const earthTex = () =>
  cached('earth', () => canvas(1024, 512, (g) => {
    g.fillStyle = '#1f5fa8';
    g.fillRect(0, 0, 1024, 512);
    const r = rnd(7);
    for (let i = 0; i < 46; i++) {
      const x = r() * 1024;
      const y = 60 + r() * 392;
      const rad = 30 + r() * 90;
      g.fillStyle = r() > 0.4 ? '#4e9a47' : '#a88a4e';
      g.beginPath();
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2;
        const rr = rad * (0.6 + r() * 0.6);
        const px = x + Math.cos(a) * rr * 1.6;
        const py = y + Math.sin(a) * rr * 0.9;
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.closePath();
      g.fill();
    }
    g.fillStyle = '#eef6fb';
    g.fillRect(0, 0, 1024, 26);
    g.fillRect(0, 486, 1024, 26);
  }));

/** Night-side city lights, used as an emissive map on the Earth. */
const cityTex = () =>
  cached('city', () => canvas(1024, 512, (g) => {
    g.fillStyle = '#000000';
    g.fillRect(0, 0, 1024, 512);
    const r = rnd(9);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() > 0.5 ? '#ffd27a' : '#ffb347';
      g.globalAlpha = 0.5 + r() * 0.5;
      g.fillRect(r() * 1024, 80 + r() * 350, 2, 2);
    }
    g.globalAlpha = 1;
  }));

const cloudTex = () =>
  cached('clouds', () => canvas(1024, 512, (g) => {
    g.clearRect(0, 0, 1024, 512);
    const r = rnd(21);
    for (let i = 0; i < 140; i++) {
      const x = r() * 1024;
      const y = r() * 512;
      const rad = 18 + r() * 46;
      const grd = g.createRadialGradient(x, y, 2, x, y, rad);
      grd.addColorStop(0, 'rgba(255,255,255,0.9)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
    }
  }));

const puffTex = () =>
  cached('puff', () => canvas(128, 128, (g) => {
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grd.addColorStop(0, 'rgba(255,255,255,0.95)');
    grd.addColorStop(0.7, 'rgba(240,240,240,0.7)');
    grd.addColorStop(1, 'rgba(240,240,240,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }));

const flameTex = () =>
  cached('flame', () => canvas(64, 128, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, 'rgba(255,255,210,1)');
    grd.addColorStop(0.4, 'rgba(255,170,60,0.95)');
    grd.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(32, 0); g.lineTo(60, 128); g.lineTo(4, 128); g.closePath();
    g.fill();
  }));

const concreteTex = () =>
  cached('concrete', () => canvas(256, 256, (g) => {
    g.fillStyle = '#8f9196';
    g.fillRect(0, 0, 256, 256);
    const r = rnd(3);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = r() > 0.5 ? '#9b9da2' : '#82858a';
      g.fillRect(r() * 256, r() * 256, 2, 2);
    }
    g.strokeStyle = '#6f7277';
    g.lineWidth = 3;
    g.strokeRect(0, 0, 256, 256);
  }), [3, 3]);

const asphaltTex = () =>
  cached('asphalt', () => canvas(256, 256, (g) => {
    g.fillStyle = '#3a3d42';
    g.fillRect(0, 0, 256, 256);
    const r = rnd(5);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = r() > 0.5 ? '#44484e' : '#2e3136';
      g.fillRect(r() * 256, r() * 256, 2, 2);
    }
  }), [6, 6]);

const floorTex = () =>
  cached('floor', () => canvas(256, 256, (g) => {
    g.fillStyle = '#c9c4b5';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#a9a496';
    g.lineWidth = 4;
    g.strokeRect(0, 0, 256, 256);
  }), [4, 4]);

const signTex = (text: string, bg: string, fg: string) =>
  cached(`sign_${text}`, () => canvas(512, 160, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, 512, 160);
    g.strokeStyle = fg;
    g.lineWidth = 10;
    g.strokeRect(12, 12, 488, 136);
    g.fillStyle = fg;
    g.font = 'bold 60px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, 84);
  }));

/** The control-room wall screen: an orbit around the Earth. */
const monitorTex = () =>
  cached('monitor', () => canvas(1024, 512, (g) => {
    g.fillStyle = '#06101c';
    g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = '#5ee3ff';
    g.lineWidth = 6;
    g.beginPath();
    g.ellipse(512, 256, 380, 150, -0.2, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#2c6bd6';
    g.beginPath();
    g.arc(512, 256, 90, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(600, 170, 14, 0, Math.PI * 2);
    g.fill();
    const r = rnd(13);
    g.fillStyle = '#34d399';
    for (let i = 0; i < 40; i++) g.fillRect(40 + r() * 940, 40 + r() * 420, 4, 4);
  }));

/** A capsule panel with a countdown digit. */
const countdownTex = (digit: string) =>
  cached(`count_${digit}`, () => canvas(512, 256, (g) => {
    g.fillStyle = '#0b1a14';
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#34ff9a';
    g.font = 'bold 200px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(digit, 256, 140);
  }));

/** The height marker on the station wall: ticks every foot, a 6 FT line. */
const heightTex = () =>
  cached('height', () => canvas(256, 512, (g) => {
    g.fillStyle = '#e9e1d2';
    g.fillRect(0, 0, 256, 512);
    g.strokeStyle = '#3a4656';
    g.lineWidth = 4;
    // one foot is 0.305 m; the wall is 2.1 m tall, so a foot is 74.4 px of the 512 px texture
    for (let f = 0; f <= 7; f++) {
      const y = 512 - f * 74.4;
      g.beginPath();
      g.moveTo(20, y); g.lineTo(f % 1 === 0 ? 120 : 60, y);
      g.stroke();
      g.fillStyle = '#3a4656';
      g.font = 'bold 26px Arial';
      g.textBaseline = 'middle';
      g.fillText(`${f} FT`, 130, y);
    }
    g.strokeStyle = '#e8483a';
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(0, 512 - 6 * 74.4); g.lineTo(256, 512 - 6 * 74.4);
    g.stroke();
  }));

// ---------- characters and sprites ----------

/** A flat bean-head character facing the camera. `feet` is the ground point under the figure. */
export const Person: React.FC<{st: CharState; feet: [number, number, number]; height: number; ry?: number; roll?: number}> = ({st, feet, height, ry = 0, roll = 0}) => {
  const key = charKey(st);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(drawChar(st));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const w = height * (600 / 900);
  return (
    <mesh position={[feet[0], feet[1] + height / 2, feet[2]]} rotation={[0, ry, roll]}>
      <planeGeometry args={[w, height]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.35} toneMapped={false} />
    </mesh>
  );
};

/** The cat, as a billboard. `feet` is the point under its paws. */
export const Cat: React.FC<{expr: 'judge' | 'smug' | 'sleepy' | 'turn'; feet: [number, number, number]; size: number; roll?: number}> = ({expr, feet, size, roll = 0}) => {
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(drawCat(expr));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr]);
  return (
    <mesh position={[feet[0], feet[1] + size / 2, feet[2]]} rotation={[0, 0, roll]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.35} toneMapped={false} />
    </mesh>
  );
};

/** A floating "Z" for the nap: a light letter with a plum outline. The shot moves it up and fades it. */
export const ZLetter: React.FC<{p: [number, number, number]; s: number; opacity?: number}> = ({p, s, opacity = 1}) => {
  const tex = cached('letter-z', () => canvas(128, 128, (g) => {
    g.font = 'bold 96px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineWidth = 14;
    g.strokeStyle = '#241726';
    g.fillStyle = '#eaf4ff';
    g.strokeText('Z', 64, 66);
    g.fillText('Z', 64, 66);
  }));
  return (
    <mesh position={p}>
      <planeGeometry args={[s, s]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.05} depthWrite={false} toneMapped={false} opacity={opacity} />
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

/** A flat picture plane with a texture (unlit): a sign, a screen, a puff of smoke. */
export const Pic: React.FC<{p: [number, number, number]; s: [number, number]; tex: THREE.Texture; ry?: number; rx?: number; cut?: boolean; opacity?: number}> = ({p, s, tex, ry = 0, rx = 0, cut = false, opacity = 1}) => (
  <mesh position={p} rotation={[rx, ry, 0]}>
    <planeGeometry args={s} />
    <meshBasicMaterial map={tex} toneMapped={false} transparent={cut || opacity < 1} opacity={opacity} alphaTest={cut ? 0.05 : 0} depthWrite={!cut} />
  </mesh>
);

/** A wall, floor or ceiling as a double-sided plane, so it shows from inside a room too. */
export const Wall: React.FC<{p: [number, number, number]; s: [number, number]; rot?: [number, number, number]; c: string}> = ({p, s, rot = [0, 0, 0], c}) => (
  <mesh position={p} rotation={rot}>
    <planeGeometry args={s} />
    <meshLambertMaterial color={c} side={THREE.DoubleSide} />
  </mesh>
);

/** A plum outline around a box: a slightly larger back-face shell. */
export const Outline: React.FC<{p: [number, number, number]; s: [number, number, number]; r?: number; grow?: number}> = ({p, s, r = 0, grow = 0.05}) => (
  <mesh position={p} rotation={[0, r, 0]}>
    <boxGeometry args={[s[0] + grow, s[1] + grow, s[2] + grow]} />
    <meshBasicMaterial color="#241726" side={THREE.BackSide} toneMapped={false} />
  </mesh>
);

// ---------- sky and space ----------

/** A sky dome: a gradient (day or dawn) on the inside of a big sphere. */
export const SkyDome: React.FC<{dawn?: boolean}> = ({dawn = false}) => (
  <mesh>
    <sphereGeometry args={[420, 32, 20]} />
    <meshBasicMaterial map={dawn ? skyDawnTex() : skyDayTex()} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
  </mesh>
);

/** Space: stars on the inside of a big sphere. */
export const SpaceDome: React.FC = () => (
  <mesh>
    <sphereGeometry args={[420, 32, 20]} />
    <meshBasicMaterial map={spaceTex()} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
  </mesh>
);

/** The Earth: lit by the sun, with city lights on the night side, a cloud layer and an atmosphere glow. */
export const Earth: React.FC<{p: [number, number, number]; r: number}> = ({p, r}) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 64, 40]} />
      <meshStandardMaterial map={earthTex()} emissiveMap={cityTex()} emissive={new THREE.Color('#ffffff')} emissiveIntensity={0.8} roughness={0.9} metalness={0} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 1.012, 48, 32]} />
      <meshBasicMaterial map={cloudTex()} transparent depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 1.06, 48, 32]} />
      <meshBasicMaterial color="#78b8ff" side={THREE.BackSide} transparent opacity={0.35} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>
);

// ---------- capsule and rocket ----------

/** The capsule: a cylinder body and a cone heat shield, both white with a grey band. */
export const Capsule: React.FC<{p: [number, number, number]; s?: number; ry?: number}> = ({p, s = 1, ry = 0}) => (
  <group position={p} scale={s} rotation={[0, ry, 0]}>
    <Cyl p={[0, 0, 0]} r={1.0} h={1.6} c="#e9e9e6" seg={28} />
    <mesh position={[0, 1.0, 0]}>
      <coneGeometry args={[1.0, 1.0, 28]} />
      <meshLambertMaterial color="#d9d9d4" />
    </mesh>
    <mesh position={[0, -1.0, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[1.0, 0.6, 28]} />
      <meshLambertMaterial color="#8a8f98" />
    </mesh>
    <Cyl p={[0, 0.2, 0.98]} r={0.22} h={0.06} c="#3a4656" rot={[Math.PI / 2, 0, 0]} seg={18} />
  </group>
);

/** The cargo rocket: a white body with a grey band, fins, an engine bell and an optional flame. */
export const Rocket: React.FC<{p: [number, number, number]; flame?: number; s?: number}> = ({p, flame = 0, s = 1}) => (
  <group position={p} scale={s}>
    <Cyl p={[0, 0, 0]} r={0.9} h={8} c="#f2f2ee" seg={28} />
    <Cyl p={[0, 1.2, 0]} r={0.92} h={0.6} c="#d63b3b" seg={28} />
    <mesh position={[0, 4.6, 0]}>
      <sphereGeometry args={[0.9, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshLambertMaterial color="#f2f2ee" />
    </mesh>
    {[0, 1, 2].map((i) => (
      <Box key={i} p={[Math.cos((i * 2 * Math.PI) / 3) * 0.95, -3.2, Math.sin((i * 2 * Math.PI) / 3) * 0.95]} s={[0.16, 2.2, 1.0]} c="#d63b3b" r={(i * 2 * Math.PI) / 3} />
    ))}
    <Cyl p={[0, -4.6, 0]} r={0.55} h={0.8} c="#3a3f47" seg={18} />
    {flame > 0 && (
      <Pic p={[0, -6.2 - flame * 1.2, 0]} s={[1.8 + flame * 0.4, 3.2 + flame * 3]} tex={flameTex()} cut opacity={0.95} />
    )}
  </group>
);

/** Smoke puffs that grow over time (k in 0..1). */
export const Smoke: React.FC<{p: [number, number, number]; k: number}> = ({p, k}) => (
  <group position={p}>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      const d = 1 + k * 4;
      return <Pic key={i} p={[Math.cos(a) * d * 0.8, 0.4 + i * 0.4 * k, Math.sin(a) * d * 0.5]} s={[3 + k * 6, 3 + k * 6]} tex={puffTex()} cut opacity={0.85} />;
    })}
  </group>
);

// ---------- sets ----------

/** The hangar at night: a capsule on a stand, a cart with a mop and bucket, cables, floodlights, signs, a puddle. */
export const HangarSet: React.FC = () => (
  <group>
    <mesh position={[0, -0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 40]} />
      <meshLambertMaterial map={concreteTex()} />
    </mesh>
    <mesh position={[0, 8, -10]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 40]} />
      <meshLambertMaterial color="#2a2f3a" />
    </mesh>
    <mesh position={[-9, 4, -10]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[40, 8]} />
      <meshLambertMaterial color="#4a5260" />
    </mesh>
    <mesh position={[9, 4, -10]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[40, 8]} />
      <meshLambertMaterial color="#4a5260" />
    </mesh>
    <mesh position={[0, 4, -30]}>
      <planeGeometry args={[24, 8]} />
      <meshLambertMaterial color="#4a5260" />
    </mesh>
    {/* the capsule on its stand */}
    <Box p={[0, 0.6, -6]} s={[2.4, 1.2, 2.4]} c="#6b7380" />
    <Box p={[0, 2.5, -6]} s={[0.4, 2.2, 0.4]} c="#8a8f98" />
    <Capsule p={[0, 3.6, -6]} s={0.95} />
    {/* cables */}
    {[-3, 3].map((x) => (
      <Cyl key={x} p={[x, 4.2, -8]} r={0.05} h={8.4} c="#1d1f24" seg={6} />
    ))}
    {/* floodlights */}
    {[-6, 6].map((x) => (
      <React.Fragment key={x}>
        <Cyl p={[x, 6.4, -12]} r={0.1} h={3.2} c="#3a4656" seg={8} />
        <Box p={[x, 8, -12]} s={[1.6, 0.4, 0.5]} c="#fff6d8" />
      </React.Fragment>
    ))}
    {/* signs */}
    <Pic p={[-8.9, 2.2, -10]} s={[3.2, 1.0]} tex={signTex('AUTHORIZED ONLY', '#e8c12a', '#1d1f24')} ry={Math.PI / 2} />
    <Pic p={[0, 2.4, -29.9]} s={[3.6, 1.1]} tex={signTex('AUTHORIZED ONLY', '#e8c12a', '#1d1f24')} />
    {/* the cart with a bucket and a mop */}
    <Box p={[3.4, 0.7, -3.4]} s={[1.6, 0.9, 1.0]} c="#c5ccd6" />
    <Cyl p={[3.6, 0.4, -2.8]} r={0.42} h={0.7} c="#3b7ed6" seg={18} />
    <Cyl p={[3.6, 1.4, -3.4]} r={0.04} h={2.4} c="#8a6a4a" seg={6} rot={[0.2, 0, 0.12]} />
    {/* a puddle */}
    <mesh position={[-2.6, 0.01, -2.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.9, 24]} />
      <meshLambertMaterial color="#2a3646" />
    </mesh>
  </group>
);

/** Inside the capsule: the seat, the panel with the countdown screen, and a window onto space and Earth. */
export const CapsuleInterior: React.FC<{digit?: string; window?: boolean; panel?: boolean}> = ({digit = '', window = true, panel = true}) => (
  <group>
    {/* floor, ceiling, side walls and the back wall */}
    <Wall p={[0, 0, -1]} s={[3.6, 6]} rot={[-Math.PI / 2, 0, 0]} c="#7b8496" />
    <Wall p={[0, 2.5, -1]} s={[3.6, 6]} rot={[Math.PI / 2, 0, 0]} c="#5b6270" />
    <Wall p={[-1.8, 1.25, -1]} s={[6, 2.5]} rot={[0, Math.PI / 2, 0]} c="#6b7380" />
    <Wall p={[1.8, 1.25, -1]} s={[6, 2.5]} rot={[0, -Math.PI / 2, 0]} c="#6b7380" />
    <Wall p={[0, 1.25, -4]} s={[3.6, 2.5]} c="#6b7380" />
    {/* the front wall, with a window in it */}
    {window ? (
      <>
        <Wall p={[0, 0.3, 2]} s={[3.6, 0.6]} c="#6b7380" />
        <Wall p={[0, 2.25, 2]} s={[3.6, 0.5]} c="#6b7380" />
        <Wall p={[-1.4, 1.2, 2]} s={[0.8, 1.8]} c="#6b7380" />
        <Wall p={[1.4, 1.2, 2]} s={[0.8, 1.8]} c="#6b7380" />
      </>
    ) : (
      <Wall p={[0, 1.25, 2]} s={[3.6, 2.5]} c="#6b7380" />
    )}
    {/* the seat */}
    <Box p={[0, 0.3, -2.4]} s={[1.6, 0.3, 1.4]} c="#b5523b" />
    <Box p={[0, 1.6, -3.2]} s={[1.6, 1.8, 0.4]} c="#3b4656" />
    <Box p={[-0.7, 1.2, -2.3]} s={[0.06, 1.4, 0.06]} c="#e8c12a" />
    <Box p={[0.7, 1.2, -2.3]} s={[0.06, 1.4, 0.06]} c="#e8c12a" />
    {/* the panel with the countdown screen, facing the seat (left out of the view of the flight) */}
    {panel && (
      <>
        <Box p={[0, 0.9, 0.5]} s={[3.2, 0.5, 0.5]} c="#2a2f3a" />
        <mesh position={[0, 1.8, 0.8]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.8, 0.9]} />
          <meshBasicMaterial map={countdownTex(digit)} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({length: 12}, (_, i) => (
          <Box key={i} p={[-1.5 + (i % 6) * 0.6, 0.9 + Math.floor(i / 6) * 0.14, 0.78]} s={[0.12, 0.08, 0.04]} c={i % 3 === 0 ? '#ff3b30' : '#34d399'} />
        ))}
      </>
    )}
    {window && <SpaceDome />}
  </group>
);

/** The launch pad at dawn: a tower, a rocket with a capsule on top, smoke. */
export const LaunchSet: React.FC<{flame?: number; smoke?: number}> = ({flame = 0, smoke = 0}) => (
  <group>
    <mesh position={[0, -0.02, -25]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshLambertMaterial map={concreteTex()} />
    </mesh>
    {/* a lattice tower */}
    {[-2.6, 2.6].map((x) => (
      <Box key={x} p={[x, 7, -10]} s={[0.35, 14, 0.35]} c="#9aa1ab" />
    ))}
    {[2, 5, 8, 11, 14].map((y) => (
      <Box key={y} p={[0, y, -10]} s={[5.6, 0.22, 0.22]} c="#9aa1ab" />
    ))}
    <Box p={[0, 6, -9.6]} s={[0.4, 0.4, 3.2]} c="#8a8f98" />
    {/* the rocket and its capsule */}
    <Rocket p={[0, 4.2, -10]} flame={flame} />
    <Capsule p={[0, 10.4, -10]} s={0.8} />
    {smoke > 0 && <Smoke p={[0, 0.5, -8]} k={smoke} />}
  </group>
);

/** Halo Station: a module with handrails, laptops on the wall, plants, food bags, and the height marker. */
export const StationSet: React.FC<{cat?: boolean; catExpr?: 'judge' | 'smug' | 'sleepy' | 'turn'}> = ({cat = false, catExpr = 'judge'}) => (
  <group>
    {/* a room: floor, ceiling, side walls and a back wall, open to the front */}
    <Wall p={[0, -0.02, -6]} s={[4.4, 12]} rot={[-Math.PI / 2, 0, 0]} c="#b9c0ca" />
    <Wall p={[0, 3.0, -6]} s={[4.4, 12]} rot={[Math.PI / 2, 0, 0]} c="#e8e8e4" />
    <Wall p={[-2.2, 1.5, -6]} s={[12, 3]} rot={[0, Math.PI / 2, 0]} c="#e8e8e4" />
    <Wall p={[2.2, 1.5, -6]} s={[12, 3]} rot={[0, -Math.PI / 2, 0]} c="#e8e8e4" />
    <Wall p={[0, 1.5, -12]} s={[4.4, 3]} c="#e8e8e4" />
    {/* blue stripe on the walls */}
    <Box p={[-2.14, 2.2, -6]} s={[0.04, 0.3, 12]} c="#2c6bd6" />
    <Box p={[2.14, 2.2, -6]} s={[0.04, 0.3, 12]} c="#2c6bd6" />
    {/* handrails */}
    {[-1.95, 1.4].map((x) => (
      <Box key={x} p={[x, 1.1, -6]} s={[0.08, 0.08, 12]} c="#c9cdd6" />
    ))}
    {/* laptops and bags */}
    <Box p={[-1.7, 1.5, -7]} s={[0.1, 0.8, 0.9]} c="#3a4656" />
    <Box p={[1.7, 1.5, -3]} s={[0.1, 0.8, 0.9]} c="#3a4656" />
    <Box p={[1.2, 0.2, -4.5]} s={[0.5, 0.4, 0.6]} c="#f2a33a" />
    <Box p={[-1.2, 0.2, -7]} s={[0.5, 0.4, 0.6]} c="#8ad08a" />
    {/* plants in boxes */}
    <Box p={[1.4, 0.3, -8.6]} s={[0.6, 0.6, 0.6]} c="#8a6a4a" />
    <Sphere p={[1.4, 0.9, -8.6]} r={0.4} c="#4f9446" />
    <Box p={[-1.4, 0.3, -9.6]} s={[0.6, 0.6, 0.6]} c="#8a6a4a" />
    <Sphere p={[-1.4, 0.9, -9.6]} r={0.36} c="#3f7d3a" />
    {/* the height marker on the wall */}
    <Pic p={[-2.1, 1.05, -4.2]} s={[1.6, 2.1]} tex={heightTex()} ry={Math.PI / 2} />
    {cat && <Cat expr={catExpr} feet={[0.4, 0.6, -4.6]} size={1.6} />}
  </group>
);

/** Mission Control: a wall screen with the orbit, consoles, and a row of operator desks. */
export const ControlRoomSet: React.FC = () => (
  <group>
    <mesh position={[0, -0.02, -8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 24]} />
      <meshLambertMaterial color="#4a5466" />
    </mesh>
    <mesh position={[0, 4.5, -8]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 24]} />
      <meshLambertMaterial color="#56607a" />
    </mesh>
    <mesh position={[0, 2.5, -20]}>
      <planeGeometry args={[24, 6]} />
      <meshLambertMaterial color="#56607a" />
    </mesh>
    {/* the big wall screen */}
    <Pic p={[0, 2.8, -19.8]} s={[8, 4]} tex={monitorTex()} />
    {/* consoles with screens */}
    {[-4, -1.3, 1.3, 4].map((x) => (
      <group key={x}>
        <Box p={[x, 0.8, -12]} s={[2.2, 1.6, 1.4]} c="#1d2a3a" />
        <Pic p={[x, 1.8, -11.27]} s={[1.6, 0.9]} tex={monitorTex()} />
      </group>
    ))}
    {/* mugs and papers on the desks */}
    {[-3.4, 0.4, 3.4].map((x) => (
      <Cyl key={x} p={[x, 1.7, -11.6]} r={0.12} h={0.3} c="#f2f2ee" seg={12} />
    ))}
    {/* the operator chairs */}
    {[-4, -1.3, 1.3, 4].map((x) => (
      <Box key={x} p={[x, 0.45, -10.2]} s={[0.8, 0.9, 0.8]} c="#3f4858" />
    ))}
  </group>
);

/** The space center parking lot at dawn: a barrier, lamps, a hatchback car (its height can be squashed by the impact). */
export const ParkingSet: React.FC<{squash?: number}> = ({squash = 0}) => (
  <group>
    <mesh position={[0, -0.02, -20]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[90, 90]} />
      <meshLambertMaterial map={asphaltTex()} />
    </mesh>
    {/* painted lines */}
    {[-4, -1.5, 1, 3.5].map((x, i) => (
      <Box key={i} p={[x, 0.01, -18]} s={[0.12, 0.02, 14]} c="#f2f2ee" />
    ))}
    {/* a striped barrier */}
    <Box p={[-6, 0.5, -10]} s={[0.2, 1.0, 4]} c="#e8483a" />
    <Box p={[-6, 0.5, -10]} s={[0.22, 0.25, 4]} c="#f2f2ee" />
    {/* lamp posts */}
    {[-7, 7].map((x) => (
      <React.Fragment key={x}>
        <Cyl p={[x, 3.2, -12]} r={0.08} h={6.4} c="#4a5260" seg={8} />
        <Sphere p={[x, 6.5, -12]} r={0.3} c="#fff6d8" />
      </React.Fragment>
    ))}
    {/* the space center building in the back */}
    <Box p={[0, 6, -40]} s={[30, 12, 6]} c="#c9cdd6" />
    <Box p={[0, 12.2, -40]} s={[30.4, 0.4, 6.4]} c="#3a4656" />
    {/* the hatchback: a box body, a cabin, four wheels; squashed by the capsule */}
    <group position={[0, 0, -14]} scale={[1, Math.max(0.25, 1 - squash), 1]}>
      <Box p={[0, 0.9, 0]} s={[2.0, 0.9, 3.6]} c="#d6402b" />
      <Box p={[0, 1.6, -0.2]} s={[1.8, 0.8, 2.2]} c="#8fc6e8" />
      {[[-0.9, 1.2], [0.9, 1.2], [-0.9, -1.2], [0.9, -1.2]].map(([x, z], i) => (
        <Cyl key={i} p={[x, 0.4, z]} r={0.4} h={0.3} c="#1d1f24" rot={[0, 0, Math.PI / 2]} seg={14} />
      ))}
    </group>
  </group>
);

/** The break room: a sofa, a coffee machine, a poster. */
export const BreakRoomSet: React.FC = () => (
  <group>
    <mesh position={[0, -0.02, -6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 14]} />
      <meshLambertMaterial map={floorTex()} />
    </mesh>
    <mesh position={[0, 2.5, -6]}>
      <planeGeometry args={[16, 5]} />
      <meshLambertMaterial color="#e6dccb" />
    </mesh>
    <mesh position={[-8, 2.5, -6]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[14, 5]} />
      <meshLambertMaterial color="#d7c7a6" />
    </mesh>
    {/* the sofa */}
    <Box p={[0, 0.4, -3]} s={[3.6, 0.8, 1.2]} c="#7a4f9e" />
    <Box p={[0, 1.1, -3.5]} s={[3.6, 0.8, 0.4]} c="#6a4288" />
    <Box p={[-1.5, 0.9, -2.8]} s={[0.7, 0.3, 0.6]} c="#c95f8a" />
    {/* a coffee machine */}
    <Box p={[3, 1.0, -5]} s={[0.9, 1.6, 0.9]} c="#3a4656" />
    <Pic p={[-1.25, 1.8, -5.96]} s={[1.8, 1.2]} tex={signTex('BREAK ROOM', '#2c6bd6', '#ffffff')} />
  </group>
);

/** The manager on the phone: a small office with a desk and a window. */
export const OfficeSet: React.FC = () => (
  <group>
    <mesh position={[0, -0.02, -6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 12]} />
      <meshLambertMaterial color="#8a8f98" />
    </mesh>
    <mesh position={[0, 2.5, -6]}>
      <planeGeometry args={[16, 5]} />
      <meshLambertMaterial color="#e6dccb" />
    </mesh>
    <Box p={[0, 0.8, -4]} s={[3.6, 0.1, 1.6]} c="#5a4a3a" />
    <Pic p={[1.3, 2.2, -5.9]} s={[2.2, 1.6]} tex={skyDayTex()} />
  </group>
);

/** The pilot's room: a little window to space with Earth low in the view. */
export const OrbitView: React.FC = () => (
  <group>
    <SpaceDome />
    <Earth p={[0, -24, -60]} r={22} />
  </group>
);
