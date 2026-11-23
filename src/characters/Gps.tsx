import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {COL} from '../lib/theme';
import {clamp, hash, mixHex, safeId} from '../lib/math';

/**
 * THE GPS - phone-style navigator. Blue screen with a white arrow; when creepy it glitches and turns green.
 * Local coordinates: device centred on (0,0), about 380 x 660 units.
 */

export type GpsProps = {
  x: number;
  y: number;
  s?: number;
  rot?: number;
  /** Big instruction on the top bar, e.g. "TURN LEFT". Shown on screen, not as burned-in captions. */
  text?: string;
  arrow?: 'left' | 'right' | 'straight' | 'none';
  /** Signal bars 0..4. */
  signal?: number;
  /** 0 = blue navigator, 1 = fully green and creepy. */
  green?: number;
  /** 0 = straight route, 1 = route curled into a spiral. */
  spiral?: number;
  /** Glitch intensity 0..1. */
  glitch?: number;
  cracked?: boolean;
  /** Screen power 0..1. */
  power?: number;
  /** Shows a spinning recalculating ring instead of the arrow. */
  busy?: boolean;
};

const SW = 328;
const SH = 600;
const N = 28;

const route = Array.from({length: N}, (_, i) => {
  const t = i / (N - 1);
  return {x: 40 + 210 * t - Math.sin(t * Math.PI) * 40, y: 520 - 280 * t};
});

const spiralPts = Array.from({length: N}, (_, i) => {
  const t = i / (N - 1);
  const r = 150 * (1 - t) + 12;
  const ang = t * Math.PI * 5 + 0.3;
  return {x: 164 + r * Math.cos(ang), y: 300 + r * Math.sin(ang)};
});

const roads: string[] = [
  'M 0 200 L 120 230 L 200 180 L 328 210',
  'M 90 0 L 110 140 L 60 300 L 120 420 L 80 600',
  'M 250 0 L 240 160 L 300 330 L 260 600',
  'M 0 420 L 150 440 L 328 400',
];

export const Gps: React.FC<GpsProps> = (p) => {
  const f = useCurrentFrame();
  const id = safeId(useId());
  const s = p.s ?? 1;
  const green = clamp(p.green ?? 0);
  const glitch = clamp(p.glitch ?? 0);
  const spiral = clamp(p.spiral ?? 0);
  const power = clamp(p.power ?? 1);
  const signal = Math.round(p.signal ?? 4);
  const text = p.text ?? '';
  const arrow = p.arrow ?? 'straight';
  const bigText = text.length > 12 ? 26 : 38;

  const screenTop = mixHex('#1d5fd6', '#0e8f55', green);
  const screenBot = mixHex('#0b2a6b', '#063d22', green);
  const barTop = mixHex('#0b2a6b', '#063d22', green);
  const routeColor = mixHex('#ffffff', '#b8ffd6', green);

  const pts = route.map((r, i) => {
    const q = spiralPts[i];
    return {x: r.x + (q.x - r.x) * spiral, y: r.y + (q.y - r.y) * spiral};
  });
  const routeD = pts.map((q, i) => `${i === 0 ? 'M' : 'L'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');

  // Glitch slices: a few horizontal bands jump sideways on frames where the hash crosses the threshold.
  const slices = Array.from({length: 6}, (_, k) => {
    const on = hash(f * 1.7 + k * 13.1) < glitch * 0.8;
    return {
      on,
      y: hash(f * 3.3 + k * 7.7) * SH,
      h: 4 + hash(f * 5.1 + k) * 26,
      dx: (hash(f * 9.2 + k * 3.9) - 0.5) * 90 * glitch,
    };
  });
  const ghostOn = glitch > 0.05 && hash(f * 2.9) < 0.7;

  const glowColor = green > 0.5 ? COL.gpsGreen : COL.gpsBlue;

  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot ?? 0}) scale(${s})`}>
      <defs>
        <radialGradient id={`gg${id}`}>
          <stop offset="0%" stopColor={glowColor} stopOpacity={0.55 * power} />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`sc${id}`}>
          <rect x={-164} y={-300} width={SW} height={SH} rx={30} />
        </clipPath>
      </defs>
      <ellipse cx={0} cy={0} rx={300} ry={420} fill={`url(#gg${id})`} />
      <ellipse cx={0} cy={346} rx={120} ry={14} fill="#000" opacity={0.35} />

      {/* body */}
      <rect x={-190} y={-330} width={380} height={660} rx={52} fill={COL.gpsBezel} />
      <rect x={-186} y={-326} width={372} height={652} rx={48} fill="none" stroke="#4a4f5a" strokeWidth={3} />
      <circle cx={0} cy={-312} r={5} fill="#0a0b0e" />
      <rect x={176} y={-150} width={6} height={60} rx={3} fill="#2a2e36" />
      <rect x={-182} y={-80} width={6} height={44} rx={3} fill="#2a2e36" />

      {/* screen */}
      <g clipPath={`url(#sc${id})`}>
        <g transform="translate(-164 -300)">
          <rect x={0} y={0} width={SW} height={SH} fill={screenTop} />
          <rect x={0} y={SH * 0.4} width={SW} height={SH * 0.6} fill={screenBot} opacity={0.35} />

          {/* map */}
          {Array.from({length: 10}, (_, i) => (
            <line key={`gx${i}`} x1={i * 40} y1={0} x2={i * 40} y2={SH} stroke="#ffffff" strokeOpacity={0.07} strokeWidth={2} />
          ))}
          {Array.from({length: 11}, (_, i) => (
            <line key={`gy${i}`} x1={0} y1={i * 60} x2={SW} y2={i * 60} stroke="#ffffff" strokeOpacity={0.07} strokeWidth={2} />
          ))}
          {roads.map((d, i) => (
            <path key={i} d={d} stroke="#ffffff" strokeOpacity={0.2} strokeWidth={12} fill="none" strokeLinejoin="round" />
          ))}
          <path d={routeD} stroke={routeColor} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* player marker */}
          {!p.busy && (
            <g transform={`translate(${pts[0].x} ${pts[0].y})`}>
              <polygon points="0,-22 16,14 0,6 -16,14" fill="#ffffff" transform="rotate(-38)" />
            </g>
          )}
          {p.busy && (
            <circle
              cx={164}
              cy={300}
              r={40}
              fill="none"
              stroke={routeColor}
              strokeWidth={8}
              strokeDasharray="60 200"
              transform={`rotate(${f * 9} 164 300)`}
              strokeLinecap="round"
            />
          )}

          {/* top bar with instruction */}
          <rect x={0} y={0} width={SW} height={116} fill={barTop} />
          {arrow !== 'none' && (
            <g transform={`translate(52 58) ${arrow === 'right' ? 'scale(-1 1)' : ''}`}>
              {arrow === 'straight' ? (
                <polygon points="0,-30 26,6 10,6 10,30 -10,30 -10,6 -26,6" fill="#ffffff" />
              ) : (
                <polygon points="-30,0 -2,-28 -2,-12 26,-12 26,12 -2,12 -2,28" fill="#ffffff" />
              )}
            </g>
          )}
          <text
            x={arrow === 'none' ? SW / 2 : 100}
            y={arrow === 'none' ? 70 : 72}
            textAnchor={arrow === 'none' ? 'middle' : 'start'}
            fontFamily="Inter, Arial, sans-serif"
            fontWeight={900}
            fontSize={bigText}
            fill="#ffffff"
          >
            {text}
          </text>

          {/* bottom bar */}
          <rect x={0} y={SH - 80} width={SW} height={80} fill={barTop} />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={18 + i * 9}
              y={SH - 40 - (i + 1) * 6}
              width={6}
              height={(i + 1) * 6}
              rx={2}
              fill={i < signal ? '#ffffff' : '#ffffff'}
              opacity={i < signal ? 0.95 : 0.2}
            />
          ))}
          <text x={80} y={SH - 36} fontFamily="Inter, Arial, sans-serif" fontWeight={700} fontSize={20} fill="#ffffff" opacity={0.9}>
            {signal === 0 ? 'NO SIGNAL' : 'ETA 12 min'}
          </text>
          <text x={SW - 16} y={SH - 36} textAnchor="end" fontFamily="Inter, Arial, sans-serif" fontWeight={700} fontSize={20} fill="#ffffff" opacity={0.7}>
            3.2 km
          </text>

          {/* cracked glass */}
          {p.cracked && (
            <g stroke="#ffffff" strokeOpacity={0.75} strokeWidth={2} fill="none">
              <path d="M 250 0 L 236 60 L 262 112 L 244 180" />
              <path d="M 236 60 L 300 70" />
              <path d="M 262 112 L 318 96" />
              <path d="M 244 180 L 220 240 L 240 300" />
              <path d="M 0 500 L 52 470 L 40 430" />
            </g>
          )}

          {/* glitch: sliced bands and RGB ghosts */}
          {glitch > 0.02 && (
            <g>
              {ghostOn && (
                <path d={routeD} stroke="#ff004c" strokeWidth={6} fill="none" opacity={0.5 * glitch} transform={`translate(${-7 * glitch} 0)`} />
              )}
              {ghostOn && (
                <path d={routeD} stroke="#00ffd0" strokeWidth={6} fill="none" opacity={0.5 * glitch} transform={`translate(${7 * glitch} 0)`} />
              )}
              {slices.map(
                (sl, k) =>
                  sl.on && (
                    <rect
                      key={k}
                      x={sl.dx}
                      y={sl.y}
                      width={SW}
                      height={sl.h}
                      fill={mixHex('#00ffd0', '#c8ff00', hash(k))}
                      opacity={0.22 * glitch}
                    />
                  ),
              )}
            </g>
          )}

          {/* scanlines for the screen */}
          {Array.from({length: 60}, (_, i) => (
            <rect key={`sl${i}`} x={0} y={i * 10} width={SW} height={2} fill="#000" opacity={0.06} />
          ))}

          {/* power off overlay */}
          {power < 1 && <rect x={0} y={0} width={SW} height={SH} fill="#000" opacity={1 - power} />}
        </g>
      </g>
      <circle cx={0} cy={-300} r={0} fill="none" />
      <rect x={-186} y={-326} width={372} height={652} rx={48} fill="none" stroke={glowColor} strokeOpacity={0.25 * power} strokeWidth={4} />
    </g>
  );
};
