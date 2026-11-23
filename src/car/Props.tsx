import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {rng, safeId} from '../lib/math';
import {H, W} from '../lib/theme';

/** A handheld camera, lens towards the viewer. The REC lamp blinks. */
export const CameraBody: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => {
  const f = useCurrentFrame();
  const rec = f % 30 < 18;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -60 -100 Q -60 -128 -40 -128 L 40 -128 Q 60 -128 60 -100" stroke="#0E110E" strokeWidth={10} fill="none" />
      <rect x={-150} y={-100} width={300} height={200} rx={28} fill="#1B1F1B" stroke="#0B0D0B" strokeWidth={4} />
      <rect x={-146} y={-96} width={292} height={36} rx={18} fill="#34403A" opacity={0.6} />
      <circle cx={0} cy={18} r={64} fill="#0C0F0D" stroke="#2C332C" strokeWidth={6} />
      <circle cx={0} cy={18} r={44} fill="#0F1E27" />
      <circle cx={-14} cy={6} r={12} fill="#FFFFFF" opacity={0.25} />
      <circle cx={112} cy={-70} r={8} fill={rec ? '#E23B2B' : '#4A1B17'} />
      <rect x={-196} y={-40} width={50} height={10} fill="#0B0D0B" />
    </g>
  );
};

/** A camera's screen: a frame, a timestamp and a REC lamp. The picture is a full-frame scene, scaled to the screen. */
export const CameraLCD: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  stamp: string;
  rec?: boolean;
  children: React.ReactNode;
}> = ({x, y, w, h, stamp, rec = false, children}) => {
  const f = useCurrentFrame();
  const lamp = f % 30 < 18;
  return (
    <g>
      <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} rx={30} fill="#17191A" stroke="#0B0C0C" strokeWidth={4} />
      <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${W} ${H}`}>
        {children}
      </svg>
      <text x={x + 20} y={y + 44} fontFamily="monospace" fontSize={30} fontWeight={700} fill="#F4F4EE">
        {stamp}
      </text>
      {rec && <circle cx={x + w - 34} cy={y + 38} r={10} fill={lamp ? '#E23B2B' : '#5A1714'} />}
      {rec && (
        <text x={x + w - 84} y={y + 46} fontFamily="monospace" fontSize={26} fill="#F4F4EE">
          REC
        </text>
      )}
    </g>
  );
};

/** A boot print in mud: the sole with its lugs and heel. Rotation in degrees; scale 1 is about 180 units long. */
export const Footprint: React.FC<{x: number; y: number; s: number; rot: number; opacity?: number}> = ({x, y, s, rot, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <path
      d="M 0 -80 C 30 -80 34 -44 32 -6 C 30 34 28 62 14 82 C 0 92 -14 92 -26 82 C -34 62 -32 30 -32 -6 C -34 -44 -30 -80 0 -80 Z"
      fill="#2A1E14"
      stroke="#4A3A26"
      strokeWidth={3}
    />
    {[-14, 14].map((lx) =>
      Array.from({length: 7}, (_, i) => (
        <rect key={`${lx}-${i}`} x={lx - 8} y={-64 + i * 20} width={16} height={11} rx={3} fill="#140E09" />
      )),
    )}
    <rect x={-22} y={46} width={44} height={22} rx={6} fill="#140E09" />
    <path d="M -28 -70 C -26 -84 -10 -90 0 -90" stroke="#9FB8C4" strokeWidth={3} fill="none" opacity={0.35} />
  </g>
);

/** Top-down mud: the ground, puddles, specks and ripples from the rain. Deterministic for a seed. */
export const MudGround: React.FC<{seed: number}> = ({seed}) => {
  const uid = safeId(useId());
  const f = useCurrentFrame();
  const r = rng(seed);
  const puddles = Array.from({length: 14}, () => ({x: r() * W, y: r() * H, rx: 40 + r() * 140, ry: 16 + r() * 46}));
  const specks = Array.from({length: 160}, () => ({x: r() * W, y: r() * H, rx: 2 + r() * 8, ry: 1 + r() * 4}));
  const ripples = Array.from({length: 18}, () => ({x: r() * W, y: r() * H, phase: r()}));
  return (
    <g>
      <defs>
        <radialGradient id={`m${uid}`} cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#4D3D2A" />
          <stop offset="1" stopColor="#1E1710" />
        </radialGradient>
      </defs>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={`url(#m${uid})`} />
      {specks.map((p, i) => (
        <ellipse key={`s${i}`} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#2A2016" opacity={0.6} />
      ))}
      {puddles.map((p, i) => (
        <ellipse key={`p${i}`} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#34444B" opacity={0.75} />
      ))}
      {ripples.map((p, i) => {
        const t = (f / 30 + p.phase * 2) % 1;
        return (
          <ellipse
            key={`r${i}`}
            cx={p.x}
            cy={p.y}
            rx={4 + t * 30}
            ry={2 + t * 9}
            fill="none"
            stroke="#C9D8E0"
            strokeWidth={1.5}
            opacity={(1 - t) * 0.45}
          />
        );
      })}
    </g>
  );
};
