import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

// Общие значения (look из cartoon-3d-short: тушь #0b0a0c, toon-затенение, туман = цвет горизонта)
export const INK = '#0b0a0c';
export const W = 1080;
export const H = 1920;

// Камера: ключевые кадры по времени внутри шота (сек). f — вертикальный угол обзора, градусы.
export type Cam = {p: [number, number, number]; l: [number, number, number]; f: number};
export type CamKey = Cam & {t: number};

export const camAt = (keys: CamKey[], t: number): Cam => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const u = (t - a.t) / (b.t - a.t);
      const k = u * u * (3 - 2 * u);
      const mix = (x: number[], y: number[]) => [0, 1, 2].map((j) => x[j] + (y[j] - x[j]) * k) as [number, number, number];
      return {p: mix(a.p, b.p), l: mix(a.l, b.l), f: a.f + (b.f - a.f) * k};
    }
  }
  return keys[keys.length - 1];
};

// Проекция точки мира в пиксели кадра 1080x1920 той же камерой, что и three.js.
export const project = (P: [number, number, number], c: Cam) => {
  const C = new THREE.Vector3(...c.p);
  const f = new THREE.Vector3(...c.l).sub(C).normalize();
  const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  const u = new THREE.Vector3().crossVectors(r, f).normalize();
  const d = new THREE.Vector3(...P).sub(C);
  const zc = d.dot(f);
  const th = Math.tan((c.f * Math.PI) / 360);
  const nx = d.dot(r) / zc / (th * (W / H));
  const ny = d.dot(u) / zc / th;
  return {x: ((nx + 1) / 2) * W, y: ((1 - ny) / 2) * H, z: zc, pxPerM: H / 2 / (th * zc)};
};

// Камера three.js ведётся по тем же ключам, что и проекция персонажей.
export const CameraRig: React.FC<{keys: CamKey[]; t: number}> = ({keys, t}) => {
  const {camera} = useThree();
  const c = camAt(keys, t);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...c.p);
  cam.lookAt(...c.l);
  cam.fov = c.f;
  cam.near = 0.1;
  cam.far = 900;
  cam.updateProjectionMatrix();
  return null;
};

// Тонированная карта: три ступени света (toon-шейдинг)
const toonGradient = (() => {
  const data = new Uint8Array([72, 66, 80, 255, 150, 140, 150, 255, 255, 250, 240, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
})();

// Нарисованные текстуры: мазки, зерно, неровности — вместо плоских заливок
const texCache = new Map<string, THREE.CanvasTexture>();
const rng = (seed: number) => {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
};
export const paintTex = (key: string, paint: (ctx: CanvasRenderingContext2D, s: number, r: () => number) => void, size = 256, repX = 1, repY = 1) => {
  const cached = texCache.get(key);
  if (cached) return cached;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d');
  if (ctx) paint(ctx, size, rng(key.length * 97 + 13));
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repX, repY);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
};

// Мазки и зерно поверх основного цвета
const brushed = (base: string, dark: string, light: string, count = 900) => (ctx: CanvasRenderingContext2D, s: number, r: () => number) => {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = 0.08 + r() * 0.12;
    ctx.fillStyle = r() < 0.5 ? dark : light;
    const x = r() * s;
    const y = r() * s;
    ctx.fillRect(x, y, 2 + r() * 14, 1 + r() * 3);
  }
  ctx.globalAlpha = 1;
};

export const wallTex = (base: string, dark: string, light: string) => paintTex(`wall-${base}`, brushed(base, dark, light, 1400), 256, 2, 3);
export const roofTex = (base: string, dark: string) => paintTex(`roof-${base}`, (ctx, s, r) => {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 24) {
    ctx.fillStyle = dark;
    ctx.fillRect(0, y, s, 3);
    for (let x = (y / 24) % 2 ? 0 : 16; x < s; x += 32) {
      ctx.globalAlpha = 0.35 + r() * 0.2;
      ctx.fillRect(x, y + 3, 3, 21);
    }
  }
  ctx.globalAlpha = 1;
}, 256, 2, 2);
export const groundTex = (base: string, dark: string) => paintTex(`ground-${base}`, brushed(base, dark, '#ffffff', 2200), 512, 8, 8);
export const asphaltTex = () => paintTex('asphalt', brushed('#4a4d52', '#2a2c30', '#7a7d84', 2400), 256, 4, 12);
export const woodTex = (base: string) => paintTex(`wood-${base}`, (ctx, s, r) => {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 32) {
    ctx.fillStyle = 'rgba(40,22,10,0.35)';
    ctx.fillRect(x, 0, 2, s);
    for (let i = 0; i < 40; i++) {
      ctx.globalAlpha = 0.1 + r() * 0.12;
      ctx.fillStyle = r() < 0.5 ? '#2a1808' : '#ffe1b0';
      ctx.fillRect(x + 4, r() * s, 22, 1);
    }
  }
  ctx.globalAlpha = 1;
}, 256, 4, 4);

// Текст на плоскости (вывеска, доска, табличка) — без источника света, чтобы читалась
export const signTex = (key: string, lines: string[], bg: string, fg: string, w = 1024, h = 256) => paintTex(`sign-${key}`, (ctx, s) => {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = fg;
  ctx.font = '800 96px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, s / 2, s / 2 + (i - (lines.length - 1) / 2) * 110));
}, Math.max(w, h), 1, 1);

// Небо: градиент; шар вокруг камеры
export const Sky: React.FC<{top: string; mid: string; low: string}> = ({top, mid, low}) => {
  const tex = useMemo(() => paintTex(`sky-${top}-${mid}-${low}`, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, top);
    g.addColorStop(0.5, mid);
    g.addColorStop(1, low);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }, 512), [top, mid, low]);
  return (
    <mesh>
      <sphereGeometry args={[380, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} />
    </mesh>
  );
};

// Свет и туман: day (день), golden (утро, закатный), night (ночь)
export const Lights: React.FC<{preset?: 'day' | 'golden' | 'night'}> = ({preset = 'day'}) => {
  const P = preset === 'golden'
    ? {sun: [-40, 26, -30], sc: '#ffb36b', si: 2.0, hs: '#ffd9a8', hg: '#5a4a6a', hi: 0.9, fog: '#f0b48a'}
    : preset === 'night'
      ? {sun: [20, 40, 10], sc: '#8fa8d8', si: 0.7, hs: '#3a4a7a', hg: '#1a1a24', hi: 0.6, fog: '#1d2238'}
      : {sun: [34, 52, 22], sc: '#fff2dc', si: 1.8, hs: '#bfe0ff', hg: '#7a8a6a', hi: 0.9, fog: '#bfd9ea'};
  return (
    <>
      <hemisphereLight args={[P.hs, P.hg, P.hi]} />
      <directionalLight position={P.sun as [number, number, number]} color={P.sc} intensity={P.si} />
      <fog attach="fog" args={[P.fog, 60, 420]} />
    </>
  );
};

// Геометрия с обводкой тушью: копия чуть больше, рисуется изнутри чёрным
export const Solid: React.FC<{
  geo: 'box' | 'cyl' | 'cone' | 'sphere' | 'plane' | 'ico';
  args: number[];
  p?: [number, number, number];
  r?: [number, number, number];
  color?: string;
  map?: THREE.Texture;
  ink?: boolean;
  emissive?: string;
  ei?: number;
  basic?: boolean;
}> = ({geo, args, p = [0, 0, 0], r = [0, 0, 0], color = '#cccccc', map, ink = true, emissive, ei = 0, basic = false}) => {
  const G = () => {
    switch (geo) {
      case 'box': return <boxGeometry args={args as [number, number, number]} />;
      case 'cyl': return <cylinderGeometry args={args as [number, number, number, number]} />;
      case 'cone': return <coneGeometry args={args as [number, number, number]} />;
      case 'sphere': return <sphereGeometry args={args as [number, number, number]} />;
      case 'plane': return <planeGeometry args={args as [number, number]} />;
      default: return <icosahedronGeometry args={args as [number, number]} />;
    }
  };
  const mat = basic
    ? <meshBasicMaterial color={color} map={map} />
    : <meshToonMaterial color={color} map={map} gradientMap={toonGradient} emissive={emissive} emissiveIntensity={ei} />;
  return (
    <group position={p} rotation={r}>
      <mesh>
        <G />
        {mat}
      </mesh>
      {ink && geo !== 'plane' && (
        <mesh scale={[1.035, 1.035, 1.035]}>
          <G />
          <meshBasicMaterial color={INK} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
};

// Улица и тротуары
export const Street: React.FC<{len?: number; w?: number}> = ({len = 120, w = 9}) => (
  <group>
    <Solid geo="plane" args={[w, len]} p={[0, 0.01, 0]} r={[-Math.PI / 2, 0, 0]} map={asphaltTex()} basic />
    <Solid geo="plane" args={[w + 6, len]} p={[0, 0.02, 0]} r={[-Math.PI / 2, 0, 0]} map={groundTex('#a79c8c', '#7a6e60')} basic />
    <Solid geo="plane" args={[w, len]} p={[0, 0.03, 0]} r={[-Math.PI / 2, 0, 0]} map={asphaltTex()} basic />
  </group>
);

// Дерево (осенняя крона)
export const Tree: React.FC<{x: number; z: number; s?: number; tint?: string}> = ({x, z, s = 1, tint = '#d7833a'}) => (
  <group position={[x, 0, z]} scale={[s, s, s]}>
    <Solid geo="cyl" args={[0.25, 0.35, 3.2, 8]} p={[0, 1.6, 0]} color="#5a3e28" />
    <Solid geo="ico" args={[2.1, 1]} p={[0, 4.4, 0]} color={tint} />
    <Solid geo="ico" args={[1.5, 1]} p={[0.9, 5.4, 0.4]} color="#e8a84a" />
  </group>
);

// Дом с крышей, окнами и входом; стены — нарисованные
export const House: React.FC<{x: number; z: number; w: number; d: number; h: number; wall: string; roof?: string; rot?: number; lit?: boolean; sign?: THREE.Texture}> = ({x, z, w, d, h, wall, roof = '#7a3a2e', rot = 0, lit = false, sign}) => {
  const wt = wallTex(wall, '#3a2a20', '#fff3dd');
  const rt = roofTex(roof, '#2a1410');
  const win = lit ? '#ffd27a' : '#2b2730';
  const rows = Math.max(1, Math.floor(h / 2.6));
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Solid geo="box" args={[w, h, d]} p={[0, h / 2, 0]} color={wall} map={wt} />
      <group position={[0, h + 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
        <Solid geo="cone" args={[Math.max(w, d) * 0.78, 2.4, 4]} color={roof} map={rt} />
      </group>
      {Array.from({length: rows}).map((_, i) => [-w / 3, w / 3].map((wx, j) => (
        <Solid key={`${i}-${j}`} geo="box" args={[0.9, 1.2, 0.08]} p={[wx, 1.6 + i * 2.6, d / 2 + 0.05]} color={win} ink={false} basic />
      )))}
      {sign && <Solid geo="plane" args={[w * 0.7, 1.1]} p={[0, h * 0.8, d / 2 + 0.12]} map={sign} basic />}
    </group>
  );
};

// Башня с часами: круглый циферблат с двумя стрелками (можно вращать)
export const ClockTower: React.FC<{x: number; z: number; h?: number; hour?: number; minute?: number}> = ({x, z, h = 26, hour = 9, minute = 0}) => {
  const face = signTex('clockface', [' '], '#f6eedc', '#2a1d14', 512, 512);
  const hr = (hour % 12) * 30 + minute * 0.5;
  const mn = minute * 6;
  return (
    <group position={[x, 0, z]}>
      <Solid geo="box" args={[4.2, h, 4.2]} p={[0, h / 2, 0]} color="#cdbb98" map={wallTex('#cdbb98', '#5a4a38', '#fff8e8')} />
      <Solid geo="cone" args={[3.6, 6, 4]} p={[0, h + 3, 0]} r={[0, Math.PI / 4, 0]} color="#3d5a7a" map={roofTex('#3d5a7a', '#14202e')} />
      <group position={[0, h - 4, 2.15]}>
        <Solid geo="cyl" args={[1.6, 1.6, 0.2, 24]} r={[Math.PI / 2, 0, 0]} color="#f6eedc" map={face} />
        <Solid geo="box" args={[0.12, 1.3, 0.1]} p={[0, 0.65, 0.12]} r={[0, 0, -hr * Math.PI / 180]} color="#2a1d14" ink={false} />
        <Solid geo="box" args={[0.1, 1.5, 0.1]} p={[0, 0.75, 0.13]} r={[0, 0, -mn * Math.PI / 180]} color="#2a1d14" ink={false} />
      </group>
    </group>
  );
};

// Машина сбоку: кузов, стёкла, колёса
export const Car: React.FC<{x: number; z: number; rot?: number; color?: string}> = ({x, z, rot = 0, color = '#3b7aa8'}) => (
  <group position={[x, 0, z]} rotation={[0, rot, 0]}>
    <Solid geo="box" args={[1.9, 0.8, 4.2]} p={[0, 0.9, 0]} color={color} />
    <Solid geo="box" args={[1.7, 0.7, 2.2]} p={[0, 1.6, -0.2]} color="#9ccde0" ink={false} />
    {[[-1, 1.4], [1, 1.4], [-1, -1.4], [1, -1.4]].map(([sx, sz], i) => (
      <Solid key={i} geo="cyl" args={[0.42, 0.42, 0.34, 14]} p={[sx * 0.98, 0.42, sz]} r={[0, 0, Math.PI / 2]} color="#1d1a1e" ink={false} />
    ))}
  </group>
);

// Фонарь
export const Lamp: React.FC<{x: number; z: number; on?: boolean}> = ({x, z, on = false}) => (
  <group position={[x, 0, z]}>
    <Solid geo="cyl" args={[0.12, 0.16, 5.2, 8]} p={[0, 2.6, 0]} color="#2a2a30" />
    <Solid geo="sphere" args={[0.5, 12, 8]} p={[0, 5.4, 0]} color={on ? '#ffe9a8' : '#e8e0c8'} emissive="#ffd27a" ei={on ? 1.4 : 0.1} basic />
  </group>
);

// Дождь: падающие штрихи (для атмосферы)
export const Rain: React.FC<{t: number; n?: number; area?: number}> = ({t, n = 260, area = 60}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 6);
    const r = rng(7);
    for (let i = 0; i < n; i++) {
      const x = (r() - 0.5) * area;
      const y = r() * 40;
      const z = (r() - 0.5) * area;
      pos.set([x, y, z, x + 0.05, y - 0.9, z], i * 6);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [n, area]);
  return (
    <group position={[0, -((t * 14) % 40), 0]}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#cfe6ff" transparent opacity={0.45} />
      </lineSegments>
    </group>
  );
};
