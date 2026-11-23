import React, {useId} from 'react';
import {rng, safeId} from '../lib/math';

export type SuvProps = {
  x: number;
  y: number;
  /** Scale. The ground line is y = 0 in local units; the car is about 540 units long. */
  s: number;
  lights?: boolean;
  overgrown?: boolean;
  wet?: boolean;
  /** 0..1: how much mud and scratches. */
  dirt?: number;
  /** Degrees; spins the wheels when the car moves. */
  wheelRot?: number;
  seed?: number;
};

/** Boxy off-road body, facing right: flat nose, upright windows, no logos. */
const BODY = 'M -262 -70 L -268 -120 L -268 -228 L -262 -302 L 150 -302 L 232 -178 L 268 -166 L 274 -114 L 270 -70 Z';
const GLASS = 'M -240 -286 L 138 -286 L 212 -184 L -240 -184 Z';

/** A mud tyre with a block tread and a five-spoke steel rim. `rot` turns the whole wheel. */
const Wheel: React.FC<{cx: number; cy: number; rot: number}> = ({cx, cy, rot}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    <circle r={58} fill="#0D0F0C" />
    {Array.from({length: 14}, (_, i) => (
      <rect key={i} x={-7} y={-58} width={14} height={16} rx={3} fill="#1C201B" transform={`rotate(${(i * 360) / 14})`} />
    ))}
    <circle r={36} fill="#7F877F" />
    <circle r={27} fill="#4B524C" />
    {Array.from({length: 5}, (_, i) => (
      <rect key={i} x={-4} y={-27} width={8} height={54} fill="#949C94" transform={`rotate(${(i * 360) / 5})`} />
    ))}
    <circle r={9} fill="#2C302B" />
  </g>
);

/** Off-road SUV in side view: roof rack with a jerrycan, snorkel, spare wheel on the rear, winch on the front bumper. */
export const Suv: React.FC<SuvProps> = ({x, y, s, lights = false, overgrown = false, wet = false, dirt = 0.6, wheelRot = 0, seed = 7}) => {
  const uid = safeId(useId());
  const r = rng(seed);
  const mud = Array.from({length: 40}, () => ({
    x: -250 + r() * 500,
    y: -132 + r() * 74,
    rx: 10 + r() * 38,
    ry: 3 + r() * 9,
    o: 0.2 + r() * 0.5,
  }));
  const scratches = Array.from({length: 18}, () => {
    const x0 = -236 + r() * 440;
    const y0 = -262 + r() * 160;
    const len = 16 + r() * 40;
    const a = (r() - 0.5) * 0.9;
    return {x0, y0, x1: x0 + Math.cos(a) * len, y1: y0 + Math.sin(a) * len};
  });
  const moss = Array.from({length: 14}, () => ({x: -220 + r() * 400, y: -306 + r() * 6, rx: 14 + r() * 26, ry: 4 + r() * 5}));
  const leaves = Array.from({length: 26}, () => ({x: -240 + r() * 460, y: -332 + r() * 40, rot: r() * 180, rx: 7 + r() * 6}));

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A8A62" />
          <stop offset="0.45" stopColor="#56643F" />
          <stop offset="1" stopColor="#2B3323" />
        </linearGradient>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B5C60" />
          <stop offset="1" stopColor="#0C191C" />
        </linearGradient>
        <linearGradient id={`k${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {lights && <polygon points="276,-160 980,-330 980,40 276,-140" fill={`url(#k${uid})`} />}

      <path d={BODY} fill={`url(#b${uid})`} stroke="#171C14" strokeWidth={3} />
      <path d={GLASS} fill={`url(#g${uid})`} stroke="#0B1113" strokeWidth={3} />
      <path d="M -210 -276 L -60 -276 L -120 -200 L -220 -200 Z" fill="#FFFFFF" opacity={0.08} />
      <rect x={-116} y={-286} width={9} height={102} fill="#2A3324" />
      <rect x={12} y={-286} width={9} height={102} fill="#2A3324" />

      {/* door seams, handles, side mirror */}
      <line x1={-112} y1={-180} x2={-112} y2={-74} stroke="#232A20" strokeWidth={3} />
      <line x1={18} y1={-180} x2={18} y2={-74} stroke="#232A20" strokeWidth={3} />
      <rect x={-74} y={-156} width={22} height={6} rx={3} fill="#BFC6BD" />
      <rect x={44} y={-156} width={22} height={6} rx={3} fill="#BFC6BD" />
      <path d="M 154 -188 L 188 -214" stroke="#22281F" strokeWidth={6} />
      <rect x={186} y={-228} width={30} height={22} rx={6} fill="#2A3028" stroke="#171C14" strokeWidth={2} />

      {/* wheel arches cut into the body */}
      {[-166, 160].map((cx) => (
        <circle key={cx} cx={cx} cy={-58} r={74} fill="#0A0C09" />
      ))}

      {/* front: grille, bumper, winch, headlight; rear: taillight */}
      <rect x={262} y={-118} width={16} height={48} rx={3} fill="#161B15" />
      {[-110, -98, -86, -74].map((yy) => (
        <line key={yy} x1={265} y1={yy} x2={275} y2={yy} stroke="#2E362D" strokeWidth={2} />
      ))}
      <rect x={270} y={-108} width={12} height={18} fill="#2A2E28" />
      <circle cx={288} cy={-96} r={6} fill="none" stroke="#6F7670" strokeWidth={3} />
      <rect x={250} y={-168} width={22} height={24} rx={6} fill="#1A1E18" />
      <rect x={254} y={-164} width={16} height={18} rx={4} fill={lights ? '#FFF6D0' : '#9EA69A'} />
      <rect x={-270} y={-204} width={6} height={24} fill={lights ? '#E23B2B' : '#5A1714'} />

      {/* roof rack, jerrycan, snorkel */}
      <rect x={-160} y={-318} width={300} height={8} fill="#1D211C" />
      <rect x={-160} y={-322} width={300} height={4} fill="#3B4238" />
      {[-140, -20, 100].map((cx) => (
        <rect key={cx} x={cx} y={-326} width={8} height={10} fill="#262B24" />
      ))}
      <rect x={-124} y={-382} width={54} height={58} rx={6} fill="#7B6A3E" />
      <rect x={-118} y={-372} width={6} height={30} rx={3} fill="#9C8A58" opacity={0.5} />
      <rect x={-112} y={-392} width={30} height={9} rx={3} fill="#2A2A22" />
      <rect x={-96} y={-390} width={14} height={8} rx={2} fill="#2A2A22" />
      <rect x={166} y={-388} width={14} height={92} fill="#1F241D" />
      <rect x={160} y={-396} width={26} height={12} rx={4} fill="#14180F" />

      {/* spare wheel mounted on the rear */}
      <Wheel cx={-286} cy={-166} rot={0} />
      <rect x={-272} y={-190} width={12} height={44} fill="#262B24" />

      {/* wheels */}
      <Wheel cx={-166} cy={-58} rot={wheelRot} />
      <Wheel cx={160} cy={-58} rot={wheelRot} />

      {/* mud, scratches, wet gloss, moss, vines */}
      {mud.map((m, i) => (
        <ellipse key={i} cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill="#4B3B26" opacity={m.o * (0.4 + dirt * 0.6)} />
      ))}
      {scratches.map((c, i) => (
        <line key={i} x1={c.x0} y1={c.y0} x2={c.x1} y2={c.y1} stroke="#C9D0C6" strokeWidth={1.5} opacity={0.2 + dirt * 0.3} />
      ))}
      {wet && <path d="M -262 -302 L 150 -302" stroke="#FFFFFF" strokeWidth={4} opacity={0.35} />}
      {wet && <path d="M 150 -302 L 232 -178" stroke="#FFFFFF" strokeWidth={3} opacity={0.25} />}
      {overgrown &&
        moss.map((m, i) => (
          <ellipse key={`m${i}`} cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill="#3F6A3C" opacity={0.85} />
        ))}
      {overgrown && (
        <g>
          <path d="M -230 -306 C -190 -350 -110 -340 -60 -312 S 40 -300 90 -330" stroke="#2D5230" strokeWidth={4} fill="none" />
          <path d="M -200 -186 C -186 -240 -208 -270 -240 -286" stroke="#2D5230" strokeWidth={4} fill="none" />
          {leaves.map((l, i) => (
            <ellipse key={`l${i}`} cx={l.x} cy={l.y} rx={l.rx} ry={4} fill="#3E7340" transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
          ))}
        </g>
      )}
    </g>
  );
};
