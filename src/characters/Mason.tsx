import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COL} from '../lib/theme';
import {hash, rng} from '../lib/math';

/**
 * MASON - travel vlogger, ~28. Drawn in local coordinates: feet at (0,0), +y down, ~530 units tall.
 * FUTURE MASON reuses the exact same rig but thinner, with a full beard, torn shirt and frightened eyes.
 */

export type Expr = 'neutral' | 'grin' | 'frown' | 'scared' | 'shock' | 'relief' | 'determined' | 'awe';

export type MasonProps = {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  expr?: Expr;
  future?: boolean;
  /** Walk/run cycle phase in radians. Omit for idle. */
  phase?: number;
  moving?: 'walk' | 'run' | 'none';
  /** Explicit arm angles (degrees) override the automatic swing. */
  armL?: number;
  armR?: number;
  /** Eye direction -1..1. */
  look?: number;
  /** Head roll in degrees. */
  tilt?: number;
  shiver?: number;
  opacity?: number;
  blinkSeed?: number;
  /** Chest camera light: REC blinks while true. */
  rec?: boolean;
  /** Hides the chest camera (after it has been torn off). */
  noCam?: boolean;
};

const STUBBLE: [number, number][] = (() => {
  const r = rng(7);
  const out: [number, number][] = [];
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI;
    const d = Math.sqrt(r());
    out.push([Math.cos(a) * d * 34, 40 + Math.sin(a) * d * 20]);
  }
  return out;
})();

const browFor = (expr: Expr) => {
  switch (expr) {
    case 'grin':
      return {raise: 0.3, frown: -0.2};
    case 'frown':
      return {raise: -0.2, frown: 1};
    case 'scared':
      return {raise: 1, frown: 0.2};
    case 'shock':
      return {raise: 1.2, frown: 0};
    case 'relief':
      return {raise: 0.2, frown: -0.3};
    case 'determined':
      return {raise: -0.1, frown: 0.9};
    case 'awe':
      return {raise: 0.6, frown: -0.1};
    default:
      return {raise: 0, frown: 0};
  }
};

const Mouth: React.FC<{expr: Expr; future?: boolean}> = ({expr, future}) => {
  switch (expr) {
    case 'grin':
      return (
        <g>
          <path d="M -26 24 Q 0 60 26 24 Q 0 36 -26 24 Z" fill="#5a1d1d" />
          <path d="M -22 27 Q 0 40 22 27 L 20 31 Q 0 44 -20 31 Z" fill="#fffaf0" />
        </g>
      );
    case 'frown':
      return <path d="M -16 44 Q 0 30 16 44" stroke={COL.ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
    case 'scared':
      return <ellipse cx={0} cy={42} rx={11} ry={14} fill="#3a1212" />;
    case 'shock':
      return <ellipse cx={0} cy={44} rx={9} ry={13} fill="#3a1212" />;
    case 'relief':
      return <path d="M -18 30 Q 0 44 18 30" stroke={COL.ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
    case 'determined':
      return <path d="M -18 38 L 18 36" stroke={COL.ink} strokeWidth={5} strokeLinecap="round" />;
    case 'awe':
      return <ellipse cx={0} cy={40} rx={8} ry={9} fill="#3a1212" />;
    default:
      return <path d={future ? 'M -14 38 Q 0 42 14 38' : 'M -14 36 Q 0 40 14 36'} stroke={COL.ink} strokeWidth={3} fill="none" strokeLinecap="round" />;
  }
};

const Eye: React.FC<{x: number; y: number; blink: number; look: number; frightened: boolean}> = ({
  x,
  y,
  blink,
  look,
  frightened,
}) => (
  <g transform={`translate(${x} ${y}) scale(1 ${blink})`}>
    <ellipse rx={frightened ? 13 : 11} ry={frightened ? 12 : 10} fill={COL.white} stroke={COL.ink} strokeWidth={2} />
    <circle cx={look * 4} cy={0} r={frightened ? 3.5 : 6} fill={COL.ink} />
    <circle cx={look * 4 + 2} cy={-2} r={1.6} fill="#ffffff" />
  </g>
);

const Arm: React.FC<{x: number; a: number; hand?: 'open' | 'point'; shirt?: string}> = ({x, a, hand = 'open', shirt = COL.shirt}) => (
  <g transform={`translate(${x} -382) rotate(${a})`}>
    {/* upper sleeve, rolled cuff, forearm, hand */}
    <path d="M -21 0 Q 0 -6 21 0 L 19 70 L -19 70 Z" fill={shirt} />
    <path d="M -21 0 L -19 70" stroke={COL.shirtRoll} strokeOpacity={0.5} strokeWidth={3} fill="none" />
    <rect x={-20} y={58} width={40} height={18} rx={7} fill={COL.shirtRoll} />
    <path d="M -16 74 L 16 74 L 14 150 L -14 150 Z" fill={COL.skin} />
    <path d="M 8 80 L 12 146" stroke={COL.skinShade} strokeOpacity={0.5} strokeWidth={4} />
    {hand === 'point' ? (
      <g>
        <rect x={-10} y={140} width={20} height={34} rx={8} fill={COL.skin} />
        <rect x={-4} y={160} width={8} height={24} rx={4} fill={COL.skin} />
      </g>
    ) : (
      <circle cx={0} cy={166} r={17} fill={COL.skin} />
    )}
  </g>
);

const Leg: React.FC<{x: number; a: number; future: boolean}> = ({x, a, future}) => (
  <g transform={`translate(${x} -150) rotate(${a})`}>
    <rect x={-(future ? 18 : 21)} y={0} width={future ? 36 : 42} height={140} rx={18} fill={COL.skin} />
    <path d={`M ${future ? -4 : -6} 20 L ${future ? -3 : -4} 120`} stroke={COL.skinShade} strokeOpacity={0.4} strokeWidth={5} />
    <rect x={-26} y={122} width={52} height={36} rx={10} fill={COL.boot} />
    <rect x={-26} y={148} width={56} height={8} rx={4} fill="#2a1a10" />
  </g>
);

export const Mason: React.FC<MasonProps> = (p) => {
  const f = useCurrentFrame();
  const future = !!p.future;
  const s = p.s ?? 1;
  const sx = (p.flip ? -1 : 1) * s;
  const ph = p.phase ?? 0;
  const moving = p.moving ?? 'none';
  const legSwing = moving === 'none' ? 0 : (moving === 'run' ? 30 : 14) * Math.sin(ph);
  const armSwing = moving === 'none' ? 0 : (moving === 'run' ? 42 : 18) * Math.sin(ph + Math.PI);
  const breathe = Math.sin(f * 0.09) * 0.012;
  const bob = moving === 'none' ? Math.sin(f * 0.09) * 2 : -Math.abs(Math.sin(ph)) * 8;
  const blink = (f + (p.blinkSeed ?? 0)) % 120 < 4 ? 0.12 : 1;
  const armL = p.armL ?? 7 + armSwing;
  const armR = p.armR ?? -7 - armSwing;
  const expr = p.expr ?? 'neutral';
  const brow = browFor(expr);
  const by = -26 - 8 * brow.raise;
  const shiverX = p.shiver ? (hash(f * 2.3) - 0.5) * 2 * p.shiver : 0;
  const thin = future ? 0.84 : 1;
  const wear = future
    ? {shirt: '#8a6a44', shirtShade: '#67492d', khaki: '#7d6548'}
    : {shirt: COL.shirt, shirtShade: COL.shirtShade, khaki: COL.khaki};
  const frightened = future || expr === 'scared' || expr === 'shock';
  const look = p.look ?? 0;
  const recOn = p.rec ? Math.floor(f / 15) % 2 === 0 : false;

  return (
    <g transform={`translate(${p.x + shiverX} ${p.y + bob}) scale(${sx} ${s})`} opacity={p.opacity ?? 1}>
      <ellipse cx={0} cy={3} rx={96} ry={16} fill="#000" opacity={0.28} />

      <g transform={`scale(${thin} 1)`}>
        {/* backpack, behind everything */}
        <rect x={-100} y={-404} width={200} height={172} rx={42} fill={COL.pack} />
        <path d="M -60 -398 L -54 -236 M 60 -398 L 54 -236" stroke={COL.packLight} strokeWidth={6} />
        <rect x={-54} y={-340} width={108} height={36} rx={10} fill={COL.packLight} />

        {/* legs + khaki shorts */}
        <Leg x={-30} a={-legSwing} future={future} />
        <Leg x={30} a={legSwing} future={future} />
        <path d="M -80 -236 L 80 -236 Q 86 -196 84 -150 L 6 -150 Q 0 -170 -6 -150 L -84 -150 Q -86 -196 -80 -236 Z" fill={wear.khaki} />
        <path d="M -40 -200 L -44 -158 M 40 -200 L 44 -158" stroke={COL.khakiShade} strokeWidth={3} />
        <rect x={-80} y={-242} width={160} height={10} rx={4} fill="#5a4026" />

        {/* torso: orange shirt, slightly breathing */}
        <g transform={`translate(0 -232) scale(1 ${1 + breathe}) translate(0 232)`}>
          <path d="M -78 -392 Q 0 -410 78 -392 L 80 -236 Q 0 -226 -80 -236 Z" fill={wear.shirt} />
          <path d="M 40 -390 L 78 -392 L 80 -236 L 46 -238 Z" fill={wear.shirtShade} opacity={0.45} />
          <path d="M -76 -386 L -78 -240" stroke="#ffd7a0" strokeOpacity={0.55} strokeWidth={3} />
          <path d="M -16 -402 L 0 -372 L 16 -402 Z" fill={COL.shirtShade} />
          {future && (
            <g>
              <path d="M -80 -300 L -58 -292 L -68 -268 L -84 -276 Z" fill={COL.skin} />
              <path d="M 62 -330 L 80 -326 L 74 -300 L 60 -306 Z" fill={COL.skin} />
              <path d="M -80 -236 L -66 -244 L -58 -228 L -74 -222 Z" fill={COL.shirtShade} />
              <path d="M 80 -236 L 66 -246 L 60 -230 L 76 -224 Z" fill={COL.shirtShade} />
            </g>
          )}
        </g>

        {/* neck */}
        <rect x={-18} y={-424} width={36} height={34} fill={COL.skinShade} />

        {/* arms over the shirt */}
        <Arm x={-78} a={armL} shirt={wear.shirt} />
        <Arm x={78} a={armR} shirt={wear.shirt} hand={p.armR !== undefined && p.armR > 40 ? 'point' : 'open'} />

        {/* chest-mounted action camera + strap */}
        {!p.noCam && (
          <g>
            <path d="M -60 -392 L -26 -340 M 60 -392 L 26 -340" stroke="#2b2f33" strokeWidth={6} />
            <rect x={-27} y={-337} width={54} height={38} rx={8} fill="#202326" />
            <circle cx={0} cy={-318} r={11} fill="#0c0e10" stroke="#5b6470" strokeWidth={3} />
            <circle cx={-3} cy={-321} r={3} fill="#8fd6ff" opacity={0.7} />
            {recOn && <circle cx={18} cy={-332} r={3.5} fill="#ff3b30" />}
          </g>
        )}

        {/* head */}
        <g transform={`translate(0 -478) rotate(${p.tilt ?? 0})`}>
          <ellipse cx={-57} cy={4} rx={12} ry={16} fill={COL.skin} />
          <ellipse cx={57} cy={4} rx={12} ry={16} fill={COL.skin} />
          {/* hair behind */}
          <path d="M -62 8 C -70 -52 -40 -98 0 -96 C 40 -98 70 -56 64 8 C 54 -24 42 -36 26 -44 L 20 -22 L 10 -52 L -6 -32 L -18 -62 L -34 -38 L -46 -16 C -52 -12 -58 -4 -62 8 Z" fill={COL.hair} />
          <ellipse cx={0} cy={0} rx={56} ry={64} fill={COL.skin} />
          <ellipse cx={30} cy={6} rx={22} ry={56} fill={COL.skinShade} opacity={0.22} />
          {/* front hair tufts */}
          <path d="M -58 -18 C -44 -64 -10 -72 6 -66 C -6 -56 2 -44 -4 -36 C 10 -46 22 -50 34 -48 C 44 -40 54 -28 58 -12 C 40 -36 20 -34 6 -26 C -10 -20 -30 -18 -58 -18 Z" fill={COL.hairLight} />
          {/* stubble, or a full beard for Future Mason */}
          {future ? (
            <path d="M -54 -16 Q -60 56 -28 74 Q 0 88 28 74 Q 60 56 54 -16 Q 40 22 30 30 Q 0 42 -30 30 Q -40 22 -54 -16 Z" fill={COL.beard} />
          ) : (
            STUBBLE.map(([sx2, sy2], i) => <circle key={i} cx={sx2} cy={sy2} r={1.3} fill={COL.stubble} opacity={0.5} />)
          )}
          {/* brows */}
          <path
            d={`M -38 ${by - brow.frown * 2} Q -22 ${by - 6 - brow.raise * 4} -8 ${by + brow.frown * 6}`}
            stroke={COL.hair}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M 8 ${by + brow.frown * 6} Q 22 ${by - 6 - brow.raise * 4} 38 ${by - brow.frown * 2}`}
            stroke={COL.hair}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
          <Eye x={-22} y={-8} blink={blink} look={look} frightened={frightened} />
          <Eye x={22} y={-8} blink={blink} look={look} frightened={frightened} />
          <path d="M 0 2 Q -5 14 4 16" stroke={COL.skinShade} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <Mouth expr={expr} future={future} />
        </g>
      </g>
    </g>
  );
};
