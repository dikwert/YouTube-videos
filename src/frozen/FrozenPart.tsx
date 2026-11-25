import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type Scene = {plate: string; fx: string; start: number; end: number};
type Card = {s: number; e: number; words: {w: string; red: boolean}[]};
type Data = {
  part: number; duration: number; recap: string | null; recap_hold: number;
  scenes: Scene[]; cards: Card[]; hud: {temp: number[][]; battery: number[][]};
};

const YELLOW = '#FFD60A';
const RED = '#FF2B2B';
const FONT = 'MontserratEB';

const useFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f = new FontFace(FONT, `url(${staticFile('frozen/Montserrat-ExtraBold-cyrillic.woff2')})`, {weight: '800'});
    f.load()
      .then((ff) => {
        document.fonts.add(ff);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

const pseudo = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Слой кадра: медленный наезд, тряска, мерцание — по эффекту сцены
const SceneLayer: React.FC<{scene: Scene; dur: number}> = ({scene, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = Math.min(1, frame / Math.max(1, dur));
  let scale = 1.02 + 0.05 * p;
  let tx = 0;
  let ty = 0;
  let rot = 0;
  let flick = 0;
  let fade = interpolate(frame, [0, 6, dur - 6, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (scene.fx === 'hook') {
    // первый кадр сразу на экране, без затемнения: хук в первые секунды
    fade = interpolate(frame, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  }
  if (scene.fx === 'hook') {
    scale = interpolate(frame, [0, 18], [1.12, 1.02], {extrapolateRight: 'clamp'}) + 0.03 * p;
  }
  if (scene.fx === 'sway') {
    rot = Math.sin(t * 1.2) * 0.35;
    tx = Math.sin(t * 0.7) * 6;
  }
  if (scene.fx === 'shake') {
    tx = Math.sin(frame * 0.9) * 3.5;
    ty = Math.cos(frame * 1.3) * 2.5;
  }
  if (scene.fx === 'knock') {
    const k = Math.exp(-((frame % 22) / 5));
    tx = Math.sin(frame * 1.7) * 9 * k;
    ty = Math.cos(frame * 2.1) * 6 * k;
  }
  if (scene.fx === 'flicker') {
    flick = pseudo(Math.floor(frame / 2)) * 0.35 + (pseudo(Math.floor(frame / 5)) > 0.7 ? 0.3 : 0);
  }
  return (
    <AbsoluteFill style={{opacity: fade, overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`, transformOrigin: '50% 50%'}}>
        <Img src={staticFile(`frozen/${scene.plate}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {scene.fx === 'flicker' && <AbsoluteFill style={{background: '#000', opacity: flick}} />}
    </AbsoluteFill>
  );
};

// Снег: падающие снежинки, детерминированно по кадру
const Snow: React.FC = () => {
  const frame = useCurrentFrame();
  const flakes = Array.from({length: 150}, (_, i) => {
    const x0 = pseudo(i * 3.1) * 1080;
    const sp = 1.2 + pseudo(i * 5.7) * 2.6;
    const y = ((pseudo(i * 9.3) * 1920 + frame * sp) % 1960) - 20;
    const x = x0 + Math.sin(frame * 0.03 + i) * 14;
    const r = 1.2 + pseudo(i * 7.9) * 2.6;
    const a = 0.35 + pseudo(i * 2.2) * 0.5;
    return <circle key={i} cx={x} cy={y} r={r} fill={`rgba(235,246,255,${a})`} />;
  });
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" style={{filter: 'blur(0.6px)'}}>{flakes}</svg>
    </AbsoluteFill>
  );
};

const lerp = (keys: number[][], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
  }
  return keys[keys.length - 1][1];
};

const Hud: React.FC<{hud: Data['hud']}> = ({hud}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const temp = Math.round(lerp(hud.temp, t));
  const bat = Math.round(lerp(hud.battery, t));
  const minus = (v: number) => (v < 0 ? `−${Math.abs(v)}` : `${v}`);
  return (
    <div style={{position: 'absolute', left: 40, top: 110, padding: '18px 26px', borderRadius: 22,
      background: 'rgba(8,14,20,0.55)', border: '2px solid rgba(160,220,235,0.35)', color: '#d7f3ff',
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: 1}}>
      <div style={{fontSize: 26, opacity: 0.75}}>ТЕМП.</div>
      <div style={{fontSize: 64, lineHeight: 1.05}}>{minus(temp)}°C</div>
      <div style={{fontSize: 26, opacity: 0.75, marginTop: 10}}>БАТАРЕЯ</div>
      <div style={{fontSize: 64, lineHeight: 1.05, color: bat <= 3 ? '#ff6b5e' : '#d7f3ff'}}>{bat}%</div>
    </div>
  );
};

// Субтитры: 2–4 слова, одним блоком, появляются целиком за 100 мс, по центру, на 68% высоты
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
          color: w.red ? RED : YELLOW, WebkitTextStroke: '5px #000', paintOrder: 'stroke fill',
          textShadow: '0 6px 18px rgba(0,0,0,0.6)', textTransform: 'uppercase'}}>{w.w}</span>
      ))}
    </div>
  );
};

const Recap: React.FC<{text: string; hold: number}> = ({text, hold}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const a = interpolate(t, [0, 0.2, hold - 0.3, hold], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: '8%', width: '84%', top: 240, padding: '28px 32px', borderRadius: 24,
      background: 'rgba(6,10,14,0.7)', color: '#e8f6ff', fontFamily: FONT, fontWeight: 800, fontSize: 46,
      lineHeight: 1.2, textAlign: 'center', opacity: a}}>{text}</div>
  );
};

export const FrozenPart: React.FC<{data: Data}> = ({data}) => {
  useFont();
  const {fps} = useVideoConfig();
  const label = `ЧАСТЬ ${data.part}`;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {data.scenes.map((s, i) => {
        const from = Math.round(s.start * fps);
        const to = Math.round(s.end * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <SceneLayer scene={s} dur={Math.max(1, to - from)} />
          </Sequence>
        );
      })}
      <Snow />
      <Hud hud={data.hud} />
      {data.recap && data.recap_hold > 0 && (
        <Sequence from={0} durationInFrames={Math.round(data.recap_hold * fps)}>
          <Recap text={data.recap} hold={data.recap_hold} />
        </Sequence>
      )}
      <Subtitles cards={data.cards} />
      <div style={{position: 'absolute', right: 40, top: 110, color: 'rgba(255,255,255,0.7)', fontFamily: FONT,
        fontWeight: 800, fontSize: 30, letterSpacing: 2}}>{label}</div>
      <Audio src={staticFile(`frozen/part${data.part}_mix.wav`)} />
    </AbsoluteFill>
  );
};
