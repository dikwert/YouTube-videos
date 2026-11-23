import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp, hash} from '../lib/math';

/** Flashlight cone from (x0,y0) toward (x1,y1). */
export const Beam: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  w0?: number;
  w1?: number;
  opacity?: number;
  color?: string;
}> = ({x0, y0, x1, y1, w0 = 10, w1 = 200, opacity = 0.5, color = '#fff6d8'}) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const pts = [
    [x0 + nx * w0, y0 + ny * w0],
    [x1 + nx * w1, y1 + ny * w1],
    [x1 - nx * w1, y1 - ny * w1],
    [x0 - nx * w0, y0 - ny * w0],
  ]
    .map((p) => p.map((v) => v.toFixed(1)).join(','))
    .join(' ');
  return (
    <g>
      <polygon points={pts} fill={color} opacity={opacity} />
      <ellipse cx={x1} cy={y1} rx={w1} ry={w1 * 0.6} fill={color} opacity={opacity * 0.6} />
    </g>
  );
};

/** Hand torch. (x,y) is the grip; `angle` points the lens (degrees, 0 = right). */
export const Flashlight: React.FC<{x: number; y: number; angle?: number; on?: boolean; flicker?: number}> = ({
  x,
  y,
  angle = 0,
  on = true,
  flicker = 0,
}) => {
  const f = useCurrentFrame();
  const fl = flicker > 0 ? 1 - flicker * hash(f * 4.3) * 0.6 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x={-10} y={-14} width={70} height={28} rx={10} fill="#2b2f36" />
      <rect x={-18} y={-18} width={14} height={36} rx={5} fill="#3e444e" />
      <rect x={52} y={-18} width={12} height={36} rx={4} fill="#3e444e" />
      <circle cx={60} cy={0} r={11} fill={on ? '#fff8d6' : '#3a3e46'} opacity={fl} />
      {on && <circle cx={60} cy={0} r={22} fill="#fff8d6" opacity={0.35 * fl} />}
    </g>
  );
};

/** Recorder screen overlays (REC, timecode, date, battery, play). Drawn on top of the video picture. */
export const CamUI: React.FC<{
  timecode: string;
  date?: string;
  rec?: boolean;
  playing?: boolean;
  dateScale?: number;
}> = ({timecode, date, rec = true, playing = true, dateScale = 1}) => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <g fontFamily="Inter, Arial, sans-serif" fontWeight={800}>
      {rec && blink && <circle cx={70} cy={70} r={14} fill="#ff2d2d" />}
      <text x={96} y={80} fontSize={38} fill="#ffffff">
        {rec ? 'REC' : 'PLAY'}
      </text>
      <text x={960} y={80} fontSize={40} fill="#ffffff" textAnchor="end">
        {timecode}
      </text>
      {date && (
        <text x={540} y={1500} fontSize={58 * dateScale} fill="#ffe26b" textAnchor="middle">
          {date}
        </text>
      )}
      <rect x={880} y={1800} width={96} height={44} rx={8} fill="none" stroke="#fff" strokeWidth={4} />
      <rect x={884} y={1804} width={56} height={36} rx={4} fill="#7dff9a" />
      <rect x={976} y={1814} width={6} height={16} fill="#fff" />
      {playing ? (
        <polygon points="120,1800 120,1844 158,1822" fill="#ffffff" opacity={0.85} />
      ) : (
        <g fill="#ffffff" opacity={0.85}>
          <rect x={118} y={1800} width={12} height={44} />
          <rect x={142} y={1800} width={12} height={44} />
        </g>
      )}
    </g>
  );
};

/** Falling flakes (rust, dust, leaves) from a rectangular zone; each flake starts at `start` (local frames). */
export const Flakes: React.FC<{
  x0: number;
  x1: number;
  y0: number;
  start: number;
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
  seed?: number;
}> = ({x0, x1, y0, start, count = 40, color = '#c4621f', speed = 5, size = 6, seed = 1}) => {
  const f = useCurrentFrame();
  const t0 = f - start;
  if (t0 < 0) return null;
  return (
    <g>
      {Array.from({length: count}, (_, i) => {
        const x = x0 + hash(i * 1.3 + seed) * (x1 - x0) + Math.sin(t0 * 0.05 + i) * 14;
        const delay = hash(i * 2.9 + seed) * 30;
        const t = Math.max(0, t0 - delay);
        const y = y0 + t * t * 0.03 * speed + t * speed * 0.4;
        const rot = t * (hash(i + seed) * 12 - 6);
        const alpha = clamp(1 - t / 90);
        return (
          <rect
            key={i}
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size * (0.5 + hash(i) * 0.6)}
            fill={color}
            opacity={alpha}
            transform={`rotate(${rot} ${x} ${y})`}
          />
        );
      })}
    </g>
  );
};

/** Glass shards flying out from (x,y) when `start` is reached. */
export const Shards: React.FC<{x: number; y: number; start: number; count?: number; color?: string; seed?: number}> = ({
  x,
  y,
  start,
  count = 14,
  color = '#bfe9ff',
  seed = 2,
}) => {
  const f = useCurrentFrame();
  const t = (f - start) / 30;
  if (t < 0) return null;
  return (
    <g>
      {Array.from({length: count}, (_, i) => {
        const a = hash(i * 5.1 + seed) * Math.PI * 2;
        const v = 180 + hash(i * 3.7 + seed) * 320;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 900 * t * t;
        const rot = t * (hash(i + seed) * 700 - 350);
        const s = 10 + hash(i * 9.1) * 22;
        return (
          <polygon
            key={i}
            points={`0,${-s} ${s * 0.6},${s * 0.4} ${-s * 0.5},${s * 0.6}`}
            transform={`translate(${px} ${py}) rotate(${rot})`}
            fill={color}
            opacity={clamp(1 - t / 2.2) * 0.9}
          />
        );
      })}
    </g>
  );
};

/** Radial impact flash. */
export const Flash: React.FC<{x: number; y: number; start: number; dur?: number; color?: string; r?: number}> = ({
  x,
  y,
  start,
  dur = 12,
  color = '#ffffff',
  r = 500,
}) => {
  const f = useCurrentFrame();
  const t = (f - start) / dur;
  if (t < 0 || t > 1) return null;
  return <circle cx={x} cy={y} r={r * (0.4 + t)} fill={color} opacity={0.7 * (1 - t)} />;
};
