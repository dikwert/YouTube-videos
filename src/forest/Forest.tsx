import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {Layer} from '../lib/camera';
import {hash, rng, safeId} from '../lib/math';
import {H, W} from '../lib/theme';

/** Leaf outlines (point along +x, length s). Several shapes so the canopy never repeats. */
const LEAF = {
  broad: (s: number) => `M0 0 C${s * 0.25} ${-s * 0.5} ${s * 0.78} ${-s * 0.46} ${s} 0 C${s * 0.78} ${s * 0.44} ${s * 0.25} ${s * 0.5} 0 0Z`,
  banana: (s: number) => `M0 0 C${s * 0.18} ${-s * 0.2} ${s * 0.62} ${-s * 0.26} ${s} ${-s * 0.02} C${s * 0.62} ${s * 0.22} ${s * 0.2} ${s * 0.22} 0 0Z`,
  frond: (s: number) => `M0 0 Q${s * 0.45} ${-s * 0.6} ${s} ${-s * 0.12} Q${s * 0.5} ${-s * 0.04} 0 0Z`,
  fern: (s: number) => `M0 0 Q${s * 0.5} ${-s * 0.16} ${s} 0 Q${s * 0.5} ${s * 0.16} 0 0Z`,
  notched: (s: number) => `M0 0 C${s * 0.3} ${-s * 0.42} ${s * 0.7} ${-s * 0.36} ${s} 0 C${s * 0.7} ${s * 0.36} ${s * 0.3} ${s * 0.42} 0 0Z`,
};
type Shape = keyof typeof LEAF;

const Leaf: React.FC<{x: number; y: number; len: number; ang: number; shape: Shape; fill: string}> = ({x, y, len, ang, shape, fill}) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    <path d={LEAF[shape](len)} fill={fill} />
    <path d={`M0 0 L${len * 0.9} 0`} stroke="#000" strokeOpacity={0.3} strokeWidth={Math.max(1, len * 0.02)} fill="none" />
    {shape !== 'fern' && shape !== 'frond' && (
      <path
        d={`M${len * 0.3} 0 L${len * 0.45} ${-len * 0.22} M${len * 0.5} 0 L${len * 0.66} ${-len * 0.2} M${len * 0.3} 0 L${len * 0.45} ${len * 0.2} M${len * 0.5} 0 L${len * 0.66} ${len * 0.18}`}
        stroke="#000"
        strokeOpacity={0.14}
        strokeWidth={1}
        fill="none"
      />
    )}
  </g>
);

/** A fan of leaves at one point; the whole fan sways. */
const Cluster: React.FC<{x: number; y: number; size: number; seed: number; n: number; shapes: Shape[]; fills: string[]; sway?: number; speed?: number}> = ({
  x,
  y,
  size,
  seed,
  n,
  shapes,
  fills,
  sway = 6,
  speed = 0.03,
}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const leaves = Array.from({length: n}, () => ({
    a: r() * 360,
    len: size * (0.55 + r() * 0.6),
    shape: shapes[Math.floor(r() * shapes.length)],
    fill: fills[Math.floor(r() * fills.length)],
    ph: r() * 6.28,
    dx: (r() - 0.5) * size * 0.35,
  }));
  return (
    <g transform={`translate(${x} ${y}) rotate(${Math.sin(f * speed + seed) * sway})`}>
      {leaves.map((l, i) => (
        <Leaf key={i} x={l.dx} y={0} len={l.len} ang={l.a + Math.sin(f * speed * 1.3 + l.ph) * sway * 0.6} shape={l.shape} fill={l.fill} />
      ))}
    </g>
  );
};

/** A tapered trunk with bark cracks and moss patches. */
const Trunk: React.FC<{x: number; w: number; top: number; bottom: number; seed: number; fill: string; mossA?: string}> = ({x, w, top, bottom, seed, fill, mossA = '#3B5B3A'}) => {
  const r = rng(seed);
  const lean = (r() - 0.5) * 60;
  const edge = (side: number) => (t: number) => x + side * (w / 2) * (1 - 0.18 * t) + lean * t + Math.sin(t * 3 + seed) * 5;
  const L = edge(-1);
  const R = edge(1);
  const pts = (fn: (t: number) => number) => Array.from({length: 14}, (_, i) => `${fn(i / 13)} ${bottom + (top - bottom) * (i / 13)}`);
  const d = `M ${pts(L).join(' L ')} L ${pts(R).reverse().join(' L ')} Z`;
  const cracks = Array.from({length: 9}, (_, i) => {
    const cx = x + (r() - 0.5) * w * 0.7;
    const y0 = top + r() * (bottom - top) * 0.6;
    return `M${cx} ${y0} q${(r() - 0.5) * 10} ${(bottom - top) * 0.08} ${(r() - 0.5) * 6} ${(bottom - top) * 0.16}`;
  });
  const moss = Array.from({length: 7}, () => ({x: x + (r() - 0.5) * w * 0.8, y: bottom - r() * (bottom - top) * 0.5, s: 10 + r() * 22}));
  return (
    <g>
      <path d={d} fill={fill} />
      <path d={cracks.join(' ')} stroke="#000" strokeOpacity={0.35} strokeWidth={2} fill="none" strokeLinecap="round" />
      {moss.map((m, i) => (
        <ellipse key={i} cx={m.x} cy={m.y} rx={m.s} ry={m.s * 0.45} fill={mossA} opacity={0.55} />
      ))}
    </g>
  );
};

/** Hanging vine: a sagging stem with small leaves. */
const Vine: React.FC<{x: number; len: number; seed: number; fill: string; leaf: string}> = ({x, len, seed, fill, leaf}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const amp = 14 + r() * 26;
  const pts = Array.from({length: 18}, (_, i) => {
    const t = i / 17;
    return {x: x + Math.sin(t * 3 + seed + f * 0.02) * amp * t, y: -40 + t * len};
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <g>
      <path d={d} stroke={fill} strokeWidth={5 + r() * 3} fill="none" strokeLinecap="round" />
      {pts.filter((_, i) => i % 3 === 2).map((p, i) => (
        <ellipse key={i} cx={p.x + (i % 2 ? 12 : -12)} cy={p.y} rx={11} ry={5} fill={leaf} transform={`rotate(${i % 2 ? 25 : -25} ${p.x} ${p.y})`} />
      ))}
    </g>
  );
};

/** Muddy puddle with a reflection and rings from falling drops. */
const Puddle: React.FC<{x: number; y: number; rx: number; ry: number; seed: number; gid: string}> = ({x, y, rx, ry, seed, gid}) => {
  const f = useCurrentFrame();
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${gid}wt)`} />
      <ellipse cx={x} cy={y} rx={rx * 0.95} ry={ry * 0.9} fill="none" stroke="#9FB6A8" strokeOpacity={0.25} strokeWidth={2} />
      <path d={`M ${x - rx * 0.5} ${y - ry * 0.5} L ${x - rx * 0.4} ${y + ry * 0.3}`} stroke="#B9CEC0" strokeOpacity={0.18} strokeWidth={3} />
      {[0, 1, 2].map((k) => {
        const t = ((f + k * 14 + seed * 9) % 42) / 42;
        return <ellipse key={k} cx={x + (hash(seed + k) - 0.5) * rx} cy={y + (hash(seed + k + 4) - 0.5) * ry} rx={4 + t * 30} ry={1.5 + t * 8} fill="none" stroke="#CFE0D5" strokeOpacity={(1 - t) * 0.35} strokeWidth={1.4} />;
      })}
    </g>
  );
};

/** The whole forest: far fog and trunks, canopy, vines, understory, mud and a blurred foreground. */
export const Forest: React.FC<{seed?: number; dark?: number}> = ({seed = 1, dark = 0}) => {
  const uid = safeId(useId());
  const gid = `${uid}`;
  const r = rng(seed * 101);
  const greens = ['#5E7F4A', '#4A6B3E', '#3B5B3A', '#2F4D30', '#23402E'];
  const greensDark = ['#2F4D30', '#23402E', '#163024', '#10261A'];
  const all: Shape[] = ['broad', 'banana', 'frond', 'notched', 'fern'];
  const trunksFar = Array.from({length: 8}, (_, i) => ({x: -80 + i * 170 + r() * 60, w: 60 + r() * 60, seed: seed * 31 + i}));
  const trunksMid = Array.from({length: 6}, (_, i) => ({x: -40 + i * 230 + r() * 80, w: 90 + r() * 60, seed: seed * 53 + i}));
  const canopyFar = Array.from({length: 16}, (_, i) => ({x: -120 + i * 80 + r() * 60, y: 180 + r() * 620, s: 170 + r() * 110, sd: seed * 7 + i}));
  const canopyMid = Array.from({length: 22}, (_, i) => ({x: -120 + i * 60 + r() * 60, y: 520 + r() * 700, s: 130 + r() * 90, sd: seed * 13 + i}));
  const canopyNear = Array.from({length: 9}, (_, i) => ({x: -100 + i * 150 + r() * 80, y: 1000 + r() * 500, s: 220 + r() * 120, sd: seed * 17 + i}));
  const front = Array.from({length: 7}, (_, i) => ({x: -150 + i * 210 + r() * 90, y: 1250 + r() * 800, s: 260 + r() * 140, sd: seed * 19 + i}));
  const ferns = Array.from({length: 14}, (_, i) => ({x: -40 + r() * (W + 80), y: 1360 + r() * 200, sd: seed * 23 + i}));
  const vines = Array.from({length: 11}, (_, i) => ({x: 40 + i * 100 + r() * 60, len: 240 + r() * 360, sd: seed * 29 + i}));
  const puddles = [
    {x: 230, y: 1700, rx: 230, ry: 40},
    {x: 820, y: 1640, rx: 200, ry: 34},
    {x: 520, y: 1860, rx: 280, ry: 46},
  ];
  return (
    <g>
      <defs>
        <linearGradient id={`${gid}lf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5E7F4A" />
          <stop offset="0.55" stopColor="#3B5B3A" />
          <stop offset="1" stopColor="#163024" />
        </linearGradient>
        <linearGradient id={`${gid}lfd`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F4D30" />
          <stop offset="1" stopColor="#081510" />
        </linearGradient>
        <linearGradient id={`${gid}tr`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0B140F" />
          <stop offset="0.38" stopColor="#3A3125" />
          <stop offset="0.6" stopColor="#4B3F2C" />
          <stop offset="1" stopColor="#0B140F" />
        </linearGradient>
        <linearGradient id={`${gid}trd`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#101A14" />
          <stop offset="0.5" stopColor="#25303A" />
          <stop offset="1" stopColor="#101A14" />
        </linearGradient>
        <linearGradient id={`${gid}wt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2E4A40" />
          <stop offset="1" stopColor="#07110C" />
        </linearGradient>
        <radialGradient id={`${gid}fog`}>
          <stop offset="0" stopColor="#7F9187" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7F9187" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* far: fog and distant canopy */}
      <Layer depth={0.2}>
        <rect x={-200} y={300} width={W + 400} height={1400} fill={`url(#${gid}fog)`} />
        {canopyFar.slice(0, 8).map((c, i) => (
          <Cluster key={i} x={c.x} y={c.y} size={c.s} seed={c.sd} n={5} shapes={['broad', 'notched']} fills={[`url(#${gid}lfd)`]} sway={2} speed={0.01} />
        ))}
      </Layer>
      <Layer depth={0.35}>
        <g style={{filter: 'blur(2px)'}}>
          {trunksFar.map((t, i) => (
            <Trunk key={i} x={t.x} w={t.w} top={-40} bottom={1600} seed={t.seed} fill={`url(#${gid}trd)`} mossA="#24382C" />
          ))}
        </g>
      </Layer>
      <Layer depth={0.45}>
        {canopyFar.map((c, i) => (
          <Cluster key={i} x={c.x} y={c.y} size={c.s} seed={c.sd} n={7} shapes={all} fills={[`url(#${gid}lfd)`, `url(#${gid}lf)`]} sway={3} speed={0.015} />
        ))}
      </Layer>

      {/* mid: trunks, canopy, vines */}
      <Layer depth={0.65}>
        {trunksMid.map((t, i) => (
          <Trunk key={i} x={t.x} w={t.w} top={-40} bottom={1560} seed={t.seed} fill={`url(#${gid}tr)`} />
        ))}
      </Layer>
      <Layer depth={0.8}>
        {canopyMid.map((c, i) => (
          <Cluster key={i} x={c.x} y={c.y} size={c.s} seed={c.sd} n={6} shapes={all} fills={[`url(#${gid}lf)`, `url(#${gid}lfd)`, greens[i % greens.length]]} sway={5} speed={0.025} />
        ))}
      </Layer>
      <Layer depth={0.9}>
        {vines.map((v, i) => (
          <Vine key={i} x={v.x} len={v.len} seed={v.sd} fill="#23402E" leaf="#3B5B3A" />
        ))}
      </Layer>

      {/* ground: ferns, roots, mud and puddles */}
      <Layer depth={1}>
        {ferns.map((fn, i) => (
          <Cluster key={i} x={fn.x} y={fn.y} size={190} seed={fn.sd} n={8} shapes={['fern', 'frond']} fills={[`url(#${gid}lf)`, greensDark[i % 4]]} sway={9} speed={0.035} />
        ))}
        <rect x={-300} y={1500} width={W + 600} height={H - 1500 + 300} fill="#2A2418" opacity={0.9} />
        {[60, 380, 700, 980].map((rx, i) => (
          <path key={i} d={`M ${rx} 1560 q 40 -40 100 0 q -40 20 -100 0`} fill="#3A3224" opacity={0.7} />
        ))}
        {puddles.map((p, i) => (
          <Puddle key={i} x={p.x} y={p.y} rx={p.rx} ry={p.ry} seed={seed + i} gid={gid} />
        ))}
      </Layer>

      {/* near canopy and blurred foreground */}
      <Layer depth={1.2}>
        {canopyNear.map((c, i) => (
          <Cluster key={i} x={c.x} y={c.y} size={c.s} seed={c.sd} n={6} shapes={all} fills={[`url(#${gid}lf)`, `url(#${gid}lfd)`]} sway={6} speed={0.03} />
        ))}
      </Layer>
      <Layer depth={1.6}>
        <g style={{filter: 'blur(7px)'}} opacity={0.9}>
          {front.map((c, i) => (
            <Cluster key={i} x={c.x} y={c.y} size={c.s} seed={c.sd} n={7} shapes={all} fills={[`url(#${gid}lfd)`]} sway={8} speed={0.02} />
          ))}
        </g>
      </Layer>

      {dark > 0 && <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#050C08" opacity={dark} />}
    </g>
  );
};
