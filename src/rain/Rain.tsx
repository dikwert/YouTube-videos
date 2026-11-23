import React from 'react';
import {useCurrentFrame} from 'remotion';
import {hash, rng} from '../lib/math';
import {W, H} from '../lib/theme';

type Layer = {n: number; len: number; w: number; speed: number; op: number; blur: number; seed: number};
const LAYERS: Layer[] = [
  {n: 210, len: 20, w: 1.1, speed: 44, op: 0.22, blur: 0, seed: 11},
  {n: 130, len: 34, w: 1.7, speed: 60, op: 0.32, blur: 0, seed: 23},
  {n: 52, len: 74, w: 3.0, speed: 84, op: 0.26, blur: 3, seed: 37},
];

/** Three layers of rain (thin far, mid, large blurred near), slanted by the wind, with ground splashes. */
export const Rain: React.FC<{strength?: number; wind?: number}> = ({strength = 1, wind = 0.22}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {LAYERS.map((L, li) => {
        const r = rng(L.seed);
        const drops = Array.from({length: L.n}, () => ({x: r() * (W + 300) - 150, y: r() * (H + 300) - 150}));
        const body = drops.map((d, i) => {
          const x = ((d.x + wind * L.speed * f * 1.0) % (W + 300) + (W + 300)) % (W + 300) - 150;
          const y = ((d.y + L.speed * f) % (H + 300) + (H + 300)) % (H + 300) - 150;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x - wind * L.len}
              y2={y - L.len}
              stroke="#CFE0D5"
              strokeOpacity={L.op * strength}
              strokeWidth={L.w}
              strokeLinecap="round"
            />
          );
        });
        return (
          <g key={li} style={L.blur ? {filter: `blur(${L.blur}px)`} : undefined}>
            {body}
          </g>
        );
      })}
      {Array.from({length: 26}, (_, i) => {
        const x = hash(i * 7.3) * W;
        const y = 1500 + hash(i * 3.1) * 420;
        const t = ((f + i * 9) % 22) / 22;
        return (
          <ellipse
            key={`s${i}`}
            cx={x}
            cy={y}
            rx={6 + t * 26}
            ry={2 + t * 6}
            fill="none"
            stroke="#CFE0D5"
            strokeOpacity={(1 - t) * 0.35 * strength}
            strokeWidth={1.4}
          />
        );
      })}
    </g>
  );
};

/** Full-frame lightning flash at the given seconds (about 4 frames of bright, then a fade). */
export const Lightning: React.FC<{times: number[]}> = ({times}) => {
  const f = useCurrentFrame();
  let a = 0;
  for (const t of times) {
    const k = f - Math.round(t * 30);
    if (k >= 0 && k < 4) a = Math.max(a, 0.55);
    else if (k >= 4 && k < 12) a = Math.max(a, 0.55 * (1 - (k - 4) / 8));
  }
  if (a <= 0) return null;
  return <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#DCEBFF" opacity={a} />;
};
