import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './data/timeline.json';
import {SHOT_COMPONENTS} from './shots';

type Card = {s: number; e: number; words: {w: string; red: boolean}[]};
const YELLOW = '#FFD60A';
const RED = '#FF2B2B';
const FONT = 'MontserratEB';

// Шрифт Montserrat ExtraBold (latin) — грузим до первого кадра
const useFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f = new FontFace(FONT, `url(${staticFile('late/Montserrat-ExtraBold-latin.woff2')})`, {weight: '800'});
    f.load().then((ff) => {
      document.fonts.add(ff);
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};

// Субтитры: фраза целиком (появление 100 мс), 72 px, жёлтый с чёрной обводкой 5 px; красные — ключевые
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

// Удар при аресте: короткий поворот и затухающая тряска
const kick = (id: string, t: number) => {
  if (id !== 'ARREST') return {transform: undefined};
  const k = Math.max(0, 1 - (t - 0.2) / 0.5);
  const active = t > 0.2 && t < 0.9;
  const rot = active ? Math.sin(t * 60) * 3 * k : 0;
  const dx = active ? Math.sin(t * 90) * 14 * k : 0;
  const dy = active ? Math.cos(t * 75) * 10 * k : 0;
  return {transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1.02)`};
};

export const LateShort: React.FC = () => {
  useFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // белая вспышка после хука (на стыке OFFICE_HOOK и ARREST)
  const hookEnd = timeline.shots[1].start;
  const flash = interpolate(t, [hookEnd - 0.05, hookEnd + 0.06, hookEnd + 0.3], [0, 0.95, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {timeline.shots.map((sh, i) => {
        const C = SHOT_COMPONENTS[sh.id];
        const from = Math.round(sh.start * fps);
        const to = Math.round(sh.end * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <ShotFrame id={sh.id}>
              <C t={(frame - from) / fps} />
            </ShotFrame>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <Subtitles cards={timeline.cards as Card[]} />
      <Audio src={staticFile('late/mix.wav')} />
    </AbsoluteFill>
  );
};

// Обвязка шота: тряска для удара при аресте (внутри Sequence, t — локальное время)
const ShotFrame: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const st = kick(id, frame / fps);
  return <AbsoluteFill style={{transform: st.transform}}>{children}</AbsoluteFill>;
};
