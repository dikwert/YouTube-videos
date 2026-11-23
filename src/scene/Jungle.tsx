import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {Layer} from './Camera';
import {Canopy, Trunks} from './Environment';
import {clamp, hash, rng, safeId} from '../lib/math';
import {COL, Palette, W} from '../lib/theme';

/** Leaf outlines in local coordinates: the leaf points along +x with length s. */
export const leafPath = {
  broad: (s: number) => `M0 0 C${s * 0.3} ${-s * 0.42} ${s * 0.8} ${-s * 0.38} ${s} 0 C${s * 0.8} ${s * 0.38} ${s * 0.3} ${s * 0.42} 0 0Z`,
  palm: (s: number) => `M0 0 Q${s * 0.45} ${-s * 0.62} ${s} ${-s * 0.05} Q${s * 0.5} ${-s * 0.12} 0 0Z`,
  fern: (s: number) => `M0 0 Q${s * 0.5} ${-s * 0.2} ${s} 0 Q${s * 0.5} ${s * 0.2} 0 0Z`,
  needle: (s: number) => `M0 0 Q${s * 0.2} ${-s * 0.12} ${s} 0 Q${s * 0.2} ${s * 0.12} 0 0Z`,
};

/** A fan of leaves around one point. Every leaf sways on its own phase. */
export const Cluster: React.FC<{
  x: number;
  y: number;
  s: number;
  colors: string[];
  n?: number;
  seed: number;
  shape?: keyof typeof leafPath;
  sway?: number;
  speed?: number;
  upward?: boolean;
}> = ({x, y, s, colors, n = 6, seed, shape = 'broad', sway = 8, speed = 0.03, upward = false}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const leaves = Array.from({length: n}, () => ({
    a: upward ? -160 + r() * 140 : r() * 360,
    len: s * (0.6 + r() * 0.5),
    c: colors[Math.floor(r() * colors.length)],
    ph: r() * 6.28,
  }));
  return (
    <g transform={`translate(${x} ${y})`}>
      {leaves.map((l, i) => (
        <g key={i} transform={`rotate(${l.a + Math.sin(f * speed + l.ph) * sway})`}>
          <path d={leafPath[shape](l.len)} fill={l.c} />
          <path d={`M0 0 L${l.len * 0.9} 0`} stroke="#000" strokeOpacity={0.2} strokeWidth={2} fill="none" />
        </g>
      ))}
    </g>
  );
};

/** Many clusters scattered over a band of the frame. */
export const LeafBand: React.FC<{
  seed: number;
  depth: number;
  y0: number;
  y1: number;
  count: number;
  s0: number;
  s1: number;
  colors: string[];
  shape?: keyof typeof leafPath;
  sway?: number;
  upward?: boolean;
}> = ({seed, depth, y0, y1, count, s0, s1, colors, shape = 'broad', sway = 6, upward = false}) => {
  const r = rng(seed);
  const items = Array.from({length: count}, () => ({
    x: -260 + r() * (W + 520),
    y: y0 + r() * (y1 - y0),
    s: s0 + r() * (s1 - s0),
    sd: Math.floor(r() * 1e6),
  }));
  return (
    <Layer depth={depth}>
      {items.map((it, i) => (
        <Cluster key={i} x={it.x} y={it.y} s={it.s} colors={colors} n={6} seed={it.sd} shape={shape} sway={sway} speed={0.025} upward={upward} />
      ))}
    </Layer>
  );
};

/** Flower head: five petals and a centre, slowly turning. */
export const Flower: React.FC<{x: number; y: number; r?: number; color?: string; seed?: number}> = ({
  x,
  y,
  r = 14,
  color = '#ff6fa3',
  seed = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) rotate(${Math.sin(f * 0.02 + seed) * 6})`}>
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={k} cx={0} cy={-r * 0.9} rx={r * 0.5} ry={r * 0.8} fill={color} transform={`rotate(${k * 72})`} />
      ))}
      <circle r={r * 0.4} fill="#ffd166" />
    </g>
  );
};

/** Ferns, flowers and mushrooms sitting on a ground line. */
export const Understory: React.FC<{p: Palette; seed: number; depth: number; y0: number; count?: number}> = ({
  p,
  seed,
  depth,
  y0,
  count = 14,
}) => {
  const r = rng(seed);
  const items = Array.from({length: count}, () => ({
    x: -40 + r() * (W + 80),
    y: y0 + r() * 220,
    kind: r(),
    sd: Math.floor(r() * 1e6),
  }));
  const flowerCols = ['#ff6fa3', '#ffd166', '#9b5de5', '#ff8fab', '#f7f7f7'];
  return (
    <Layer depth={depth}>
      {items.map((it, i) => {
        if (it.kind < 0.45) {
          return <Cluster key={i} x={it.x} y={it.y} s={170 + (it.sd % 90)} colors={[p.mid, p.far]} n={7} seed={it.sd} shape="fern" upward sway={10} speed={0.035} />;
        }
        if (it.kind < 0.75) {
          return <Flower key={i} x={it.x} y={it.y} r={16 + (it.sd % 10)} color={flowerCols[it.sd % flowerCols.length]} seed={it.sd} />;
        }
        return (
          <g key={i} transform={`translate(${it.x} ${it.y})`}>
            <path d="M -16 0 Q -18 -26 0 -34 Q 18 -26 16 0 Z" fill="#c9a27a" />
            <path d="M -20 -30 Q 0 -58 20 -30 Q 0 -22 -20 -30 Z" fill="#b5523b" />
            <circle cx={-6} cy={-42} r={3} fill="#ffe9d6" />
            <circle cx={8} cy={-36} r={2} fill="#ffe9d6" />
          </g>
        );
      })}
    </Layer>
  );
};

/** Buttress roots spreading from a trunk base. */
export const Roots: React.FC<{x: number; y: number; w?: number; color?: string}> = ({x, y, w = 1, color = COL.root}) => (
  <g transform={`translate(${x} ${y}) scale(${w} 1)`}>
    <path d="M -20 0 C -60 -10 -90 10 -130 0" stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />
    <path d="M 20 0 C 60 -10 90 10 130 0" stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />
    <path d="M 0 0 C 10 -30 -6 -50 4 -70" stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

/** Still water with a shimmer that slides across it. */
export const Puddle: React.FC<{x: number; y: number; rx: number; ry: number; seed?: number}> = ({x, y, rx, ry, seed = 1}) => {
  const f = useCurrentFrame();
  const id = safeId(useId());
  const shine = (f * 2 + seed * 40) % (rx * 3);
  return (
    <g>
      <defs>
        <radialGradient id={`pud${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8fd9d0" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#0b2a22" stopOpacity={0.85} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#pud${id})`} />
      <rect x={x - rx + shine - 60} y={y - ry * 0.2} width={60} height={ry * 0.35} fill="#ffffff" opacity={0.35} transform={`skewX(-20)`} />
      {[-0.4, 0.1, 0.5].map((k, i) => (
        <path key={i} d={`M ${x - rx * 0.6} ${y + ry * k} Q ${x} ${y + ry * k - 6} ${x + rx * 0.6} ${y + ry * k}`} stroke="#e8fff9" strokeOpacity={0.2 + 0.1 * Math.sin(f * 0.1 + i)} strokeWidth={2} fill="none" />
      ))}
    </g>
  );
};

/** A patch of moss clinging to a stone. */
export const Moss: React.FC<{x: number; y: number; r: number; seed?: number}> = ({x, y, r, seed = 3}) => {
  const rr = rng(seed);
  const dots = Array.from({length: 18}, () => {
    const a = rr() * Math.PI * 2;
    const d = Math.sqrt(rr()) * r;
    return {x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.6, s: 4 + rr() * 9, c: rr() > 0.5 ? COL.moss : COL.mossDark};
  });
  return (
    <g>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.c} opacity={0.9} />
      ))}
    </g>
  );
};

/** Wall torch with a flickering flame, glow and rising embers. */
export const Torch: React.FC<{x: number; y: number; scale?: number; seed?: number}> = ({x, y, scale = 1, seed = 1}) => {
  const f = useCurrentFrame();
  const id = safeId(useId());
  const flick = 1 + 0.08 * Math.sin(f * 0.5 + seed) + 0.04 * hash(f * 1.7 + seed);
  const glow = 0.55 + 0.15 * Math.sin(f * 0.3 + seed) + 0.1 * hash(f * 2.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={`tg${id}`}>
          <stop offset="0%" stopColor="#ffd27a" stopOpacity={glow} />
          <stop offset="100%" stopColor="#ffb040" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={0} cy={-30} r={170} fill={`url(#tg${id})`} />
      <rect x={-8} y={-10} width={16} height={60} rx={4} fill="#3b2a1a" />
      <rect x={-18} y={-6} width={36} height={12} rx={4} fill="#2c2016" />
      <path
        d={`M -16 -12 Q -20 -40 0 ${-72 * flick} Q 20 -40 16 -12 Z`}
        fill="#ff9d2e"
        transform={`translate(0 0)`}
      />
      <path d={`M -8 -14 Q -10 -34 0 ${-50 * flick} Q 10 -34 8 -14 Z`} fill="#ffe27a" />
      {[0, 1, 2].map((k) => {
        const t = (f * 0.8 + k * 33 + seed * 17) % 90;
        return <circle key={k} cx={Math.sin(k + f * 0.05) * 6} cy={-70 - t} r={2.2} fill="#ffcf70" opacity={clamp(1 - t / 90)} />;
      })}
    </g>
  );
};

/** Soft contact shadow under a character or prop. */
export const ShadowBlob: React.FC<{x: number; y: number; rx: number; ry: number; opacity?: number}> = ({
  x,
  y,
  rx,
  ry,
  opacity = 0.45,
}) => {
  const id = safeId(useId());
  return (
    <g>
      <defs>
        <radialGradient id={`sb${id}`}>
          <stop offset="0%" stopColor="#000" stopOpacity={opacity} />
          <stop offset="100%" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#sb${id})`} />
    </g>
  );
};

/** Flying insects drifting through the light, with tiny glints. */
export const Insects: React.FC<{seed?: number; count?: number; depth?: number}> = ({seed = 4, count = 26, depth = 1}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const pts = Array.from({length: count}, () => ({
    x: r() * W,
    y: 200 + r() * 1400,
    ph: r() * 6.28,
    sp: 0.03 + r() * 0.05,
  }));
  return (
    <Layer depth={depth}>
      {pts.map((p, i) => {
        const x = p.x + Math.sin(f * p.sp + p.ph) * 90;
        const y = p.y + Math.cos(f * p.sp * 1.3 + p.ph) * 50;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={2.2} fill="#f5f5f5" opacity={0.65} />
            <line x1={x} y1={y} x2={x - Math.sin(f * p.sp + p.ph) * 10} y2={y - 3} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1.5} />
          </g>
        );
      })}
    </Layer>
  );
};

/** The full jungle stack for an outdoor view: far canopy, trunks, mid canopy, understory and a blurred foreground. */
export const JungleStack: React.FC<{p: Palette; seed: number; understory?: boolean; trunks?: boolean}> = ({
  p,
  seed,
  understory = true,
  trunks = true,
}) => (
  <>
    <LeafBand seed={seed + 1} depth={0.3} y0={120} y1={800} count={16} s0={170} s1={250} colors={[p.far, p.mid]} shape="broad" sway={4} />
    {trunks && <Trunks seed={seed + 2} color={p.mid} depth={0.55} top={0} bottom={1500} count={9} wMin={40} wMax={90} />}
    <LeafBand seed={seed + 3} depth={0.7} y0={560} y1={1100} count={16} s0={140} s1={200} colors={[p.mid, p.near]} shape="palm" sway={7} />
    {understory && <Understory p={p} seed={seed + 4} depth={1.05} y0={1380} count={12} />}
    <Layer depth={1.6}>
      <g style={{filter: 'blur(6px)'}}>
        <LeafBand seed={seed + 5} depth={0} y0={1150} y1={1950} count={7} s0={190} s1={260} colors={[p.near, '#0e2a1a']} shape="broad" sway={10} />
      </g>
    </Layer>
    <Canopy seed={seed + 6} color={p.far} depth={0.25} y={200} count={8} rMin={120} rMax={180} band={120} sway={3} />
  </>
);

export const JungleWater: React.FC<{seed?: number}> = ({seed = 9}) => (
  <>
    <Puddle x={250} y={1640} rx={150} ry={26} seed={seed} />
    <Puddle x={820} y={1700} rx={190} ry={30} seed={seed + 1} />
    <Moss x={120} y={1500} r={60} seed={seed} />
    <Moss x={960} y={1420} r={50} seed={seed + 2} />
  </>
);

