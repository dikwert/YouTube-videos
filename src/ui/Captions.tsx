import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CAPTION_FONT} from '../lib/fonts';
import {sec} from '../lib/theme';
import {Piece, PartScript, buildPieces, HighlightKind} from '../script/model';

const YELLOW = '#FFD60A';
const OUTLINE = '6px'; // visible outline; WebkitTextStroke is centred, so the stroke is doubled
const SHADOW = '0 6px 14px rgba(0,0,0,0.6)';

const wordStyle = (hl: HighlightKind | undefined, f: number): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: 'inline-block',
    margin: '0 8px',
    color: YELLOW,
    WebkitTextStroke: `${Number(OUTLINE.replace('px', '')) * 2}px #000`,
    paintOrder: 'stroke fill',
    textShadow: SHADOW,
  };
  if (hl === 'danger') {
    const jx = Math.sin(f * 2.9) * 3;
    const jy = Math.cos(f * 3.7) * 2;
    return {
      ...base,
      color: '#FF1E1E',
      textShadow: `0 0 14px rgba(255,30,30,0.95), 0 0 30px rgba(255,30,30,0.7), ${SHADOW}`,
      transform: `translate(${jx}px, ${jy}px)`,
    };
  }
  if (hl === 'mystery') {
    return {
      ...base,
      color: '#FFFFFF',
      textShadow: `0 0 16px ${YELLOW}, 0 0 34px rgba(255,214,10,0.8), ${SHADOW}`,
      transform: 'scale(1.25)',
    };
  }
  return base;
};

/**
 * Burned-in captions: 2-4 words at a time, yellow ExtraBold with a black outline and shadow.
 * Each chunk pops in (0.8 -> 1.0 over 120 ms). Highlights are rare: red + shake for danger words,
 * white with a yellow glow at 1.25x for mystery words. Block sits in the lower third, above 75% of the frame.
 */
export const Captions: React.FC<{script: PartScript}> = ({script}) => {
  const f = useCurrentFrame();
  const pieces: Piece[] = buildPieces(script);
  const piece = pieces.find((p) => f >= sec(p.start) && f < sec(p.end));
  if (!piece) return null;
  const t0 = sec(piece.start);
  const pop = interpolate(f - t0, [0, 4], [0.8, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const alpha = interpolate(f - t0, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 1160,
          width: 960,
          height: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: `${CAPTION_FONT}, Arial Black, sans-serif`,
          fontWeight: 800,
          fontSize: 88,
          lineHeight: 1.12,
          textTransform: 'uppercase',
          opacity: alpha,
          transform: `scale(${pop})`,
          transformOrigin: '50% 50%',
        }}
      >
        <div>
          {piece.words.map((w, i) => (
            <span key={i} style={wordStyle(w.hl, f)}>
              {w.w}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
