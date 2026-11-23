import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {sec} from '../lib/theme';

/** Chapter card such as "6 HOURS EARLIER", centred in the frame's middle. */
export const ChapterCard: React.FC<{s: number; e: number; text: string}> = ({s, e, text}) => {
  const f = useCurrentFrame();
  const t0 = sec(s);
  const t1 = sec(e);
  if (f < t0 - 6 || f > t1 + 6) return null;
  const op = interpolate(f, [t0, t0 + 10, t1 - 10, t1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '47%',
        textAlign: 'center',
        fontFamily: 'Montserrat, Arial Black, sans-serif',
        fontWeight: 800,
        fontSize: 84,
        letterSpacing: 6,
        color: '#E8EEE9',
        opacity: op,
        textShadow: '0 6px 18px rgba(0,0,0,0.8)',
      }}
    >
      {text}
    </div>
  );
};
