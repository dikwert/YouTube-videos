import React, {useId} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Layer} from './Camera';
import {clamp, hash, rng, safeId} from '../lib/math';
import {COL, H, Palette, W} from '../lib/theme';

/** Full-bleed stage: gradient sky/ground behind an SVG world, then the colour grade and vignette. */
export const Stage: React.FC<{p: Palette; grade?: boolean; children: React.ReactNode}> = ({
  p,
  grade = true,
  children,
}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${p.top} 0%, ${p.bottom} 66%, ${p.ground} 100%)`}}>
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}
    >
      {children}
    </svg>
    {grade && (
      <>
        <AbsoluteFill style={{background: p.grade, opacity: p.gradeOpacity, mixBlendMode: 'multiply'}} />
        <AbsoluteFill
          style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)'}}
        />
      </>
    )}
  </AbsoluteFill>
);

/** Solid black or colour overlay, for cuts and fades. */
export const Fade: React.FC<{color?: string; opacity: number}> = ({color = '#000', opacity}) => (
  <AbsoluteFill style={{background: color, opacity: clamp(opacity)}} />
);

export const Sun: React.FC<{x: number; y: number; r?: number; opacity?: number}> = ({x, y, r = 160, opacity = 1}) => {
  const f = useCurrentFrame();
  const id = safeId(useId());
  const pulse = 1 + Math.sin(f * 0.04) * 0.04;
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={`sun${id}`}>
          <stop offset="0%" stopColor="#fffdf0" stopOpacity="1" />
          <stop offset="30%" stopColor="#fff2b0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 2.4 * pulse} fill={`url(#sun${id})`} />
      <circle cx={x} cy={y} r={r * 0.55} fill="#fffef6" />
    </g>
  );
};

export const Clouds: React.FC<{seed?: number; color?: string; depth?: number; y?: number; opacity?: number}> = ({
  seed = 4,
  color = '#ffffff',
  depth = 0.2,
  y = 260,
  opacity = 0.55,
}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const puffs = Array.from({length: 7}, () => ({
    x: r() * 1500 - 200,
    y: y + r() * 240,
    s: 0.7 + r() * 0.9,
    sp: 0.15 + r() * 0.35,
  }));
  return (
    <Layer depth={depth}>
      <g opacity={opacity}>
        {puffs.map((p, i) => {
          const x = ((p.x + f * p.sp) % 1500) - 200;
          return (
            <g key={i} transform={`translate(${x} ${p.y}) scale(${p.s})`}>
              <ellipse cx={0} cy={0} rx={150} ry={36} fill={color} />
              <ellipse cx={-70} cy={-14} rx={80} ry={40} fill={color} />
              <ellipse cx={60} cy={-18} rx={90} ry={44} fill={color} />
            </g>
          );
        })}
      </g>
    </Layer>
  );
};

/** Round treetop canopy band. */
export const Canopy: React.FC<{
  seed: number;
  color: string;
  depth: number;
  y: number;
  count?: number;
  rMin?: number;
  rMax?: number;
  sway?: number;
  band?: number;
}> = ({seed, color, depth, y, count = 38, rMin = 90, rMax = 170, sway = 6, band = 160}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const items = Array.from({length: count}, () => ({
    x: -220 + r() * 1520,
    y: y + (r() - 0.5) * band,
    r: rMin + r() * (rMax - rMin),
  }));
  return (
    <Layer depth={depth}>
      {items.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y + Math.sin(f * 0.02 + i * 1.7) * sway} r={c.r} fill={color} />
      ))}
    </Layer>
  );
};

/** Vertical tree trunks with a slight lean, for parallax depth. */
export const Trunks: React.FC<{
  seed: number;
  color: string;
  depth: number;
  count?: number;
  top?: number;
  bottom?: number;
  wMin?: number;
  wMax?: number;
}> = ({seed, color, depth, count = 9, top = 0, bottom = H, wMin = 36, wMax = 80}) => {
  const r = rng(seed);
  const items = Array.from({length: count}, () => ({
    x: -120 + r() * 1320,
    w: wMin + r() * (wMax - wMin),
    lean: (r() - 0.5) * 30,
  }));
  return (
    <Layer depth={depth}>
      {items.map((t, i) => {
        const mid = (top + bottom) / 2;
        const d = [
          `M ${t.x - t.w / 2} ${bottom}`,
          `Q ${t.x - t.w * 0.2 + t.lean} ${mid} ${t.x - t.w * 0.35 + t.lean} ${top}`,
          `L ${t.x + t.w * 0.35 + t.lean} ${top}`,
          `Q ${t.x + t.w * 0.2 + t.lean} ${mid} ${t.x + t.w / 2} ${bottom} Z`,
        ].join(' ');
        return <path key={i} d={d} fill={color} />;
      })}
    </Layer>
  );
};

/** Swaying leaves. Anchored to a rectangular zone; each leaf rocks around its own phase. */
export const Leaves: React.FC<{
  seed: number;
  colors: string[];
  depth: number;
  count?: number;
  zone?: [number, number, number, number];
  size?: [number, number];
  sway?: number;
  speed?: number;
}> = ({seed, colors, depth, count = 40, zone = [-160, 0, W + 160, H], size = [70, 140], sway = 14, speed = 0.03}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const [x0, y0, x1, y1] = zone;
  const items = Array.from({length: count}, () => ({
    x: x0 + r() * (x1 - x0),
    y: y0 + r() * (y1 - y0),
    s: size[0] + r() * (size[1] - size[0]),
    rot: r() * 360,
    ph: r() * 6.28,
    c: colors[Math.floor(r() * colors.length)],
  }));
  return (
    <Layer depth={depth}>
      {items.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot + Math.sin(f * speed + l.ph) * sway})`}>
          <path d={`M 0 0 C ${l.s * 0.3} ${-l.s * 0.45} ${l.s * 0.8} ${-l.s * 0.4} ${l.s} 0 C ${l.s * 0.8} ${l.s * 0.4} ${l.s * 0.3} ${l.s * 0.45} 0 0 Z`} fill={l.c} />
          <path d={`M 0 0 L ${l.s * 0.85} 0`} stroke="#000" strokeOpacity={0.18} strokeWidth={2} fill="none" />
        </g>
      ))}
    </Layer>
  );
};

export const Fog: React.FC<{y: number; color?: string; opacity?: number; depth?: number; seed?: number; spread?: number}> = ({
  y,
  color = '#e9fff0',
  opacity = 0.25,
  depth = 0.5,
  seed = 3,
  spread = 160,
}) => {
  const f = useCurrentFrame();
  const id = safeId(useId());
  const r = rng(seed);
  const blobs = Array.from({length: 6}, () => ({
    x: r() * 1300 - 100,
    y: y + (r() - 0.5) * spread,
    rx: 260 + r() * 240,
    ry: 80 + r() * 60,
    sp: 0.2 + r() * 0.5,
    ph: r() * 6.28,
  }));
  return (
    <Layer depth={depth}>
      <defs>
        <filter id={`fog${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      <g filter={`url(#fog${id})`} opacity={opacity}>
        {blobs.map((b, i) => (
          <ellipse key={i} cx={b.x + Math.sin(f * 0.01 * b.sp + b.ph) * 70} cy={b.y} rx={b.rx} ry={b.ry} fill={color} />
        ))}
      </g>
    </Layer>
  );
};

export const LightRays: React.FC<{seed?: number; count?: number; color?: string; opacity?: number; depth?: number}> = ({
  seed = 5,
  count = 7,
  color = '#fff6c8',
  opacity = 0.14,
  depth = 1,
}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const rays = Array.from({length: count}, () => ({
    x: r() * W * 1.2 - 60,
    w: 60 + r() * 120,
    tilt: (r() - 0.5) * 0.5,
    ph: r() * 6.28,
  }));
  return (
    <Layer depth={depth}>
      {rays.map((ry, i) => {
        const a = opacity * (0.6 + 0.4 * Math.sin(f * 0.03 + ry.ph));
        const x0 = ry.x;
        const x1 = x0 + ry.w;
        const dx = H * ry.tilt;
        return (
          <polygon
            key={i}
            points={`${x0},0 ${x1},0 ${x1 + dx + ry.w * 2},${H} ${x0 + dx - ry.w},${H}`}
            fill={color}
            opacity={a}
          />
        );
      })}
    </Layer>
  );
};

export const Dust: React.FC<{seed?: number; count?: number; color?: string; depth?: number; size?: number; speed?: number}> = ({
  seed = 11,
  count = 60,
  color = '#ffffff',
  depth = 1,
  size = 2.6,
  speed = 0.5,
}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const pts = Array.from({length: count}, () => ({
    x: r() * W,
    y: r() * H,
    s: 0.6 + r() * size,
    ph: r() * 6.28,
    sp: 0.4 + r() * speed,
  }));
  return (
    <Layer depth={depth}>
      {pts.map((p, i) => {
        const x = p.x + f * p.sp * 0.6 + Math.sin(f * 0.02 + p.ph) * 20;
        const y = p.y - f * p.sp * 0.3 + Math.cos(f * 0.015 + p.ph) * 12;
        return (
          <circle
            key={i}
            cx={((x % W) + W) % W}
            cy={((y % H) + H) % H}
            r={p.s}
            fill={color}
            opacity={0.35 + 0.35 * Math.sin(f * 0.05 + p.ph)}
          />
        );
      })}
    </Layer>
  );
};

export const Fireflies: React.FC<{seed?: number; count?: number; depth?: number}> = ({seed = 8, count = 22, depth = 1}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const pts = Array.from({length: count}, () => ({
    x: r() * W,
    y: 300 + r() * 1200,
    ph: r() * 6.28,
    sp: 0.02 + r() * 0.03,
  }));
  return (
    <Layer depth={depth}>
      {pts.map((p, i) => {
        const x = p.x + Math.sin(f * p.sp + p.ph) * 60;
        const y = p.y + Math.cos(f * p.sp * 0.8 + p.ph) * 40;
        const on = 0.4 + 0.6 * Math.max(0, Math.sin(f * 0.11 + p.ph * 3));
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={11} fill={COL.glowGreen} opacity={0.18 * on} />
            <circle cx={x} cy={y} r={3} fill="#eaffea" opacity={on} />
          </g>
        );
      })}
    </Layer>
  );
};

/** Hanging vines that sway; leaves sit along each stem. */
export const Vines: React.FC<{
  seed?: number;
  count?: number;
  xMin?: number;
  xMax?: number;
  len?: number;
  y0?: number;
  color?: string;
  width?: number;
  sway?: number;
  depth?: number;
  leafColor?: string;
}> = ({
  seed = 21,
  count = 8,
  xMin = 0,
  xMax = W,
  len = 600,
  y0 = -20,
  color = COL.mossDark,
  width = 8,
  sway = 18,
  depth = 1,
  leafColor = COL.moss,
}) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const items = Array.from({length: count}, () => ({
    x: xMin + r() * (xMax - xMin),
    len: len * (0.5 + r() * 0.6),
    ph: r() * 6.28,
    w: width * (0.6 + r() * 0.8),
    sp: 0.02 + r() * 0.02,
    amp: sway * (0.6 + r() * 0.8),
  }));
  const N = 16;
  const at = (v: (typeof items)[number], t: number) => ({
    x: v.x + Math.sin(t * 3 + v.ph + f * v.sp) * v.amp * t,
    y: y0 + t * v.len,
  });
  return (
    <Layer depth={depth}>
      {items.map((v, i) => {
        const pts: string[] = [];
        for (let k = 0; k <= N; k++) {
          const p = at(v, k / N);
          pts.push(`${k === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
        }
        return (
          <g key={i}>
            <path d={pts.join(' ')} stroke={color} strokeWidth={v.w} fill="none" strokeLinecap="round" />
            {[3, 6, 9, 12, 15].map((k) => {
              const p = at(v, k / N);
              const side = k % 2 ? 1 : -1;
              return (
                <ellipse
                  key={k}
                  cx={p.x + side * 14}
                  cy={p.y}
                  rx={18}
                  ry={7}
                  transform={`rotate(${side * 30} ${p.x} ${p.y})`}
                  fill={leafColor}
                />
              );
            })}
          </g>
        );
      })}
    </Layer>
  );
};

/** A flock of birds leaving the canopy, starting at `start` (local frames). */
export const Birds: React.FC<{start: number; count?: number; x?: number; y?: number; color?: string}> = ({
  start,
  count = 7,
  x = 520,
  y = 700,
  color = '#1b2b1f',
}) => {
  const f = useCurrentFrame();
  const t = (f - start) / 90;
  if (t < 0) return null;
  return (
    <g>
      {Array.from({length: count}, (_, i) => {
        const ox = (hash(i * 3.3) - 0.5) * 220;
        const oy = (hash(i * 7.1) - 0.5) * 80;
        const px = x + ox + t * (200 + hash(i) * 260);
        const py = y + oy - t * (240 + hash(i + 9) * 200);
        const flap = Math.sin(f * 0.55 + i) * 6;
        return (
          <path
            key={i}
            d={`M ${-14} ${-flap} Q ${-7} ${-12 - flap} 0 0 Q ${7} ${-12 - flap} ${14} ${-flap}`}
            transform={`translate(${px} ${py}) scale(${1.2 + i * 0.05})`}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={clamp(1.2 - t * 0.6)}
          />
        );
      })}
    </g>
  );
};

/** Ground band with stones and tufts, scrolling with the camera depth. */
export const GroundBand: React.FC<{y: number; color: string; stoneColor?: string; depth?: number; seed?: number}> = ({
  y,
  color,
  stoneColor = '#6b5a3e',
  depth = 1,
  seed = 31,
}) => {
  const r = rng(seed);
  const stones = Array.from({length: 26}, () => ({x: -100 + r() * 1300, y: y + 20 + r() * 240, rx: 10 + r() * 26}));
  return (
    <Layer depth={depth}>
      <rect x={-300} y={y} width={W + 600} height={H - y + 400} fill={color} />
      {stones.map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.rx * 0.5} fill={stoneColor} opacity={0.7} />
      ))}
    </Layer>
  );
};
