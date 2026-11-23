import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {sec} from '../lib/theme';

export type Speaker = 'mason' | 'future' | 'gps' | 'truck' | 'voice';

/** One caption line. `s` and `e` are seconds from the start of the part. */
export type Line = {s: number; e: number; t: string; who?: Speaker};

const SPEAKER_COLOR: Record<Speaker, string> = {
  mason: '#ffffff',
  future: '#ffd0c4',
  gps: '#8fd8ff',
  truck: '#ffffff',
  voice: '#d6ffe4',
};

/**
 * Burned-in word-by-word captions. Bold white with a black outline, current word in yellow.
 * Sits in the lower-middle safe area, clear of the Shorts buttons and bottom text.
 */
export const Captions: React.FC<{lines: Line[]}> = ({lines}) => {
  const f = useCurrentFrame();
  const line = lines.find((l) => f >= sec(l.s) && f < sec(l.e));
  if (!line) return null;
  const words = line.t.split(' ');
  const start = sec(line.s);
  const per = (sec(line.e) - start) / words.length;
  const idx = Math.min(words.length - 1, Math.max(0, Math.floor((f - start) / per)));
  const base = SPEAKER_COLOR[line.who ?? 'mason'];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 70,
          width: 820,
          top: 1420,
          textAlign: 'center',
          fontFamily: 'Inter, Arial, sans-serif',
          fontWeight: 900,
          fontSize: 80,
          lineHeight: 1.18,
          textTransform: 'uppercase',
        }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              margin: '0 9px',
              color: i === idx ? '#ffe600' : base,
              WebkitTextStroke: '13px #000',
              paintOrder: 'stroke fill',
              textShadow: '0 6px 14px rgba(0,0,0,0.5)',
              transform: i === idx ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            {w}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
