import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {hash, safeId} from '../lib/math';

export type GpsMode = 'route' | 'nosignal' | 'recalc' | 'welcome' | 'off';
export type GpsProps = {x: number; y: number; s?: number; mode: GpsMode; glitch?: number; instruction?: string; rot?: number};

/** Built-in jeep navigator: a bezel, a glossy screen with a topographic map, route, compass, coordinates and rain on the glass. */
export const GpsUnit: React.FC<GpsProps> = ({x, y, s = 1, mode, glitch = 0, instruction = '300 ft · Turn left', rot = 0}) => {
  const f = useCurrentFrame();
  const uid = safeId(useId());
  const on = mode !== 'off';
  const glitchOn = glitch > 0.02 && hash(f * 1.7) < glitch * 0.9;
  const slices = Array.from({length: 5}, (_, k) => ({
    y: hash(f * 2.3 + k * 9) * 240,
    h: 3 + hash(f * 4.1 + k) * 14,
    dx: (hash(f * 6.7 + k * 3) - 0.5) * 60 * glitch,
  }));
  const drops = Array.from({length: 14}, (_, i) => ({x: hash(i * 5.3) * 480, y: ((hash(i * 2.7) * 240 + f * (1.2 + hash(i)))) % 240}));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <defs>
        <linearGradient id={`bz${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A302C" />
          <stop offset="1" stopColor="#0B0F0C" />
        </linearGradient>
        <linearGradient id={`sc${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={on ? '#17352A' : '#060A08'} />
          <stop offset="1" stopColor={on ? '#0A1C15' : '#030504'} />
        </linearGradient>
        <clipPath id={`cl${uid}`}>
          <rect x={-240} y={-150} width={480} height={300} rx={10} />
        </clipPath>
      </defs>
      {/* bezel */}
      <rect x={-272} y={-170} width={544} height={340} rx={24} fill={`url(#bz${uid})`} stroke="#4A524D" strokeWidth={3} />
      <rect x={-260} y={-158} width={520} height={316} rx={16} fill="none" stroke="#000" strokeOpacity={0.6} strokeWidth={4} />
      {/* screen */}
      <g clipPath={`url(#cl${uid})`}>
        <rect x={-240} y={-150} width={480} height={300} fill={`url(#sc${uid})`} />
        {on && (
          <g>
            {/* topographic lines */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path key={i} d={`M -240 ${-140 + i * 42} Q -120 ${-160 + i * 42 + i * 4} 0 ${-140 + i * 42} T 240 ${-130 + i * 42}`} stroke="#5E8C74" strokeOpacity={0.22} strokeWidth={1.4} fill="none" />
            ))}
            {/* river and roads */}
            <path d="M -240 110 Q -100 60 -10 90 T 240 40" stroke="#2F6F8F" strokeOpacity={0.55} strokeWidth={14} fill="none" />
            <path d="M -200 -90 Q -60 -40 40 -70 T 210 -20" stroke="#8FA69A" strokeOpacity={0.35} strokeWidth={4} fill="none" />
            {/* route */}
            {mode !== 'nosignal' && (
              <path d="M -60 150 Q -20 60 40 20 T 160 -90" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={14} fill="none" strokeLinecap="round" />
            )}
            {mode !== 'nosignal' && (
              <path d="M -60 150 Q -20 60 40 20 T 160 -90" stroke="#64E0FF" strokeWidth={6} fill="none" strokeLinecap="round" />
            )}
            {/* own position */}
            <polygon points="-60,150 -50,172 -60,166 -70,172" fill="#FFFFFF" transform="rotate(-18 -60 150)" />
            {/* compass */}
            <g transform="translate(176 96)">
              <circle r={34} fill="#06120D" stroke="#9FB6A8" strokeOpacity={0.5} strokeWidth={2} />
              <polygon points="0,-26 7,0 0,26 -7,0" fill="#FF4B3E" transform={`rotate(${Math.sin(f * 0.03) * 4})`} />
              <text y={-40} textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize={13} fontWeight={800} fill="#E8EEE9">N</text>
            </g>
            {/* top bar: next manoeuvre */}
            <rect x={-240} y={-150} width={480} height={74} fill="#06120D" opacity={0.85} />
            {mode === 'route' && (
              <g>
                <polygon points="-210,-106 -190,-126 -190,-116 -166,-116 -166,-96 -190,-96 -190,-86" fill="#FFFFFF" />
                <text x={-150} y={-110} fontFamily="Inter, Arial, sans-serif" fontSize={26} fontWeight={800} fill="#FFFFFF">{instruction}</text>
              </g>
            )}
            {mode === 'recalc' && (
              <g>
                <circle cx={-200} cy={-113} r={13} fill="none" stroke="#64E0FF" strokeWidth={4} strokeDasharray="40 60" transform={`rotate(${f * 12} -200 -113)`} />
                <text x={-176} y={-106} fontFamily="Inter, Arial, sans-serif" fontSize={26} fontWeight={800} fill="#FFFFFF">Recalculating...</text>
              </g>
            )}
            {mode === 'nosignal' && (
              <text x={-150} y={-106} fontFamily="Inter, Arial, sans-serif" fontSize={26} fontWeight={800} fill="#9AA9A0">No signal</text>
            )}
            {mode === 'welcome' && (
              <g>
                <text x={0} y={-10} textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize={30} fontWeight={900} fill="#FFFFFF">WELCOME BACK, ETHAN</text>
              </g>
            )}
            {/* bottom bar */}
            <rect x={-240} y={76} width={480} height={74} fill="#06120D" opacity={0.85} />
            <text x={-220} y={120} fontFamily="monospace" fontSize={20} fill="#C9D8CF">1°29'12"S  114°07'31"E</text>
            <text x={220} y={120} textAnchor="end" fontFamily="Inter, Arial, sans-serif" fontSize={20} fontWeight={700} fill="#C9D8CF">ETA 14:52 · 9.4 km</text>
            <text x={-220} y={142} fontFamily="Inter, Arial, sans-serif" fontSize={16} fill="#8FA69A">{mode === 'nosignal' ? 'GPS only' : 'Sungai Trail'}</text>
            {/* signal bars */}
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={160 + i * 10} y={130 - i * 6} width={6} height={6 + i * 6} rx={1} fill={mode === 'nosignal' ? '#3A4A40' : '#E8EEE9'} />
            ))}
          </g>
        )}
        {/* glare */}
        <path d="M -240 -150 L -40 -150 L -150 150 L -240 150 Z" fill="#FFFFFF" opacity={0.05} />
        {/* rain on the glass */}
        {drops.map((d, i) => (
          <circle key={i} cx={d.x - 240} cy={d.y - 150} r={2 + hash(i) * 2.5} fill="#E8F4EE" opacity={0.18} />
        ))}
        {/* glitch */}
        {glitchOn &&
          slices.map((sl, k) => (
            <rect key={k} x={-240 + sl.dx} y={-150 + sl.y} width={480} height={sl.h} fill="#64E0FF" opacity={0.25 + glitch * 0.25} />
          ))}
        {/* scanlines */}
        {Array.from({length: 30}, (_, i) => (
          <rect key={i} x={-240} y={-150 + i * 10} width={480} height={2} fill="#000" opacity={0.08} />
        ))}
      </g>
    </g>
  );
};
