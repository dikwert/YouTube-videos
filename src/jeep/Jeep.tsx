import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {hash, rng, safeId} from '../lib/math';

/** Old open jeep, side view. Ground line at y=0. `overgrown` adds vines and moss; `wet` adds mud and drips. */
export const JeepSide: React.FC<{x: number; y: number; s?: number; flip?: boolean; roll?: number; overgrown?: boolean; wet?: boolean; lights?: boolean}> = ({
  x,
  y,
  s = 1,
  flip = false,
  roll = 0,
  overgrown = false,
  wet = true,
  lights = false,
}) => {
  const uid = safeId(useId());
  const f = useCurrentFrame();
  const spin = (roll / 62) * (180 / Math.PI);
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} -62)`}>
      <circle r={64} fill="#0C0D0C" />
      <circle r={62} fill="none" stroke="#2A2D2A" strokeWidth={3} />
      <g transform={`rotate(${spin})`}>
        <circle r={38} fill="#6B7068" />
        <circle r={38} fill="none" stroke="#9AA096" strokeWidth={3} />
        {[0, 1, 2, 3, 4].map((k) => (
          <line key={k} x1={0} y1={0} x2={34} y2={0} stroke="#3B3F3A" strokeWidth={7} transform={`rotate(${k * 72})`} />
        ))}
      </g>
      <circle r={10} fill="#3B3F3A" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <defs>
        <linearGradient id={`body${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4D6B4A" />
          <stop offset="0.6" stopColor="#2F4A31" />
          <stop offset="1" stopColor="#15241A" />
        </linearGradient>
        <linearGradient id={`glass${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B9D6DC" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1B2A24" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={`beam${uid}`}>
          <stop offset="0" stopColor="#FFE7B0" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFE7B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={6} rx={236} ry={20} fill="#000" opacity={0.5} />
      {/* body */}
      <path d="M -200 -150 Q -200 -162 -186 -162 L 186 -158 Q 202 -158 202 -140 L 202 -86 Q 202 -72 186 -72 L -186 -72 Q -200 -72 -200 -86 Z" fill={`url(#body${uid})`} />
      <path d="M 40 -150 L 196 -150 L 196 -122 Q 196 -128 184 -128 L 66 -128 Z" fill="#3D5B3D" opacity={0.8} />
      <rect x={-200} y={-86} width={400} height={6} fill="#0A140D" opacity={0.7} />
      {/* windscreen and frame */}
      <path d="M 44 -246 L 70 -150 L 58 -150 L 32 -246 Z" fill={`url(#glass${uid})`} />
      <rect x={24} y={-250} width={10} height={104} fill="#1B2A1F" />
      <rect x={-96} y={-150} width={10} height={100} fill="#1B2A1F" />
      {/* doors and seat */}
      <rect x={-104} y={-146} width={120} height={80} rx={6} fill="none" stroke="#1B2A1F" strokeWidth={3} />
      <line x1={-44} y1={-146} x2={-44} y2={-66} stroke="#1B2A1F" strokeWidth={3} />
      <rect x={-62} y={-196} width={58} height={48} rx={8} fill="#131D16" />
      <rect x={-68} y={-150} width={80} height={10} rx={4} fill="#131D16" />
      {/* roof rack, jerrycan, spare wheel */}
      <rect x={-96} y={-252} width={130} height={8} rx={3} fill="#4B5148" />
      <rect x={-90} y={-246} width={6} height={22} fill="#4B5148" />
      <rect x={24} y={-246} width={6} height={22} fill="#4B5148" />
      <rect x={-84} y={-302} width={54} height={50} rx={8} fill="#7B6D3A" />
      <rect x={-72} y={-314} width={28} height={12} rx={4} fill="#4F4623" />
      <g transform="translate(-206 -92)">
        <circle r={40} fill="#0C0D0C" />
        <circle r={22} fill="#5A5F57" />
      </g>
      {/* lights */}
      <rect x={190} y={-118} width={16} height={28} rx={4} fill="#2A2D32" />
      <circle cx={196} cy={-134} r={8} fill={lights ? '#FFF2C6' : '#7B7A66'} />
      {lights && (
        <g>
          <path d="M 200 -134 L 620 -250 L 620 -20 Z" fill={`url(#beam${uid})`} />
        </g>
      )}
      {/* mud, scratches, wet highlights */}
      {wet && (
        <g>
          <ellipse cx={-90} cy={-82} rx={44} ry={12} fill="#4A3B26" opacity={0.85} />
          <ellipse cx={-10} cy={-78} rx={34} ry={10} fill="#4A3B26" opacity={0.75} />
          <ellipse cx={130} cy={-92} rx={36} ry={10} fill="#4A3B26" opacity={0.7} />
          <path d="M -150 -130 L -110 -120 M 90 -140 L 130 -132 M 150 -100 L 186 -96" stroke="#D8DDD0" strokeOpacity={0.25} strokeWidth={2} />
          {[0, 1, 2, 3].map((k) => (
            <ellipse key={k} cx={-180 + k * 110} cy={-150 + hash(k) * 20} rx={6} ry={12} fill="#CFE0D5" opacity={0.25} />
          ))}
        </g>
      )}
      {overgrown && (
        <g>
          <path d="M -200 -110 C -170 -170 -120 -150 -100 -220 M -40 -150 C -20 -200 40 -180 60 -260 M 100 -150 C 120 -210 160 -190 170 -250" stroke="#2D4A2A" strokeWidth={6} fill="none" />
          {Array.from({length: 22}, (_, i) => (
            <ellipse key={i} cx={-190 + (i * 17) % 380} cy={-180 + (i * 29) % 140} rx={12} ry={6} fill={i % 2 ? '#3B5B3A' : '#23402E'} transform={`rotate(${(i * 37) % 120} ${-190 + (i * 17) % 380} ${-180 + (i * 29) % 140})`} />
          ))}
          <path d="M -150 -6 C -110 -40 -80 -10 -40 -6 M 70 -4 C 100 -40 140 -20 170 -6" stroke="#4A3B26" strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
      )}
      {wheel(-120)}
      {wheel(120)}
    </g>
  );
};

/** Interior: windscreen with rain and wipers, dashboard with the GPS mount, and the wheel. Shoulders hidden by the dash. */
export const CockpitFrame: React.FC<{gpsSlot?: React.ReactNode; wipe?: boolean; rain?: number}> = ({gpsSlot, wipe = true, rain = 1}) => {
  const f = useCurrentFrame();
  const r = rng(91);
  const drops = Array.from({length: 46}, () => ({x: r() * 1080, y: r() * 1100, s: 3 + r() * 9}));
  const ang = wipe ? -40 + Math.sin(f * 0.09) * 40 : -30;
  return (
    <g>
      <path d="M -10 -10 L 1090 -10 L 1090 1190 L -10 1190 Z" fill="none" stroke="#0B100C" strokeWidth={120} />
      {drops.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r={d.s} fill="#D7E8DE" opacity={0.12 * rain} />
          <circle cx={d.x - d.s * 0.3} cy={d.y - d.s * 0.3} r={d.s * 0.3} fill="#FFFFFF" opacity={0.25 * rain} />
        </g>
      ))}
      <path d={`M 540 1180 L ${540 + Math.cos((ang * Math.PI) / 180) * 480} ${1180 - Math.sin((ang * Math.PI) / 180) * 480}`} stroke="#0B100C" strokeWidth={10} strokeLinecap="round" />
      <path d="M -40 1170 Q 540 1120 1120 1170 L 1120 1980 L -40 1980 Z" fill="#202622" />
      <path d="M -40 1172 Q 540 1122 1120 1172" stroke="#4A524D" strokeWidth={5} fill="none" />
      <rect x={70} y={1206} width={940} height={14} rx={6} fill="#171C19" />
      {gpsSlot}
      <ellipse cx={330} cy={1440} rx={170} ry={150} fill="none" stroke="#0E130F" strokeWidth={36} />
      <circle cx={330} cy={1440} r={44} fill="#191E1B" />
      <line x1={330} y1={1440} x2={160} y2={1440} stroke="#0E130F" strokeWidth={16} />
      <line x1={330} y1={1440} x2={500} y2={1440} stroke="#0E130F" strokeWidth={16} />
    </g>
  );
};
