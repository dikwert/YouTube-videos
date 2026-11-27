import React from 'react';

// Персонажи — 2D «bean-head» (как в cartoon-3d-short): боб-голова, палочные конечности, точечные кисти,
// тушь персонажа #241726. Высота — 700 условных единиц (3.5 головы); начало координат — между ступнями.
export const CINK = '#241726';

export type Look = {suit: string; pants?: string; shirt?: string; hair?: string; skin?: string; hat?: 'bowler' | 'cap' | 'boater' | 'tophat' | 'wig' | 'none'; bun?: boolean; dress?: string; glasses?: boolean; tie?: string; apron?: boolean};
export type Pose = 'stand' | 'walk' | 'sit' | 'hold' | 'point' | 'shrug' | 'raise' | 'clap' | 'sip' | 'lean' | 'gavel' | 'sneeze';
export type Face = 'neutral' | 'shock' | 'smile' | 'stern' | 'nervous' | 'wink' | 'proud' | 'sneeze';

export const LOOKS: Record<string, Look> = {
  walter: {suit: '#3b4a66', pants: '#2b3446', shirt: '#f2efe6', tie: '#b33a3a', hair: '#4a2f22'},
  cop: {suit: '#1f3d6e', pants: '#17305a', shirt: '#dfe6f0', hat: 'cap', hair: '#2b2018'},
  judge: {suit: '#1d1b22', shirt: '#f4f1ea', hat: 'wig', skin: '#e0b08f'},
  gent1887: {suit: '#5a4a3a', pants: '#3a3026', shirt: '#eee6d6', hat: 'tophat', hair: '#4a3a2a', glasses: true},
  man1887: {suit: '#6d5a44', pants: '#3e3328', shirt: '#e8dfcb', hat: 'boater', hair: '#5a4433'},
  woman: {suit: '#8c3a52', pants: '#3a2c2c', shirt: '#f2e6e0', hair: '#5a3424', bun: true, dress: '#8c3a52'},
  woman2: {suit: '#2f6d8a', pants: '#2b3446', shirt: '#f0ece4', hair: '#c9a06a', dress: '#2f6d8a'},
  baker: {suit: '#f2efe6', pants: '#5a4e42', shirt: '#f7f4ec', hat: 'cap', hair: '#6a5a4a', apron: true},
  bride: {suit: '#f6f1ea', pants: '#f6f1ea', shirt: '#f6f1ea', hair: '#8a6a4a', bun: true, dress: '#f6f1ea'},
  groom: {suit: '#2a2f3a', pants: '#20242e', shirt: '#f4f1ea', tie: '#7a2f2f', hair: '#3a2a20'},
  kid1: {suit: '#c44a3a', pants: '#3a4a7a', shirt: '#f2efe6', hair: '#6a4a2a'},
  kid2: {suit: '#4a8a5a', pants: '#3a3a4a', shirt: '#f2efe6', hair: '#2a1a10'},
  prof: {suit: '#4a4a52', pants: '#2e2e36', shirt: '#f4f1ea', hair: '#c8c2b8', glasses: true, tie: '#2a4a7a'},
  driver: {suit: '#2e4a6e', pants: '#24344c', shirt: '#e8e4da', hat: 'cap', hair: '#3a2a20'},
  student: {suit: '#5a6a7a', pants: '#2e3a48', shirt: '#eeeae0', hair: '#7a4a2a'},
};

type BeanProps = {x: number; y: number; s?: number; t?: number; look: Look | string; pose?: Pose; face?: Face; flip?: boolean; phase?: number; talk?: number; sweat?: boolean; dimming?: number};

export const Bean: React.FC<BeanProps> = ({x, y, s = 1, t = 0, look: lk, pose = 'stand', face = 'neutral', flip = false, phase, talk = 0, sweat = false}) => {
  const L: Look = typeof lk === 'string' ? LOOKS[lk] : lk;
  const skin = L.skin ?? '#e7b99a';
  const pants = L.pants ?? L.suit;
  const ph = phase ?? t * 2.4;
  const legA = pose === 'walk' ? Math.sin(ph) * 24 : 0;
  const legB = pose === 'walk' ? -Math.sin(ph) * 24 : 0;
  const armA = pose === 'walk' ? -Math.sin(ph) * 18 : pose === 'hold' ? 0 : 0;
  const blink = Math.sin(t * 2.3 + x * 0.01) > 0.985 ? 0.12 : 1;
  const breath = 1 + 0.006 * Math.sin(t * 2.6);
  const seated = pose === 'sit';
  const eyeR = face === 'wink' ? 0.14 : blink;
  const mouthOpen = face === 'shock' || face === 'sneeze' ? 1 : talk;
  const armR = pose === 'hold' ? [-20, -370] : pose === 'point' ? [150, -520] : pose === 'raise' ? [150, -700] : pose === 'clap' ? [60, -410] : pose === 'shrug' ? [150, -430] : [150, -330];
  const armLpos = pose === 'hold' ? [-20, -380] : pose === 'clap' ? [-60, -410] : pose === 'shrug' ? [-150, -430] : pose === 'raise' ? [-150, -330] : [-150, -330];
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s}, ${s})`}>
      {/* ноги: у сидящего согнуты вперёд */}
      {seated ? (
        <g>
          <path d="M -40 -300 L 60 -250 L 62 -150 L 66 -22" stroke={CINK} strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -40 -300 L 60 -250 L 62 -150 L 66 -22" stroke={pants} strokeWidth={36} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 10 -300 L 110 -250 L 112 -150 L 116 -22" stroke={CINK} strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 10 -300 L 110 -250 L 112 -150 L 116 -22" stroke={pants} strokeWidth={36} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : (
        <g>
          <g transform={`rotate(${legA} 38 -310)`}>
            <path d="M 38 -310 L 46 -170 L 50 -22" stroke={CINK} strokeWidth={46} fill="none" strokeLinecap="round" />
            <path d="M 38 -310 L 46 -170 L 50 -22" stroke={pants} strokeWidth={36} fill="none" strokeLinecap="round" />
            <ellipse cx={58} cy={-12} rx={36} ry={14} fill="#2a1f18" stroke={CINK} strokeWidth={5} />
          </g>
          <g transform={`rotate(${legB} -38 -310)`}>
            <path d="M -38 -310 L -46 -170 L -50 -22" stroke={CINK} strokeWidth={46} fill="none" strokeLinecap="round" />
            <path d="M -38 -310 L -46 -170 L -50 -22" stroke={pants} strokeWidth={36} fill="none" strokeLinecap="round" />
            <ellipse cx={-58} cy={-12} rx={36} ry={14} fill="#2a1f18" stroke={CINK} strokeWidth={5} />
          </g>
        </g>
      )}
      <g transform={`translate(0,-330) scale(1, ${breath}) translate(0,330)`}>
        {/* юбка / платье */}
        {L.dress && <path d="M -104 -330 Q 0 -300 104 -330 L 150 -120 Q 0 -90 -150 -120 Z" fill={L.dress} stroke={CINK} strokeWidth={6} />}
        {/* руки: тонкие палочки, кисти — точки туши */}
        {[[-110, -462, armLpos[0], armLpos[1], armA], [110, -462, armR[0], armR[1], -armA]].map(([sx, sy, ex, ey, a], i) => (
          <g key={i} transform={`rotate(${a} ${sx} ${sy})`}>
            <path d={`M ${sx} ${sy} L ${(sx + ex) / 2 + (i ? 14 : -14)} ${(sy + ey) / 2} L ${ex} ${ey}`} stroke={CINK} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M ${sx} ${sy} L ${(sx + ex) / 2 + (i ? 14 : -14)} ${(sy + ey) / 2} L ${ex} ${ey}`} stroke={L.suit} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={ex} cy={ey} r={9} fill={CINK} />
          </g>
        ))}
        {/* торс: пиджак, рубашка, галстук */}
        <path d="M -118 -470 Q 0 -500 118 -470 L 100 -316 Q 0 -294 -100 -316 Z" fill={L.suit} stroke={CINK} strokeWidth={6} />
        <path d="M -26 -470 L 0 -398 L 26 -470 Z" fill={L.shirt ?? '#f2efe6'} stroke={CINK} strokeWidth={4} />
        {L.tie && <path d="M -7 -440 L 0 -398 L 7 -440 L 0 -350 Z" fill={L.tie} stroke={CINK} strokeWidth={3} />}
        {L.apron && <path d="M -70 -390 L 70 -390 L 80 -300 L -80 -300 Z" fill="#f7f4ec" stroke={CINK} strokeWidth={4} />}
        {/* шея и голова-боб */}
        <rect x={-22} y={-512} width={44} height={30} fill={skin} stroke={CINK} strokeWidth={4} />
        {L.bun && <circle cx={0} cy={-738} r={34} fill={L.hair ?? '#5a3424'} stroke={CINK} strokeWidth={5} />}
        <path d="M 0 -712 C 98 -716 104 -508 0 -500 C -104 -508 -98 -716 0 -712 Z" fill={skin} stroke={CINK} strokeWidth={6} />
        {/* волосы */}
        {L.hat !== 'wig' && L.hat !== 'bowler' && L.hat !== 'tophat' && L.hat !== 'cap' && L.hat !== 'boater' && (
          <path d="M -96 -628 C -100 -730 96 -730 96 -628 C 80 -676 40 -690 0 -688 C -40 -690 -80 -676 -96 -628 Z" fill={L.hair ?? '#4a2f22'} stroke={CINK} strokeWidth={5} />
        )}
        {L.hat === 'wig' && [[-90, -640, 36], [90, -640, 36], [-56, -716, 40], [0, -742, 44], [56, -716, 40], [-96, -680, 28], [96, -680, 28]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#f2efe8" stroke="#b9b1a3" strokeWidth={4} />
        ))}
        {L.hat === 'tophat' && <g><rect x={-62} y={-790} width={124} height={86} fill="#1d1b22" stroke={CINK} strokeWidth={5} /><rect x={-92} y={-708} width={184} height={16} fill="#1d1b22" stroke={CINK} strokeWidth={5} /></g>}
        {L.hat === 'bowler' && <g><path d="M -72 -704 Q 0 -790 72 -704 Z" fill="#2a2620" stroke={CINK} strokeWidth={5} /><rect x={-98} y={-710} width={196} height={14} fill="#2a2620" stroke={CINK} strokeWidth={5} /></g>}
        {L.hat === 'cap' && <g><path d="M -80 -708 Q 0 -770 80 -708 Z" fill={L.suit} stroke={CINK} strokeWidth={5} /><rect x={-78} y={-712} width={150} height={12} fill={L.suit} stroke={CINK} strokeWidth={5} transform="translate(20,0)" /><circle cx={0} cy={-734} r={7} fill="#e8c24a" stroke={CINK} strokeWidth={3} /></g>}
        {L.hat === 'boater' && <g><ellipse cx={0} cy={-716} rx={116} ry={22} fill="#e8d6a2" stroke={CINK} strokeWidth={5} /><rect x={-58} y={-772} width={116} height={58} fill="#e8d6a2" stroke={CINK} strokeWidth={5} /><rect x={-58} y={-734} width={116} height={12} fill="#b33a3a" stroke={CINK} strokeWidth={3} /></g>}
        {/* глаза: моргание, мимика */}
        <ellipse cx={-34} cy={-606} rx={14} ry={17 * eyeR} fill="#fff" stroke={CINK} strokeWidth={5} />
        <ellipse cx={34} cy={-606} rx={14} ry={17 * blink} fill="#fff" stroke={CINK} strokeWidth={5} />
        {blink > 0.5 && face !== 'wink' && <circle cx={-34} cy={-604} r={6} fill={CINK} />}
        {blink > 0.5 && <circle cx={34} cy={-604} r={6} fill={CINK} />}
        {face === 'stern' ? <path d="M -52 -634 L -18 -626 M 52 -634 L 18 -626" stroke={CINK} strokeWidth={6} fill="none" /> :
          face === 'nervous' ? <path d="M -52 -628 L -18 -640 M 52 -628 L 18 -640" stroke={CINK} strokeWidth={6} fill="none" /> :
          face === 'shock' ? <path d="M -52 -652 Q -34 -668 -18 -652 M 52 -652 Q 34 -668 18 -652" stroke={CINK} strokeWidth={6} fill="none" /> :
          <path d="M -52 -636 Q -34 -646 -18 -636 M 52 -636 Q 34 -646 18 -636" stroke={CINK} strokeWidth={6} fill="none" />}
        {face === 'wink' && <path d="M 20 -606 Q 34 -616 48 -606" stroke={CINK} strokeWidth={5} fill="none" />}
        {L.glasses && <g fill="none" stroke={CINK} strokeWidth={4}><circle cx={-34} cy={-606} r={24} /><circle cx={34} cy={-606} r={24} /><path d="M -10 -606 L 10 -606" /></g>}
        {/* рот */}
        {mouthOpen > 0.05 || face === 'shock' || face === 'sneeze' ? (
          <ellipse cx={0} cy={-546} rx={14} ry={4 + 14 * mouthOpen} fill={CINK} />
        ) : face === 'smile' || face === 'proud' ? (
          <path d="M -28 -552 Q 0 -526 28 -552" stroke={CINK} strokeWidth={5} fill="none" strokeLinecap="round" />
        ) : face === 'stern' ? (
          <path d="M -20 -548 L 20 -548" stroke={CINK} strokeWidth={5} strokeLinecap="round" />
        ) : face === 'nervous' ? (
          <path d="M -20 -548 q 5 -7 10 0 t 10 0" stroke={CINK} strokeWidth={4} fill="none" />
        ) : (
          <path d="M -20 -550 Q 0 -542 20 -550" stroke={CINK} strokeWidth={5} fill="none" strokeLinecap="round" />
        )}
        {sweat && <path d="M 84 -664 q 9 16 0 22 q -9 -6 0 -22 Z" fill="#7cc7ff" stroke={CINK} strokeWidth={3} />}
      </g>
    </g>
  );
};

// Реквизит (SVG): часы на запястье, чашка, чемодан, свиток, колокол, торт, молоток, конфетти, облачко
export const Watch: React.FC<{x: number; y: number; r?: number; hour?: number; minute?: number}> = ({x, y, r = 16, hour = 9, minute = 0}) => {
  const ha = ((hour % 12) * 30 + minute * 0.5) * Math.PI / 180;
  const ma = minute * 6 * Math.PI / 180;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#f6eedc" stroke={CINK} strokeWidth={4} />
      <line x1={x} y1={y} x2={x + Math.sin(ha) * r * 0.5} y2={y - Math.cos(ha) * r * 0.5} stroke={CINK} strokeWidth={3} />
      <line x1={x} y1={y} x2={x + Math.sin(ma) * r * 0.8} y2={y - Math.cos(ma) * r * 0.8} stroke={CINK} strokeWidth={2} />
    </g>
  );
};
export const Cup: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={34} ry={8} fill="#e9e2d4" stroke={CINK} strokeWidth={4} />
    <path d="M -22 -36 L 22 -36 L 16 0 L -16 0 Z" fill="#f4efe6" stroke={CINK} strokeWidth={4} />
    <path d="M 22 -26 q 14 2 10 12 q -4 6 -12 2" fill="none" stroke={CINK} strokeWidth={4} />
  </g>
);
export const Suitcase: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#7a4a2a'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-60} y={-80} width={120} height={80} rx={8} fill={color} stroke={CINK} strokeWidth={5} />
    <path d="M -22 -80 L -22 -98 L 22 -98 L 22 -80" fill="none" stroke={CINK} strokeWidth={5} />
    <rect x={-60} y={-52} width={120} height={6} fill="#4a2a18" />
  </g>
);
export const Scroll: React.FC<{x: number; y: number; w?: number; h?: number; lines: string[]; rot?: number; size?: number}> = ({x, y, w = 420, h = 260, lines, rot = 0, size = 46}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#efe2c2" stroke={CINK} strokeWidth={6} />
    <rect x={-w / 2 - 12} y={-h / 2 - 8} width={w + 24} height={16} rx={8} fill="#c9a06a" stroke={CINK} strokeWidth={4} />
    <rect x={-w / 2 - 12} y={h / 2 - 8} width={w + 24} height={16} rx={8} fill="#c9a06a" stroke={CINK} strokeWidth={4} />
    {lines.map((l, i) => (
      <text key={i} x={0} y={-h / 4 + i * size * 1.3} fontFamily="Arial, sans-serif" fontWeight={800} fontSize={size} fill="#3a2b20" textAnchor="middle">{l}</text>
    ))}
  </g>
);
export const Gavel: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={-8} y={-10} width={16} height={130} fill="#8a5a2a" stroke={CINK} strokeWidth={4} />
    <rect x={-46} y={-42} width={92} height={40} rx={6} fill="#6a4020" stroke={CINK} strokeWidth={4} />
  </g>
);
export const Confetti: React.FC<{t: number; n?: number; seed?: number}> = ({t, n = 70, seed = 3}) => {
  const cols = ['#ffd64a', '#ff5a7a', '#5ad0ff', '#7ae07a', '#ffffff'];
  const pieces = Array.from({length: n}).map((_, i) => {
    const r = (Math.sin(i * 12.9898 + seed) * 43758.5453) % 1;
    const x0 = 540 + (((r * 997) % 1) - 0.5) * 700;
    const v = 260 + (r * 300) % 260;
    const y = 300 + (v * t) % 1400;
    const rot = (t * 240 + i * 37) % 360;
    return <rect key={i} x={x0 + Math.sin(t * 3 + i) * 30} y={y} width={12} height={20} fill={cols[i % cols.length]} transform={`rotate(${rot} ${x0} ${y})`} />;
  });
  return <g>{pieces}</g>;
};
export const Bubble: React.FC<{x: number; y: number; text: string; s?: number}> = ({x, y, text, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={84} ry={44} fill="#fffaf0" stroke={CINK} strokeWidth={5} />
    <text x={0} y={14} fontFamily="Arial, sans-serif" fontWeight={800} fontSize={44} fill={CINK} textAnchor="middle">{text}</text>
  </g>
);
export const Cake: React.FC<{x: number; y: number; burn?: number}> = ({x, y, burn = 1}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-120} y={-60} width={240} height={60} rx={10} fill="#f2c9a0" stroke={CINK} strokeWidth={5} />
    <rect x={-90} y={-120} width={180} height={60} rx={10} fill="#f7b5c4" stroke={CINK} strokeWidth={5} />
    <rect x={-56} y={-170} width={112} height={50} rx={8} fill="#fff3e6" stroke={CINK} strokeWidth={5} />
    {[-40, 0, 40].map((cx) => (
      <g key={cx}>
        <rect x={cx - 3} y={-220} width={6} height={50} fill="#e8e0d0" stroke={CINK} strokeWidth={2} />
        <ellipse cx={cx} cy={-226} rx={6} ry={14 * burn} fill="#ffb13a" stroke={CINK} strokeWidth={2} />
      </g>
    ))}
  </g>
);
