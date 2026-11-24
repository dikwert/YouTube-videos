import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CharState, charKey, drawCat, drawChar} from './chars';
import {arrowSignTex, Bin, Bx, BookShelf, Buttons, Cable, Cactus, Car, Cy, carpetTex, Chair, checkerFloorTex, ChipsBag, clockFaceTex, controlWallTex, DeskLamp, facadeTex, familyPhotoTex, FlowerBed, FlowerPot, Flag, foodBagTex, Fridge, Glow, Globe, Keyboard, Pl, posterTex, Puddle, RocketFig, rugTex, screenDashTex, skyCloudTex, Sp, stickerTex, stationMuralTex, Tree, TrafficCone, warningTex, worldMapTex, quiltTex, wallPatternTex, woodPanelTex, gratePatternTex, floorZoneTex} from './decor';

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
    // soft nebula clouds in violet, blue and teal
    for (const [x, y, rad, col] of [[260, 150, 280, 'rgba(120,60,180,0.6)'], [700, 300, 320, 'rgba(30,140,160,0.55)'], [520, 90, 200, 'rgba(60,90,200,0.5)'], [880, 120, 180, 'rgba(200,80,140,0.45)']] as [number, number, number, string][]) {
      const grd = g.createRadialGradient(x, y, 10, x, y, rad);
      grd.addColorStop(0, col);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 1024, 512);
    }
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
    g.fillStyle = 'rgba(52,255,154,0.16)';
    for (let x = 16; x < 512; x += 32) {
      for (let y = 16; y < 256; y += 32) {
        g.beginPath();
        g.arc(x, y, 3, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.strokeStyle = 'rgba(52,255,154,0.5)';
    g.lineWidth = 6;
    g.strokeRect(12, 12, 488, 232);
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
      <meshLambertMaterial map={stationMuralTex()} />
    </mesh>
    {/* painted floor zones */}
    <Pl p={[-2.0, 0.02, -0.8]} s={[1.6, 1.0]} tex={floorZoneTex('#2ec4b6')} rx={-Math.PI / 2} lit />
    <Bx p={[-4.2, 0.012, -4]} s={[0.12, 0.01, 12]} c="#f2c94c" />
    <Bx p={[4.2, 0.012, -4]} s={[0.12, 0.01, 12]} c="#f2c94c" />
    <Pl p={[2.0, 0.02, -0.8]} s={[1.6, 1.0]} tex={floorZoneTex('#ffd166')} rx={-Math.PI / 2} lit />
    <Pl p={[-3.5, 0.02, -12]} s={[3.0, 2.0]} tex={floorZoneTex('#9b5de5')} rx={-Math.PI / 2} lit />
    {/* warning bands along the floor edges */}
    <Bx p={[-8.6, 0.02, -10]} s={[0.5, 0.02, 40]} map={warningTex()} />
    <Bx p={[8.6, 0.02, -10]} s={[0.5, 0.02, 40]} map={warningTex()} />
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
    {/* crates, a warning band round the stand, flags, puddles and a tool rack */}
    <Bx p={[-2.8, 0.6, -4.2]} s={[1.2, 1.2, 1.2]} c="#e63946" />
    <Bx p={[-2.8, 1.85, -4.2]} s={[1.0, 1.0, 1.0]} c="#ffd166" />
    <Bx p={[2.8, 0.5, -3.6]} s={[1.4, 1.0, 1.2]} c="#2ec4b6" />
    <Bx p={[0, 0.6, -6]} s={[2.46, 0.24, 2.46]} map={warningTex()} />
    <Flag p={[-3.4, 0, -4.5]} h={3.4} c="#ff9f1c" />
    <Flag p={[3.6, 0, -5.5]} h={3.4} c="#2ec4b6" />
    <Puddle p={[-1.4, 0.01, -2.2]} s={[2.2, 1.2]} />
    <Puddle p={[1.8, 0.01, -2.9]} s={[1.6, 0.9]} />
    <Bx p={[-2.2, 1.2, -9.2]} s={[1.8, 2.4, 0.4]} c="#3a4656" />
    <Cy p={[-2.5, 1.7, -9.0]} r={0.03} h={0.6} c="#f2a33a" />
    <Cy p={[-2.0, 1.4, -9.0]} r={0.03} h={0.5} c="#e63946" />
    <Cy p={[-1.6, 1.9, -9.0]} r={0.05} h={0.3} c="#2ec4b6" />
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
    <Wall p={[0, 0, -1]} s={[3.6, 6]} rot={[-Math.PI / 2, 0, 0]} c="#4f7c8a" />
    <Pl p={[0, 0.01, -1]} s={[3.6, 6]} tex={gratePatternTex()} rx={-Math.PI / 2} cut />
    <Wall p={[0, 2.5, -1]} s={[3.6, 6]} rot={[Math.PI / 2, 0, 0]} c="#2e4a5e" />
    <Pl p={[0, 2.49, -1]} s={[3.6, 6]} tex={wallPatternTex()} rx={Math.PI / 2} cut />
    <Wall p={[-1.8, 1.25, -1]} s={[6, 2.5]} rot={[0, Math.PI / 2, 0]} c="#2f7f86" />
    <Pl p={[-1.77, 1.25, -1]} s={[6, 2.5]} tex={wallPatternTex()} ry={Math.PI / 2} cut />
    <Pl p={[-1.74, 1.5, -0.6]} s={[0.6, 0.45]} tex={familyPhotoTex()} ry={Math.PI / 2} />
    <Wall p={[1.8, 1.25, -1]} s={[6, 2.5]} rot={[0, -Math.PI / 2, 0]} c="#2f7f86" />
    <Pl p={[1.77, 1.25, -1]} s={[6, 2.5]} tex={wallPatternTex()} ry={-Math.PI / 2} cut />
    <Wall p={[0, 1.25, -4]} s={[3.6, 2.5]} c="#3c5a8a" />
    <Pl p={[0, 1.25, -3.97]} s={[3.6, 2.5]} tex={wallPatternTex()} cut />
    <Pl p={[-1.0, 2.0, -3.96]} s={[0.22, 0.22]} tex={stickerTex(2)} cut />
    <Pl p={[1.0, 2.0, -3.96]} s={[0.22, 0.22]} tex={stickerTex(1)} cut />
    <Pl p={[0.9, 0.9, -3.96]} s={[0.22, 0.22]} tex={stickerTex(0)} cut />
    {/* the front wall, with a window in it */}
    {window ? (
      <>
        <Wall p={[0, 0.3, 2]} s={[3.6, 0.6]} c="#2f7f86" />
        <Wall p={[0, 2.25, 2]} s={[3.6, 0.5]} c="#2f7f86" />
        <Wall p={[-1.4, 1.2, 2]} s={[0.8, 1.8]} c="#2f7f86" />
        <Wall p={[1.4, 1.2, 2]} s={[0.8, 1.8]} c="#2f7f86" />
      </>
    ) : (
      <Wall p={[0, 1.25, 2]} s={[3.6, 2.5]} c="#2f7f86" />
    )}
    {/* the seat */}
    <Bx p={[0, 0.3, -2.4]} s={[1.6, 0.3, 1.4]} map={quiltTex()} />
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
        <Buttons p={[0.9, 0.9, 0.79]} n={6} cols={['#ff6b6b', '#ffd166', '#2ec4b6', '#9b5de5']} />
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
    <Pl p={[-7, 15, -40]} s={[14, 7]} tex={skyCloudTex()} cut />
    <Pl p={[9, 19, -44]} s={[16, 8]} tex={skyCloudTex()} cut />
    <Pl p={[1, 11, -36]} s={[10, 5]} tex={skyCloudTex()} cut />
    {/* the rocket and its capsule */}
    <Rocket p={[0, 4.2, -10]} flame={flame} />
    <Capsule p={[0, 10.4, -10]} s={0.8} />
    {smoke > 0 && <Smoke p={[0, 0.5, -8]} k={smoke} />}
  </group>
);

/** Halo Station: a module with handrails, laptops on the wall, plants, food bags, and the height marker. */
export const StationSet: React.FC<{cat?: boolean; catExpr?: 'judge' | 'smug' | 'sleepy' | 'turn'}> = ({cat = false, catExpr = 'judge'}) => (
  <group>
    {/* a room: checker floor, ceiling, mural walls and a mural back wall, open to the front */}
    <Pl p={[0, -0.02, -6]} s={[4.4, 12]} tex={checkerFloorTex()} rx={-Math.PI / 2} lit />
    <Wall p={[0, 3.0, -6]} s={[4.4, 12]} rot={[Math.PI / 2, 0, 0]} c="#e8e8e4" />
    <Pl p={[-2.2, 1.5, -6]} s={[12, 3]} tex={stationMuralTex()} ry={Math.PI / 2} lit />
    <Pl p={[2.2, 1.5, -6]} s={[12, 3]} tex={stationMuralTex()} ry={-Math.PI / 2} lit />
    <Pl p={[0, 1.5, -12]} s={[4.4, 3]} tex={stationMuralTex()} lit />
    {/* blue stripe on the walls */}
    <Box p={[-2.14, 2.2, -6]} s={[0.04, 0.3, 12]} c="#2c6bd6" />
    <Box p={[2.14, 2.2, -6]} s={[0.04, 0.3, 12]} c="#2c6bd6" />
    {/* handrails */}
    {[-1.95, 1.4].map((x) => (
      <Box key={x} p={[x, 1.1, -6]} s={[0.08, 0.08, 12]} c="#c9cdd6" />
    ))}
    {/* cables along the top of the walls */}
    <Cable a={[-2.1, 2.9, -2.5]} b={[-2.1, 2.9, -10]} c="#e63946" />
    <Cable a={[2.1, 2.85, -2.5]} b={[2.1, 2.85, -10]} c="#ffd166" />
    {/* laptops and bags */}
    <Box p={[-1.7, 1.5, -7]} s={[0.1, 0.8, 0.9]} c="#3a4656" />
    <Box p={[1.7, 1.5, -3]} s={[0.1, 0.8, 0.9]} c="#3a4656" />
    <Box p={[1.2, 0.2, -4.5]} s={[0.5, 0.4, 0.6]} c="#f2a33a" />
    <Box p={[-1.2, 0.2, -7]} s={[0.5, 0.4, 0.6]} c="#8ad08a" />
    <Bx p={[2.0, 0.22, -6.8]} s={[0.5, 0.44, 0.22]} map={foodBagTex('#ff8fab')} />
    <Bx p={[2.3, 0.2, -5.6]} s={[0.46, 0.4, 0.2]} map={foodBagTex('#2ec4b6')} />
    {/* plants in boxes */}
    <Box p={[1.4, 0.3, -8.6]} s={[0.6, 0.6, 0.6]} c="#8a6a4a" />
    <Sphere p={[1.4, 0.9, -8.6]} r={0.4} c="#4f9446" />
    <Box p={[-1.4, 0.3, -9.6]} s={[0.6, 0.6, 0.6]} c="#8a6a4a" />
    <Sphere p={[-1.4, 0.9, -9.6]} r={0.36} c="#3f7d3a" />
    {/* patches, a toy and floating objects */}
    <Pl p={[-0.9, 2.3, -11.9]} s={[0.4, 0.4]} tex={stickerTex(0)} cut />
    <Pl p={[0.9, 2.3, -11.9]} s={[0.4, 0.4]} tex={stickerTex(1)} cut />
    <Sp p={[2.4, 0.2, -5.8]} r={0.14} c="#ffd166" />
    <Sp p={[2.4, 0.45, -5.8]} r={0.09} c="#ff6b6b" />
    <Sp p={[0.2, 2.1, -4.8]} r={0.12} c="#e63946" />
    <Cy p={[-0.6, 2.3, -5.2]} r={0.02} h={0.18} c="#2ec4b6" rot={[0, 0, 1.2]} />
    {/* the height marker on the wall */}
    <Pic p={[-2.1, 1.05, -4.2]} s={[1.6, 2.1]} tex={heightTex()} ry={Math.PI / 2} />
    {cat && <Cat expr={catExpr} feet={[0.4, 0.6, -4.6]} size={1.6} />}
  </group>
);

/** Mission Control: a wall screen with the orbit, consoles, and a row of operator desks. */
export const ControlRoomSet: React.FC = () => (
  <group>
    {/* carpet floor and a grey-blue ceiling */}
    <mesh position={[0, -0.02, -8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 24]} />
      <meshLambertMaterial map={carpetTex()} />
    </mesh>
    <mesh position={[0, 4.5, -8]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 24]} />
      <meshLambertMaterial map={controlWallTex()} />
    </mesh>
    {/* back wall: navy panels with LEDs and graphs */}
    <mesh position={[0, 2.5, -20]}>
      <planeGeometry args={[24, 6]} />
      <meshLambertMaterial map={controlWallTex()} />
    </mesh>
    {/* the big wall screen with the orbit */}
    <Pic p={[0, 2.8, -19.8]} s={[8, 4]} tex={monitorTex()} />
    {/* a world map and ORBITA posters on the wall */}
    <Pl p={[-7.4, 2.6, -19.75]} s={[4.2, 2.6]} tex={worldMapTex()} />
    <Pl p={[-10.6, 2.6, -19.75]} s={[2.2, 3.3]} tex={posterTex('rocket')} />
    <Pl p={[7.4, 2.6, -19.75]} s={[2.2, 3.3]} tex={posterTex('planet')} />
    <Pl p={[10.6, 2.6, -19.75]} s={[2.2, 3.3]} tex={posterTex('rocket')} />
    {/* clocks in several time zones above the screen */}
    <Pl p={[-2.6, 5.15, -19.75]} s={[0.8, 0.8]} tex={clockFaceTex(3, 15, '#2ec4b6')} />
    <Pl p={[0, 5.15, -19.75]} s={[0.8, 0.8]} tex={clockFaceTex(8, 40, '#ffd166')} />
    <Pl p={[2.6, 5.15, -19.75]} s={[0.8, 0.8]} tex={clockFaceTex(12, 5, '#ff9ecd')} />
    {/* a raised back row of staff, so their heads show above the desks */}
    <Bx p={[0, 0.3, -16.5]} s={[14, 0.6, 1.4]} c="#243a5e" />
    {[-6, -2, 2, 6].map((x, i) => (
      <Person key={x} st={{kind: 'ops', pose: 'stand', expr: i % 2 ? 'neutral' : 'bored', variant: i % 2}} feet={[x, 0.6, -16.5]} height={1.6} />
    ))}
    {/* light fixtures on the ceiling */}
    {[-6, -2, 2, 6].map((x) => (
      <Glow key={x} p={[x, 4.3, -8]} r={0.25} c="#ffe8a3" />
    ))}
    {/* consoles with screens, a keyboard, a sheet of paper and cables at each desk */}
    {[-4, -1.3, 1.3, 4].map((x, i) => (
      <group key={x}>
        <Box p={[x, 0.8, -12]} s={[2.2, 1.6, 1.4]} c="#214e6b" />
        <Pic p={[x, 1.8, -11.27]} s={[1.6, 0.9]} tex={screenDashTex(['graphs', 'bars', 'camera', 'graphs'][i] as 'graphs' | 'bars' | 'camera')} />
        <Keyboard p={[x - 0.2, 1.62, -11.75]} />
        <Bx p={[x + 0.8, 1.66, -11.6]} s={[0.5, 0.05, 0.4]} c={['#f2f2ee', '#ffd166', '#8ecae6', '#ff9ecd'][i]} />
        <Cable a={[x, 0.02, -12.7]} b={[x + 0.5, 0.02, -11.6]} c="#1d1f24" r={0.02} />
      </group>
    ))}
    {/* mugs and personal items on the desks */}
    {[-3.4, 0.4, 3.4].map((x) => (
      <Cyl key={x} p={[x, 1.7, -11.6]} r={0.12} h={0.3} c="#f2f2ee" seg={12} />
    ))}
    <Cactus p={[-4.7, 1.6, -12.2]} />
    <DeskLamp p={[-3.6, 1.6, -12.3]} />
    <FlowerPot p={[-0.6, 1.6, -12.2]} />
    <RocketFig p={[-1.9, 1.6, -12.3]} />
    <ChipsBag p={[1.9, 1.6, -12.2]} />
    <Pl p={[4.5, 1.62, -11.4]} s={[0.3, 0.3]} tex={stickerTex(3)} rx={-Math.PI / 2} cut />
    <Cy p={[4.9, 1.7, -12.2]} r={0.1} h={0.2} c="#9b5de5" seg={12} />
    {/* the operator chairs in four colours */}
    {[-4, -1.3, 1.3, 4].map((x, i) => (
      <Chair key={x} p={[x, 0, -10.2]} c={['#2ec4b6', '#f4a261', '#9b5de5', '#ffd166'][i]} />
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
    <Pl p={[0, 6, -36.9]} s={[30, 12]} tex={facadeTex()} lit />
    {/* coloured bays painted on the asphalt */}
    <Pl p={[-1.2, 0.01, -4.2]} s={[1.4, 0.9]} tex={floorZoneTex('#2ec4b6')} rx={-Math.PI / 2} lit />
    <Pl p={[-2.2, 0.01, -7]} s={[2.4, 1.6]} tex={floorZoneTex('#ffd166')} rx={-Math.PI / 2} lit />
    <Pl p={[2.6, 0.01, -9.5]} s={[2.4, 1.6]} tex={floorZoneTex('#2ec4b6')} rx={-Math.PI / 2} lit />
    {/* trees, flowerbeds, parked cars, cones, a bin, a sign and a puddle */}
    <Tree p={[-11, 0, -8]} />
    <Tree p={[11, 0, -9]} s={1.1} />
    <Tree p={[-9.5, 0, -20]} />
    <Tree p={[9.8, 0, -22]} s={1.2} />
    <FlowerBed p={[-4.8, 0, -2.5]} w={2.6} />
    <FlowerBed p={[4.8, 0, -2.5]} w={2.6} />
    <Car p={[-4.6, 0, -15]} c="#2ec4b6" />
    <Car p={[4.6, 0, -16.5]} c="#ffd166" ry={Math.PI} />
    <Car p={[-9.6, 0, -18]} c="#9b5de5" ry={Math.PI / 2} />
    <TrafficCone p={[-2.8, 0.3, -5.5]} />
    <TrafficCone p={[2.9, 0.3, -6.2]} />
    <Bin p={[-7.5, 0, -4]} c="#2a9d5c" />
    <Bin p={[7.5, 0, -6]} c="#ffd166" />
    <Cy p={[-8.8, 1.1, -9]} r={0.05} h={2.2} c="#c9cdd6" />
    <Pl p={[-8.8, 2.3, -9]} s={[1.2, 1.2]} tex={arrowSignTex()} ry={Math.PI / 2} />
    <Puddle p={[2.5, 0.01, -2.5]} s={[2.2, 1.2]} />
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
      <meshLambertMaterial map={checkerFloorTex()} />
    </mesh>
    {/* a mural on the back wall and a warm peach side wall */}
    <mesh position={[0, 2.5, -6]}>
      <planeGeometry args={[16, 5]} />
      <meshLambertMaterial map={stationMuralTex()} />
    </mesh>
    <mesh position={[-8, 2.5, -6]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[14, 5]} />
      <meshLambertMaterial color="#f2c9a0" />
    </mesh>
    <Pl p={[-7.9, 2.4, -2.5]} s={[1.6, 2.4]} tex={posterTex('planet')} ry={Math.PI / 2} />
    {/* a rug under the sofa */}
    <Pl p={[0, 0.01, -3.2]} s={[4.2, 2.2]} tex={rugTex()} rx={-Math.PI / 2} lit />
    {/* the sofa, with cushions */}
    <Box p={[0, 0.4, -3]} s={[3.6, 0.8, 1.2]} c="#7a4f9e" />
    <Box p={[0, 1.1, -3.5]} s={[3.6, 0.8, 0.4]} c="#6a4288" />
    <Box p={[-1.5, 0.9, -2.8]} s={[0.7, 0.3, 0.6]} c="#c95f8a" />
    <Bx p={[-1.2, 1.35, -3.2]} s={[0.5, 0.45, 0.2]} c="#ffd166" />
    <Bx p={[1.1, 1.35, -3.2]} s={[0.5, 0.45, 0.2]} c="#2ec4b6" />
    {/* a coffee machine with cups */}
    <Box p={[3, 1.0, -5]} s={[0.9, 1.6, 0.9]} c="#3a4656" />
    <Cy p={[2.7, 1.85, -5]} r={0.07} h={0.12} c="#ff6b6b" />
    <Cy p={[3.2, 1.85, -4.8]} r={0.07} h={0.12} c="#ffd166" />
    {/* a fridge, a tree in a tub, a clock and two lamps */}
    <Fridge p={[-5, 0, -5.5]} />
    <Tree p={[4.6, 0, -5.2]} s={0.5} />
    <Pl p={[-1.6, 3.2, -5.9]} s={[0.6, 0.6]} tex={clockFaceTex(9, 40, '#f2f2ee')} />
    {[-2, 2].map((x) => (
      <React.Fragment key={x}>
        <Cy p={[x, 4.0, -3]} r={0.01} h={1.4} c="#1d1f24" />
        <Glow p={[x, 3.25, -3]} r={0.14} c="#ffe8a3" />
      </React.Fragment>
    ))}
    <Pic p={[-1.25, 1.8, -5.96]} s={[1.8, 1.2]} tex={signTex('BREAK ROOM', '#2c6bd6', '#ffffff')} />
  </group>
);

/** The manager on the phone: a small office with a desk and a window. */
export const OfficeSet: React.FC = () => (
  <group>
    <mesh position={[0, -0.02, -6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 12]} />
      <meshLambertMaterial map={carpetTex()} />
    </mesh>
    <mesh position={[0, 2.5, -6]}>
      <planeGeometry args={[16, 5]} />
      <meshLambertMaterial map={woodPanelTex()} />
    </mesh>
    {/* a bookshelf, a globe, a plant, a framed photo and a poster */}
    <BookShelf p={[-4.6, 1.2, -5.7]} s={[2.4, 2.4, 0.5]} />
    <Globe p={[4.0, 1.2, -5.2]} r={0.45} />
    <Tree p={[-5.6, 0, -4.4]} s={0.5} />
    <Pl p={[-1.6, 2.3, -5.9]} s={[0.7, 0.5]} tex={familyPhotoTex()} />
    <Pl p={[-0.2, 2.6, -5.9]} s={[0.6, 0.9]} tex={posterTex('planet')} />
    {/* the desk, with a monitor, a mug and a sheet of paper */}
    <Box p={[0, 0.8, -4]} s={[3.6, 0.1, 1.6]} c="#5a4a3a" />
    <Pic p={[0, 1.4, -4.85]} s={[0.9, 0.55]} tex={screenDashTex('graphs')} />
    <Cy p={[1.2, 0.95, -3.7]} r={0.07} h={0.12} c="#2ec4b6" />
    <Bx p={[-1.0, 0.87, -3.6]} s={[0.6, 0.02, 0.45]} c="#f2f2ee" />
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
