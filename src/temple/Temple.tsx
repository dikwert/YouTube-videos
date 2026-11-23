import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {rng, safeId} from '../lib/math';

/** Names carved on the navigators' screens (fictional). Index 13 is the empty screen. */
export const NAMES = [
  'MARCUS HALE', 'LENA WARD', 'TOMAS REY', 'ANNA KERR',
  'JOHN OKAFOR', 'MEI LIN', 'DAN PRICE', 'SARA WELLS',
  'IVAN ORLOV', 'NORA BELL', 'KAI ITO', 'RUTH ADAMS',
  'OMAR SAID', '', 'LUKAS BERG', 'ELLA MORSE',
  'PAUL DUNN', 'GRACE OYA', 'NOAH VEGA', 'IRIS CHEN',
];
export const BLANK = 13;

/** The stone temple from the outside: stepped base, a carved block with a dark doorway, carved faces, vines and moss. */
export const TempleFacade: React.FC<{x: number; y: number; s: number; seed?: number}> = ({x, y, s, seed = 41}) => {
  const uid = safeId(useId());
  const r = rng(seed);
  const moss = Array.from({length: 22}, () => ({x: -320 + r() * 640, y: -560 + r() * 540, rx: 14 + r() * 34, ry: 6 + r() * 14}));
  const leaves = Array.from({length: 40}, () => ({x: -340 + r() * 680, y: -600 + r() * 600, rot: r() * 180, rx: 9 + r() * 8}));
  const faces: [number, number][] = [[-190, -300], [190, -300], [-190, -190], [190, -190]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`st${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C8476" />
          <stop offset="1" stopColor="#4B5246" />
        </linearGradient>
        <radialGradient id={`door${uid}`} cx="0.5" cy="0.8" r="0.8">
          <stop offset="0" stopColor="#FFD9A0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#050605" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect x={-380} y={-120} width={760} height={40} rx={6} fill="#5B6258" />
      <rect x={-340} y={-80} width={680} height={40} rx={6} fill="#6A7165" />
      <rect x={-300} y={-40} width={600} height={40} rx={6} fill="#7C8476" />
      <rect x={-200} y={-560} width={400} height={150} rx={10} fill={`url(#st${uid})`} />
      <rect x={-270} y={-420} width={540} height={300} rx={12} fill={`url(#st${uid})`} />
      <path d="M -92 -120 L -92 -300 Q -92 -360 0 -360 Q 92 -360 92 -300 L 92 -120 Z" fill={`url(#door${uid})`} />
      {faces.map(([fx, fy], i) => (
        <g key={i}>
          <ellipse cx={fx} cy={fy} rx={34} ry={42} fill="#4B5246" />
          <ellipse cx={fx - 12} cy={fy - 8} rx={5} ry={3} fill="#1E241D" />
          <ellipse cx={fx + 12} cy={fy - 8} rx={5} ry={3} fill="#1E241D" />
          <path d={`M ${fx - 14} ${fy + 18} Q ${fx} ${fy + 26} ${fx + 14} ${fy + 18}`} stroke="#1E241D" strokeWidth={4} fill="none" />
        </g>
      ))}
      <path d="M -150 -540 L -120 -470 L -140 -420" stroke="#2A3026" strokeWidth={4} fill="none" />
      <path d="M 120 -560 Q 150 -480 110 -430" stroke="#3B3423" strokeWidth={6} fill="none" />
      {moss.map((m, i) => (
        <ellipse key={`m${i}`} cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill="#3F6A3C" opacity={0.8} />
      ))}
      <path d="M -260 -420 C -230 -380 -250 -300 -220 -250 S -200 -150 -240 -120" stroke="#2D5230" strokeWidth={5} fill="none" />
      <path d="M 240 -420 C 220 -370 250 -300 226 -240" stroke="#2D5230" strokeWidth={5} fill="none" />
      {leaves.map((l, i) => (
        <ellipse key={`l${i}`} cx={l.x} cy={l.y} rx={l.rx} ry={4} fill="#3E7340" transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
      ))}
    </g>
  );
};

/** A rusted navigator set into the wall. `name` shows when `lit`; the blank screen can take typed letters. */
export const WallDevice: React.FC<{x: number; y: number; name: string; lit: boolean; typed?: string; cursor?: boolean}> = ({
  x,
  y,
  name,
  lit,
  typed = '',
  cursor = false,
}) => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-84} y={-58} width={168} height={116} rx={12} fill="#6E4A2A" stroke="#3A2614" strokeWidth={4} />
      <rect x={-84} y={-58} width={168} height={116} rx={12} fill="#B06A32" opacity={0.22} />
      <rect x={-64} y={-40} width={128} height={80} rx={6} fill={lit ? '#14322B' : '#0A0E0C'} />
      {lit && name && (
        <text x={0} y={5} textAnchor="middle" fontFamily="monospace" fontSize={17} fontWeight={700} fill="#BFF3DD">
          {name}
        </text>
      )}
      {typed && (
        <text x={0} y={5} textAnchor="middle" fontFamily="monospace" fontSize={26} fontWeight={800} fill="#E8FFF4">
          {typed}
        </text>
      )}
      {cursor && blink && <rect x={typed ? 26 + typed.length * 8 : -6} y={-6} width={12} height={22} fill="#BFF3DD" />}
    </g>
  );
};
