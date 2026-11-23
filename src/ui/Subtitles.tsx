import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {Card} from '../script/types';
import {SUB_Y, sec} from '../lib/theme';

/**
 * Subtitles, one rule set: a single font size, yellow with a 5 px black outline and a soft shadow,
 * keywords in plain red (no glow, no scaling, no shake), the whole phrase fades in at once (100 ms),
 * 2-4 words in at most two lines, centred at 68% of the frame height and at most 85% of its width.
 */
export const Subtitles: React.FC<{cards: Card[]}> = ({cards}) => {
  const f = useCurrentFrame();
  let card = cards.find((c) => f >= sec(c.s) && f < sec(c.e));
  if (!card) {
    // A gap of a few milliseconds between two phrases: hold the previous one so the text never blinks out.
    const prev = [...cards].reverse().find((c) => f >= sec(c.s));
    if (prev && f - sec(prev.e) < 5) card = prev;
  }
  if (!card) return null;
  // A phrase that starts at 0 s is already opaque on the first frame.
  const alpha = sec(card.s) === 0 ? 1 : interpolate(f - sec(card.s), [0, 3], [0.5, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const keyWords = (card.keys ?? []).flatMap((k) => k.split(' '));
  const words = card.text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: '7.5%',
        width: '85%',
        top: SUB_Y,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px 18px',
        textAlign: 'center',
        fontFamily: 'Montserrat, Arial Black, sans-serif',
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.1,
        textTransform: 'uppercase',
        opacity: alpha,
        pointerEvents: 'none',
      }}
    >
      {words.map((w, i) => {
        const bare = w.replace(/[^A-Z'\-]/g, '');
        const isKey = keyWords.includes(bare);
        return (
          <span
            key={i}
            style={{
              color: isKey ? '#FF2B2B' : '#FFD60A',
              WebkitTextStroke: '10px #000',
              paintOrder: 'stroke fill',
              textShadow: '0 4px 12px rgba(0,0,0,0.6)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
