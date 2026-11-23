import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COL} from '../lib/theme';

/** THE JEEP - old green open-top jeep, side view. Ground line at y=0, centred on x=0. */
export const JeepSide: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  /** Distance travelled in px; spins the wheels. */
  roll?: number;
  /** 0 = fresh green, 1 = fully rusted with roots and moss. */
  rusted?: number;
  headlight?: boolean;
  /** 0..1 black overlay over the whole jeep (silhouette in the dark). */
  darken?: number;
  color?: string;
}> = ({x, y, s = 1, flip = false, roll = 0, rusted = 0, headlight = false, darken = 0, color = COL.jeep}) => {
  const spin = (roll / 62) * (180 / Math.PI);
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} -62)`}>
      <circle r={62} fill={COL.tire} />
      <g transform={`rotate(${spin})`}>
        <circle r={36} fill={COL.rim} />
        {[0, 1, 2, 3, 4].map((k) => (
          <line key={k} x1={0} y1={0} x2={30} y2={0} stroke="#6d737b" strokeWidth={6} transform={`rotate(${k * 72})`} />
        ))}
      </g>
      <circle r={9} fill="#5a6068" />
      <circle r={58} fill="none" stroke="#2a2a2a" strokeWidth={4} strokeDasharray="10 16" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} style={{filter: darken > 0 ? `brightness(${1 - darken})` : undefined}}>
      <ellipse cx={0} cy={4} rx={236} ry={18} fill="#000" opacity={0.35} />

      {/* wheel arches */}
      <path d="M -180 -62 A 62 62 0 0 1 -56 -62" fill="#1f3f26" transform="translate(-120 0) translate(0 0)" />
      <path d="M 56 -62 A 62 62 0 0 1 180 -62" fill="#1f3f26" transform="translate(0 0)" />

      {/* chassis and bonnet */}
      <rect x={-200} y={-150} width={400} height={86} rx={16} fill={color} />
      <path d="M 40 -150 L 200 -150 L 200 -110 Q 200 -124 186 -126 L 66 -126 Z" fill={COL.jeepLight} opacity={0.6} />
      <rect x={-200} y={-150} width={400} height={12} rx={6} fill={COL.jeepLight} opacity={0.5} />
      <rect x={-200} y={-72} width={400} height={8} fill="#1d3d24" />

      {/* doors and mud */}
      <rect x={-104} y={-146} width={120} height={80} rx={6} fill="none" stroke={COL.jeepDark} strokeWidth={3} />
      <line x1={-44} y1={-146} x2={-44} y2={-66} stroke={COL.jeepDark} strokeWidth={3} />
      <ellipse cx={-70} cy={-78} rx={34} ry={12} fill="#5b4226" opacity={0.75} />
      <ellipse cx={-22} cy={-84} rx={26} ry={9} fill="#5b4226" opacity={0.65} />
      <ellipse cx={120} cy={-96} rx={30} ry={10} fill="#5b4226" opacity={0.6} />

      {/* windscreen frame, seat, interior */}
      <rect x={-96} y={-150} width={10} height={100} fill={COL.jeepDark} />
      <path d="M 30 -246 L 62 -150 L 56 -150 L 24 -246 Z" fill="#c9f3ff" opacity={0.42} />
      <rect x={24} y={-250} width={10} height={104} fill={COL.jeepDark} />
      <rect x={-60} y={-196} width={58} height={48} rx={8} fill="#1d2a20" />
      <rect x={-68} y={-150} width={80} height={10} rx={4} fill="#1d2a20" />

      {/* roof rack with jerrycan */}
      <rect x={-96} y={-252} width={130} height={8} rx={3} fill="#4a4f55" />
      <rect x={-90} y={-246} width={6} height={22} fill="#4a4f55" />
      <rect x={24} y={-246} width={6} height={22} fill="#4a4f55" />
      <rect x={-84} y={-302} width={54} height={50} rx={8} fill="#8a7b3e" />
      <rect x={-72} y={-314} width={28} height={12} rx={4} fill="#5a4f26" />
      <path d="M -84 -282 L -102 -282" stroke="#5a4f26" strokeWidth={5} />

      {/* headlight and bumper */}
      <rect x={190} y={-118} width={16} height={28} rx={4} fill="#2a2d32" />
      <circle cx={196} cy={-134} r={8} fill={headlight ? '#fff7c4' : '#d8d2a4'} />
      {headlight && <circle cx={196} cy={-134} r={34} fill="#fff7c4" opacity={0.25} />}

      {wheel(-120)}
      {wheel(120)}

      {/* rust, moss and roots: fades in with `rusted` */}
      {rusted > 0 && (
        <g opacity={rusted}>
          <ellipse cx={-150} cy={-120} rx={34} ry={18} fill={COL.rust} opacity={0.85} />
          <ellipse cx={-40} cy={-132} rx={46} ry={16} fill={COL.rust} opacity={0.8} />
          <ellipse cx={60} cy={-138} rx={36} ry={12} fill={COL.rustDark} opacity={0.8} />
          <ellipse cx={150} cy={-112} rx={28} ry={14} fill={COL.rustLight} opacity={0.75} />
          <path d="M -200 -60 L -170 -40 L -120 -58 L -60 -36 L 10 -54 L 80 -40 L 140 -58 L 200 -44" stroke={COL.rustDark} strokeWidth={10} fill="none" opacity={0.6} />
          <ellipse cx={-22} cy={-258} rx={60} ry={12} fill={COL.moss} />
          <ellipse cx={-90} cy={-286} rx={30} ry={10} fill={COL.mossDark} />
          <ellipse cx={-30} cy={-160} rx={22} ry={8} fill={COL.moss} opacity={0.9} />
          <ellipse cx={100} cy={-170} rx={36} ry={10} fill={COL.moss} opacity={0.85} />
          <path d="M -150 -6 C -110 -40 -80 -10 -40 -6 M 70 -4 C 100 -40 140 -20 170 -6" stroke={COL.root} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M -150 -6 C -110 -40 -80 -10 -40 -6" stroke={COL.mossDark} strokeWidth={4} fill="none" opacity={0.7} />
          <path d="M -120 -128 C -100 -150 -84 -146 -70 -132" stroke={COL.root} strokeWidth={6} fill="none" />
          <path d="M 120 -120 C 140 -146 160 -140 176 -128" stroke={COL.root} strokeWidth={6} fill="none" />
        </g>
      )}
    </g>
  );
};

/** Top-down jeep for the aerial shot. Centred on (0,0), nose pointing up (-y). */
export const JeepTop: React.FC<{x: number; y: number; rot?: number; s?: number}> = ({x, y, rot = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={12} cy={14} rx={110} ry={180} fill="#000" opacity={0.3} />
    {[
      [-112, -120],
      [86, -120],
      [-112, 60],
      [86, 60],
    ].map(([wx, wy], i) => (
      <rect key={i} x={wx} y={wy} width={26} height={62} rx={8} fill={COL.tire} />
    ))}
    <rect x={-88} y={-150} width={176} height={300} rx={28} fill={COL.jeep} />
    <rect x={-88} y={-150} width={176} height={36} rx={14} fill={COL.jeepLight} opacity={0.6} />
    <rect x={-70} y={-22} width={140} height={22} rx={6} fill="#c9f3ff" opacity={0.6} />
    <rect x={-62} y={12} width={38} height={60} rx={8} fill="#1d2a20" />
    <rect x={24} y={12} width={38} height={60} rx={8} fill="#1d2a20" />
    <rect x={-82} y={-20} width={10} height={170} fill="#4a4f55" />
    <rect x={72} y={-20} width={10} height={170} fill="#4a4f55" />
    <rect x={-82} y={92} width={164} height={8} fill="#4a4f55" />
    <rect x={-40} y={98} width={80} height={44} rx={8} fill="#8a7b3e" />
    <circle cx={-64} cy={-158} r={8} fill="#fff7c4" />
    <circle cx={64} cy={-158} r={8} fill="#fff7c4" />
  </g>
);

/** Driver bust for the truck cab: friendly bald man, grey moustache, red cap. Shoulders at (0,0). */
export const Driver: React.FC<{x: number; y: number; s?: number; smile?: number}> = ({x, y, s = 1, smile = 1}) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f * 0.08) * 1.5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <path d="M -130 320 L -120 30 Q 0 -14 120 30 L 130 320 Z" fill="#3b6e8f" />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={-120 + k * 60} y={30} width={6} height={290} fill="#a53b3b" opacity={0.5} />
      ))}
      <rect x={-26} y={-60} width={52} height={90} fill={COL.skin} />
      <ellipse cx={-62} cy={-120} rx={14} ry={18} fill={COL.skin} />
      <ellipse cx={62} cy={-120} rx={14} ry={18} fill={COL.skin} />
      <ellipse cx={0} cy={-130} rx={60} ry={70} fill={COL.skin} />
      <ellipse cx={-14} cy={-178} rx={34} ry={16} fill={COL.skinLight} opacity={0.6} />
      {/* red cap */}
      <path d="M -66 -150 Q 0 -238 66 -150 Z" fill={COL.cap} />
      <path d="M -72 -164 Q 0 -146 84 -164 L 90 -150 Q 0 -128 -78 -150 Z" fill="#8f1717" />
      {/* brows, eyes with laugh lines */}
      <path d="M -38 -150 Q -24 -158 -10 -150" stroke="#9aa0a6" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M 10 -150 Q 24 -158 38 -150" stroke="#9aa0a6" strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={-24} cy={-130} rx={7} ry={6} fill={COL.ink} />
      <ellipse cx={24} cy={-130} rx={7} ry={6} fill={COL.ink} />
      <path d="M -40 -134 Q -34 -142 -28 -134" stroke={COL.skinShade} strokeWidth={2} fill="none" />
      <path d="M 28 -134 Q 34 -142 40 -134" stroke={COL.skinShade} strokeWidth={2} fill="none" />
      {/* grey moustache and smile */}
      <path
        d={`M -36 -92 Q -18 ${-102 - (1 - smile) * 4} 0 -92 Q 18 ${-102 - (1 - smile) * 4} 36 -92 Q 24 -76 0 -84 Q -24 -76 -36 -92 Z`}
        fill="#9aa0a6"
      />
      <path d={`M -22 -72 Q 0 ${-56 + (1 - smile) * 10} 22 -72`} stroke={COL.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Old white truck, side view. Ground line at y=0. */
export const TruckSide: React.FC<{x: number; y: number; s?: number; roll?: number}> = ({x, y, s = 1, roll = 0}) => {
  const spin = (roll / 64) * (180 / Math.PI);
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} -64)`}>
      <circle r={64} fill={COL.tire} />
      <g transform={`rotate(${spin})`}>
        <circle r={34} fill={COL.rim} />
        <line x1={-30} y1={0} x2={30} y2={0} stroke="#6d737b" strokeWidth={6} />
        <line x1={0} y1={-30} x2={0} y2={30} stroke="#6d737b" strokeWidth={6} />
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={260} ry={18} fill="#000" opacity={0.35} />
      {/* cargo box */}
      <rect x={-300} y={-330} width={240} height={250} rx={12} fill={COL.truckWhite} />
      <rect x={-290} y={-320} width={220} height={230} rx={8} fill={COL.truckShade} opacity={0.25} />
      <path d="M -300 -220 L -60 -220" stroke={COL.truckShade} strokeWidth={4} />
      {/* cab */}
      <path d="M -60 -300 L 40 -300 Q 90 -296 110 -240 L 140 -150 L 150 -90 L -60 -90 Z" fill={COL.truckWhite} />
      <path d="M -40 -292 L 36 -292 Q 74 -288 90 -240 L 50 -236 L -40 -236 Z" fill="#2f4a5c" opacity={0.85} />
      <rect x={-70} y={-236} width={6} height={110} fill={COL.truckShade} />
      <rect x={140} y={-150} width={34} height={60} rx={10} fill={COL.truckWhite} />
      <rect x={166} y={-140} width={14} height={36} rx={4} fill="#444a52" />
      <circle cx={158} cy={-180} r={8} fill="#fff7c4" />
      <rect x={-18} y={-196} width={14} height={38} rx={4} fill="#c8c6bb" />
      <rect x={-60} y={-112} width={200} height={14} fill="#555c63" opacity={0.6} />
      {/* rust streaks */}
      <path d="M -300 -120 L -250 -90 L -200 -110" stroke={COL.rust} strokeWidth={10} fill="none" opacity={0.5} />
      <path d="M -40 -150 L 0 -130 L 40 -150" stroke={COL.rust} strokeWidth={8} fill="none" opacity={0.4} />
      {wheel(-200)}
      {wheel(90)}
    </g>
  );
};

/** Rusted old car for the hall of vehicles. Ground line at y=0. */
export const OldCar: React.FC<{x: number; y: number; s?: number; flip?: boolean; rust?: number; color?: string}> = ({
  x,
  y,
  s = 1,
  flip = false,
  rust = 1,
  color = '#5d6b63',
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={4} rx={230} ry={16} fill="#000" opacity={0.4} />
    <path d="M -200 -60 L -200 -120 Q -190 -150 -150 -150 L -90 -150 L -50 -210 L 60 -210 L 110 -150 L 180 -140 Q 200 -130 200 -110 L 200 -60 Z" fill={color} />
    <path d="M -80 -150 L -46 -198 L 52 -198 L 92 -150 Z" fill="#2c3a38" />
    <path d="M -74 -150 L -44 -192 L 0 -192 L 0 -150 Z" fill="#9fd1d4" opacity={0.3} />
    <rect x={-200} y={-72} width={400} height={10} fill="#2b332f" />
    {[-120, 120].map((cx) => (
      <g key={cx} transform={`translate(${cx} -34)`}>
        <circle r={36} fill={COL.tire} />
        <circle r={18} fill="#6a5a4a" />
      </g>
    ))}
    {rust > 0 && (
      <g opacity={rust}>
        <ellipse cx={-120} cy={-120} rx={40} ry={18} fill={COL.rust} opacity={0.8} />
        <ellipse cx={40} cy={-100} rx={60} ry={20} fill={COL.rust} opacity={0.75} />
        <ellipse cx={130} cy={-140} rx={36} ry={14} fill={COL.rustDark} opacity={0.7} />
        <ellipse cx={-30} cy={-192} rx={34} ry={8} fill={COL.moss} />
        <path d="M -200 -60 C -150 -80 -60 -40 0 -62 C 60 -84 140 -40 200 -60" stroke={COL.rustDark} strokeWidth={8} fill="none" opacity={0.6} />
        <path d="M -150 -4 C -120 -40 -96 -20 -80 -4" stroke={COL.root} strokeWidth={7} fill="none" />
      </g>
    )}
  </g>
);

/** Rotting wooden cart for the hall of vehicles. Ground line at y=0. */
export const OldCart: React.FC<{x: number; y: number; s?: number; rust?: number}> = ({x, y, s = 1, rust = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={160} ry={14} fill="#000" opacity={0.4} />
    <rect x={-130} y={-120} width={240} height={70} rx={6} fill="#6e4a2a" />
    {[-100, -50, 0, 50, 90].map((x2) => (
      <line key={x2} x1={x2} y1={-120} x2={x2} y2={-50} stroke="#4f331d" strokeWidth={4} />
    ))}
    <path d="M 110 -90 L 230 -40 L 230 -30 L 110 -70 Z" fill="#5a3b20" />
    <g transform="translate(-84 -26)">
      <circle r={56} fill="#7a5530" stroke="#4f331d" strokeWidth={6} />
      <circle r={12} fill="#3d2814" />
    </g>
    <g transform="translate(70 -26)">
      <circle r={56} fill="#7a5530" stroke="#4f331d" strokeWidth={6} />
      <circle r={12} fill="#3d2814" />
    </g>
    {rust > 0 && <ellipse cx={20} cy={-124} rx={60} ry={10} fill={COL.moss} opacity={rust * 0.8} />}
  </g>
);
