import React from 'react';
import {useCurrentFrame} from 'remotion';
import {hash} from '../lib/math';

export type Expr = 'calm' | 'joke' | 'scared' | 'frozen';
export type EthanProps = {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  expr?: Expr;
  /** Mouth openness 0..1 (lip-sync). */
  mouth?: number;
  /** Eye direction -1..1. */
  look?: number;
  /** Walk cycle phase (radians). Omit for standing still. */
  walk?: number;
  armL?: number;
  armR?: number;
  /** Camera light on. */
  rec?: boolean;
  /** Head roll in degrees. */
  tilt?: number;
  /** Rim light from this side. */
  rim?: 'left' | 'right';
  opacity?: number;
};

const HEAD_R = 37;
/** Ethan Cole, 28, about 7.5 heads tall (about 560 units). Feet at (0,0), +y down. */
export const Ethan: React.FC<EthanProps> = (p) => {
  const f = useCurrentFrame();
  const s = p.s ?? 1;
  const sx = (p.flip ? -1 : 1) * s;
  const expr: Expr = p.expr ?? 'calm';
  const breathe = Math.sin(f * (expr === 'scared' ? 0.32 : 0.11)) * (expr === 'scared' ? 0.02 : 0.008);
  const bob = p.walk !== undefined ? -Math.abs(Math.sin(p.walk)) * 6 : Math.sin(f * 0.11) * 1.5;
  const blink = (f + 17) % 150 < 4 ? 0.1 : 1;
  const legL = p.walk !== undefined ? 16 * Math.sin(p.walk) : 0;
  const legR = p.walk !== undefined ? -16 * Math.sin(p.walk) : 0;
  const armL = p.armL ?? (p.walk !== undefined ? 16 * Math.sin(p.walk + Math.PI) : 6);
  const armR = p.armR ?? (p.walk !== undefined ? -16 * Math.sin(p.walk + Math.PI) : -6);
  const mouth = Math.min(1, Math.max(0, p.mouth ?? (expr === 'scared' ? 0.6 : 0)));
  const pupil = expr === 'scared' ? 6.5 : 4.5;
  const look = p.look ?? 0;
  const tremor = expr === 'scared' ? (hash(f * 2.7) - 0.5) * 2.2 : 0;
  const rimX = p.rim === 'left' ? -1 : 1;
  const skin = '#C98E6B';
  const jacket = '#1D2822';
  const jacketHi = '#3A4A41';
  return (
    <g transform={`translate(${p.x + tremor} ${p.y + bob}) scale(${sx} ${s})`} opacity={p.opacity ?? 1}>
      <ellipse cx={0} cy={4} rx={92} ry={14} fill="#000" opacity={0.45} />
      {/* backpack behind the torso */}
      <path d="M -88 -430 Q -110 -360 -96 -300 L -96 -250 L 96 -250 L 96 -300 Q 110 -360 88 -430 Z" fill="#2B3A2E" />
      <path d="M -96 -340 L -60 -330 M 96 -340 L 60 -330" stroke="#1A241D" strokeWidth={6} />
      {/* legs: wet olive cargo pants and boots */}
      <g transform={`translate(-34 -250) rotate(${legL})`}>
        <path d="M -28 0 L 28 0 L 24 150 L -22 150 Z" fill="#2E3A2A" />
        <path d="M -10 20 L -12 130 M 14 40 L 16 120" stroke="#000" strokeOpacity={0.25} strokeWidth={2} />
        <path d="M -24 150 L 22 150 L 26 176 L -28 176 Z" fill="#2A1E14" />
      </g>
      <g transform={`translate(34 -250) rotate(${legR})`}>
        <path d="M -28 0 L 28 0 L 24 150 L -22 150 Z" fill="#2E3A2A" />
        <path d="M -10 20 L -12 130 M 14 40 L 16 120" stroke="#000" strokeOpacity={0.25} strokeWidth={2} />
        <path d="M -24 150 L 22 150 L 26 176 L -28 176 Z" fill="#2A1E14" />
      </g>
      <ellipse cx={-22} cy={-4} rx={22} ry={6} fill="#5A4A34" opacity={0.7} />
      {/* torso: wet dark jacket with a zip, folds and a rim light */}
      <g transform={`translate(0 -360) scale(1 ${1 + breathe}) translate(0 360)`}>
        <path d="M -78 -420 Q 0 -440 78 -420 L 84 -250 Q 0 -238 -84 -250 Z" fill={jacket} />
        <path d="M -40 -400 Q -36 -330 -44 -262 M 26 -398 Q 32 -330 24 -262 M -4 -402 L -4 -254" stroke="#000" strokeOpacity={0.4} strokeWidth={2.5} fill="none" />
        <path d={`M ${rimX * 74} -410 L ${rimX * 80} -262`} stroke={jacketHi} strokeWidth={5} strokeOpacity={0.7} />
        <path d="M 0 -424 L 0 -254" stroke="#8C9A8F" strokeWidth={2} strokeOpacity={0.5} />
        <rect x={-54} y={-330} width={34} height={26} rx={4} fill="#17201A" />
        <rect x={20} y={-330} width={34} height={26} rx={4} fill="#17201A" />
      </g>
      {/* action camera on a chest mount */}
      <rect x={-30} y={-398} width={60} height={42} rx={8} fill="#1A1D1C" stroke="#5A625C" strokeWidth={2} />
      <circle cx={0} cy={-377} r={12} fill="#060807" stroke="#7C8680" strokeWidth={3} />
      <circle cx={-4} cy={-381} r={3} fill="#8FD6FF" opacity={0.7} />
      {p.rec && <circle cx={20} cy={-392} r={4} fill="#FF3B30" opacity={Math.floor(f / 15) % 2 ? 1 : 0.2} />}
      {/* arms: sleeves, wet cuffs, hands */}
      <g transform={`translate(-80 -410) rotate(${armL})`}>
        <path d="M -20 0 Q 0 -6 20 0 L 18 130 L -18 130 Z" fill={jacket} />
        <path d="M -16 40 L 16 40" stroke="#000" strokeOpacity={0.3} strokeWidth={2} />
        <rect x={-19} y={122} width={38} height={16} rx={5} fill="#17201A" />
        <path d="M -16 138 L 16 138 L 13 210 L -13 210 Z" fill={skin} />
        <ellipse cx={0} cy={222} rx={16} ry={18} fill={skin} />
      </g>
      <g transform={`translate(80 -410) rotate(${armR})`}>
        <path d="M -20 0 Q 0 -6 20 0 L 18 130 L -18 130 Z" fill={jacket} />
        <path d="M -16 40 L 16 40" stroke="#000" strokeOpacity={0.3} strokeWidth={2} />
        <rect x={-19} y={122} width={38} height={16} rx={5} fill="#17201A" />
        <path d="M -16 138 L 16 138 L 13 210 L -13 210 Z" fill={skin} />
        <ellipse cx={0} cy={222} rx={16} ry={18} fill={skin} />
      </g>
      {/* neck and head */}
      <rect x={-17} y={-470} width={34} height={44} fill="#B07A59" />
      <g transform={`translate(0 -500) rotate(${p.tilt ?? 0})`}>
        {/* wet hair, flattened to the skull */}
        <path d={`M -${HEAD_R + 2} 10 C -${HEAD_R + 6} -40 -28 -${HEAD_R + 14} 2 -${HEAD_R + 16} C 30 -${HEAD_R + 14} ${HEAD_R + 6} -40 ${HEAD_R + 2} 10 C ${HEAD_R} -20 26 -30 4 -28 C -20 -30 -${HEAD_R} -18 -${HEAD_R + 2} 10 Z`} fill="#1A130E" />
        <path d="M -22 -40 Q 0 -54 18 -42" stroke="#3A2C22" strokeWidth={4} fill="none" opacity={0.7} />
        {/* ears */}
        <ellipse cx={-HEAD_R} cy={6} rx={8} ry={13} fill={skin} />
        <ellipse cx={HEAD_R} cy={6} rx={8} ry={13} fill={skin} />
        {/* face */}
        <path d={`M -${HEAD_R - 2} -6 C -${HEAD_R} -38 ${HEAD_R} -38 ${HEAD_R - 2} -6 C ${HEAD_R - 4} 30 18 ${HEAD_R + 12} 0 ${HEAD_R + 12} C -18 ${HEAD_R + 12} -${HEAD_R - 4} 30 -${HEAD_R - 2} -6 Z`} fill={skin} />
        <path d={`M ${HEAD_R * 0.5 * rimX} -20 Q ${HEAD_R * 0.9 * rimX} 10 ${HEAD_R * 0.45 * rimX} 34`} stroke="#8A5A40" strokeOpacity={0.35} strokeWidth={5} fill="none" />
        {/* stubble */}
        {Array.from({length: 40}, (_, i) => {
          const a = (i / 40) * Math.PI;
          return <circle key={i} cx={Math.cos(a) * 24} cy={22 + Math.sin(a) * 14} r={0.9} fill="#2A1C12" opacity={0.6} />;
        })}
        {/* eyes with lids */}
        {[-15, 15].map((ex, i) => (
          <g key={i} transform={`translate(${ex} -8) scale(1 ${blink})`}>
            <ellipse rx={8} ry={6} fill="#F3F1EA" stroke="#2A1C12" strokeWidth={1.5} />
            <circle cx={look * 2.5} cy={0} r={pupil * 0.6} fill="#1A130E" />
            <circle cx={look * 2.5 + 1.2} cy={-1.4} r={1} fill="#fff" />
            <path d="M -9 -1 Q 0 -9 9 -1" stroke="#2A1C12" strokeWidth={2} fill="none" />
          </g>
        ))}
        {/* brows: strained when scared */}
        <path d={`M -28 ${expr === 'scared' ? -28 : -24} Q -15 ${expr === 'scared' ? -40 : -32} -4 ${expr === 'scared' ? -26 : -24}`} stroke="#2A1C12" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M 4 ${expr === 'scared' ? -26 : -24} Q 15 ${expr === 'scared' ? -40 : -32} 28 ${expr === 'scared' ? -28 : -24}`} stroke="#2A1C12" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M 0 -4 Q -4 8 3 10" stroke="#8A5A40" strokeWidth={2} fill="none" />
        {/* mouth: lip-sync opening and expression */}
        {mouth > 0.05 ? (
          <ellipse cx={0} cy={26} rx={12} ry={3 + mouth * 9} fill="#4A1C18" />
        ) : expr === 'joke' ? (
          <path d="M -12 24 Q 0 34 12 24" stroke="#4A1C18" strokeWidth={3} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M -10 26 L 10 26" stroke="#4A1C18" strokeWidth={3} fill="none" strokeLinecap="round" />
        )}
        {expr === 'frozen' && <path d="M -10 26 L 10 26" stroke="#4A1C18" strokeWidth={3} fill="none" />}
      </g>
    </g>
  );
};
