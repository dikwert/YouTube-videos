import React, {useId} from 'react';
import {GpsUnit} from '../gps/GpsUnit';
import {safeId} from '../lib/math';

export type GpsMode = 'route' | 'nosignal' | 'recalc' | 'welcome' | 'off';
export type GpsProps = {mode: GpsMode; instruction?: string; glitch?: number};

/**
 * A car navigator on a suction-cup bracket: the arm, the cup on the glass,
 * the body's thickness under the bezel and a glare across the bezel.
 * Origin is the centre of the device, same as GpsUnit.
 */
export const Navigator: React.FC<{x: number; y: number; s: number} & GpsProps> = ({x, y, s, mode, instruction, glitch = 0}) => (
  <>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 -176 L 0 -236" stroke="#1A1F1D" strokeWidth={26} strokeLinecap="round" />
      <path d="M -9 -178 L -9 -234" stroke="#3E4745" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      <circle cx={0} cy={-292} r={62} fill="#101414" />
      <circle cx={0} cy={-292} r={44} fill="#232B2B" />
      <ellipse cx={-20} cy={-312} rx={20} ry={10} fill="#FFFFFF" opacity={0.22} />
      <rect x={-286} y={-150} width={572} height={366} rx={40} fill="#050707" />
      <rect x={-290} y={-160} width={580} height={24} rx={12} fill="#2A3231" opacity={0.7} />
    </g>
    <GpsUnit x={x} y={y} s={s} mode={mode} instruction={instruction} glitch={glitch} />
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <path d="M -250 -150 Q -120 -176 60 -166 L -40 -120 Q -170 -112 -250 -124 Z" fill="#FFFFFF" opacity={0.12} />
    </g>
  </>
);

/** Soft light from the screen, e.g. on a face in the dark. `screen` blend keeps it additive. */
export const ScreenGlow: React.FC<{cx: number; cy: number; r: number; opacity: number; color?: string}> = ({
  cx,
  cy,
  r,
  opacity,
  color = '#8FE3FF',
}) => {
  const id = `sg${safeId(useId())}`;
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={opacity} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </g>
  );
};
