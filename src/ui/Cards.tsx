import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp} from '../lib/math';
import {FPS} from '../lib/theme';

const cardStyle = (op: number): React.CSSProperties => ({
  position: 'absolute',
  top: 400,
  left: 60,
  width: 960,
  textAlign: 'center',
  fontFamily: 'Inter, Arial, sans-serif',
  opacity: op,
  pointerEvents: 'none',
});

/** "PART X" title, first second of every part, inside the safe area. */
export const PartTitle: React.FC<{n: number; title: string}> = ({n, title}) => {
  const f = useCurrentFrame();
  if (f >= FPS) return null;
  const op = Math.min(clamp(f / 6), clamp((FPS - f) / 8));
  return (
    <AbsoluteFill>
      <div style={cardStyle(op)}>
        <div
          style={{
            display: 'inline-block',
            padding: '18px 44px 14px',
            borderRadius: 26,
            background: 'rgba(0,0,0,0.42)',
          }}
        >
          <div style={{fontSize: 118, fontWeight: 900, color: '#fff', textShadow: '0 6px 0 #000'}}>PART {n}</div>
          <div style={{fontSize: 56, fontWeight: 800, color: '#ffe26b', textShadow: '0 4px 0 #000', marginTop: 4}}>
            {title}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** "PART X+1 →" (or "THE END?") in the last second of every part. `localFrame` is relative to the part's last second. */
export const PartEnd: React.FC<{label: string; total: number}> = ({label, total}) => {
  const f = useCurrentFrame();
  const start = total - FPS;
  if (f < start) return null;
  const t = f - start;
  const op = clamp(t / 6);
  return (
    <AbsoluteFill>
      <div style={cardStyle(op)}>
        <div
          style={{
            display: 'inline-block',
            padding: '18px 44px 14px',
            borderRadius: 26,
            background: 'rgba(0,0,0,0.5)',
            fontSize: 96,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 6px 0 #000',
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
