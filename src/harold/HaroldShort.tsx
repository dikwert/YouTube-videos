import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './data/timeline.json';
import {SHOT_COMPONENTS} from './shots';
import {FONT} from './theme';

type Card = {s: number; e: number; words: {w: string; red: boolean}[]};

const YELLOW = '#FFD60A';
const RED = '#FF2B2B';

const useFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f = new FontFace(FONT, `url(${staticFile('harold/Montserrat-ExtraBold-latin.woff2')})`, {weight: '800'});
    f.load()
      .then((ff) => {
        document.fonts.add(ff);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

// Субтитры: фраза по 2–4 слова целиком (появление 100 мс), 72 px, жёлтый с чёрной обводкой 5 px; красные — ключевые
const Subtitles: React.FC<{cards: Card[]}> = ({cards}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const card = cards.find((c) => t >= c.s && t < c.e);
  if (!card) return null;
  const a = interpolate(t - card.s, [0, 0.1], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: '7.5%', width: '85%', top: '68%', transform: 'translateY(-50%)',
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, opacity: a}}>
      {card.words.map((w, i) => (
        <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.05,
          color: w.red ? RED : YELLOW, WebkitTextStroke: '5px #000', paintOrder: 'stroke fill' as any,
          textShadow: '0 6px 18px rgba(0,0,0,0.6)'}}>{w.w}</span>
      ))}
    </div>
  );
};

export const HaroldShort: React.FC = () => {
  useFont();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {timeline.shots.map((sh, i) => {
        const C = SHOT_COMPONENTS[sh.id];
        const from = Math.round(sh.start * fps);
        const to = Math.round(sh.end * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <C />
          </Sequence>
        );
      })}
      <Subtitles cards={timeline.cards as Card[]} />
      <Audio src={staticFile('harold/mix.wav')} />
    </AbsoluteFill>
  );
};
