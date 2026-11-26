import React from 'react';
import {INK, FONT, blink, breath, mouthOpen, clamp, outBack, prog} from './theme';

// Персонажи: начало координат — между ступнями, вверх — отрицательный y. Все фигуры рисуются кодом (SVG).

const SKIN = '#e6b28d';
const SKIN_SHADE = '#c4876a';

// конечность: толстая линия с контуром (чёрный контур = толщина + 10)
export const Limb: React.FC<{d: string; w: number; color: string}> = ({d, w, color}) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={w + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

type CharProps = {
  x: number;
  y: number;
  s?: number;
  t: number;
  pose?: 'stand' | 'hold' | 'point' | 'scan' | 'podium';
  mood?: 'calm' | 'wide' | 'sad' | 'smirk';
  speak?: boolean;
  flip?: boolean;
  seed?: number;
};

// Гарольд (старик) и молодой Гарольд (young)
export const Harold: React.FC<CharProps & {young?: boolean}> = ({x, y, s = 1, t, pose = 'stand', mood = 'calm', speak = false, flip = false, young = false, seed = 0}) => {
  const hair = young ? '#5a3b26' : '#ece8e1';
  const card = young ? '#2d4c7a' : '#c9963a';
  const cardShade = young ? '#1d3150' : '#8c6322';
  const pants = '#4a4f5c';
  const b = blink(t, seed);
  const m = mouthOpen(t, speak);
  const br = breath(t);
  const lidOpen = b;
  const browY = mood === 'wide' ? -862 : mood === 'sad' ? -846 : -852;
  const armL =
    pose === 'hold' ? 'M -150 -630 Q -210 -560 -112 -520 L -44 -532'
    : pose === 'point' ? 'M -150 -630 Q -200 -520 -186 -392'
    : 'M -150 -630 Q -200 -520 -186 -392';
  const armR =
    pose === 'hold' ? 'M 150 -630 Q 210 -560 112 -520 L 44 -532'
    : pose === 'point' ? 'M 150 -630 Q 226 -700 262 -764'
    : 'M 150 -630 Q 200 -520 186 -392';
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s}, ${s})`}>
      {/* ноги и ботинки */}
      <Limb d="M -70 -470 L -72 -44" w={88} color={pants} />
      <Limb d="M 70 -470 L 72 -44" w={88} color={pants} />
      <ellipse cx={-74} cy={-16} rx={78} ry={28} fill="#3b2a22" stroke={INK} strokeWidth={6} />
      <ellipse cx={74} cy={-16} rx={78} ry={28} fill="#3b2a22" stroke={INK} strokeWidth={6} />
      {/* верхняя часть дышит */}
      <g transform={`translate(0,-420) scale(1,${br}) translate(0,420)`}>
        <Limb d={armL} w={54} color={card} />
        <Limb d={armR} w={54} color={card} />
        <circle cx={pose === 'hold' ? -44 : -186} cy={pose === 'hold' ? -532 : -388} r={26} fill={SKIN} stroke={INK} strokeWidth={5} />
        <circle cx={pose === 'hold' ? 44 : pose === 'point' ? 262 : 186} cy={pose === 'hold' ? -532 : pose === 'point' ? -764 : -388} r={26} fill={SKIN} stroke={INK} strokeWidth={5} />
        {/* кардиган с складками и пуговицами */}
        <path d="M -165 -650 Q 0 -712 165 -650 Q 176 -520 160 -420 Q 0 -380 -160 -420 Q -176 -520 -165 -650 Z" fill={card} stroke={INK} strokeWidth={6} />
        <path d="M -72 -600 Q -62 -520 -80 -430" stroke={cardShade} strokeWidth={5} fill="none" />
        <path d="M 72 -600 Q 62 -520 80 -430" stroke={cardShade} strokeWidth={5} fill="none" />
        <path d="M -48 -664 L 0 -612 L 48 -664 Z" fill="#f5f0e6" stroke={INK} strokeWidth={4} />
        {[-560, -500, -440].map((yy) => <circle key={yy} cx={0} cy={yy} r={9} fill="#7b4f23" stroke={INK} strokeWidth={2} />)}
        {/* шея и голова */}
        <path d="M -40 -740 L -40 -700 L 40 -700 L 40 -740 Z" fill={SKIN_SHADE} stroke={INK} strokeWidth={4} />
        <ellipse cx={-94} cy={-790} rx={18} ry={26} fill={SKIN} stroke={INK} strokeWidth={5} />
        <ellipse cx={94} cy={-790} rx={18} ry={26} fill={SKIN} stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={-790} rx={94} ry={110} fill={SKIN} stroke={INK} strokeWidth={6} />
        {/* волосы */}
        {young ? (
          <path d="M -102 -800 Q -116 -922 0 -918 Q 112 -922 102 -800 Q 80 -862 0 -870 Q -72 -862 -102 -800 Z" fill={hair} stroke={INK} strokeWidth={5} />
        ) : (
          <g>
            <path d="M -100 -812 Q -122 -926 -20 -922 Q 40 -946 100 -904 Q 120 -850 98 -812 Q 60 -838 0 -842 Q -60 -838 -100 -812 Z" fill={hair} stroke={INK} strokeWidth={5} />
            <circle cx={-98} cy={-812} r={22} fill={hair} stroke={INK} strokeWidth={4} />
            <circle cx={98} cy={-812} r={22} fill={hair} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {/* очки, глаза, брови */}
        <circle cx={-38} cy={-800} r={32} fill="rgba(170,220,235,0.28)" stroke={INK} strokeWidth={7} />
        <circle cx={38} cy={-800} r={32} fill="rgba(170,220,235,0.28)" stroke={INK} strokeWidth={7} />
        <path d="M -6 -806 Q 0 -812 6 -806" stroke={INK} strokeWidth={6} fill="none" />
        <ellipse cx={-38} cy={-800} rx={9} ry={9 * lidOpen} fill={INK} />
        <ellipse cx={38} cy={-800} rx={9} ry={9 * lidOpen} fill={INK} />
        <path d={mood === 'sad' ? 'M -66 -838 Q -40 -846 -14 -858' : `M -66 ${browY} Q -40 ${browY - 8} -14 ${browY}`} stroke={INK} strokeWidth={6} fill="none" />
        <path d={`M 66 ${browY} Q 40 ${browY - 8} 14 ${browY}`} stroke={INK} strokeWidth={6} fill="none" />
        {!young && <path d="M -56 -866 Q 0 -874 56 -866" stroke={SKIN_SHADE} strokeWidth={3} fill="none" />}
        <path d="M 0 -800 Q -10 -776 2 -770" stroke={SKIN_SHADE} strokeWidth={5} fill="none" />
        <circle cx={-54} cy={-758} r={14} fill="#e89a8a" opacity={0.35} />
        <circle cx={54} cy={-758} r={14} fill="#e89a8a" opacity={0.35} />
        {/* рот: открывается при речи */}
        {speak ? (
          <ellipse cx={0} cy={-744} rx={18} ry={4 + 16 * m} fill="#6b2d2d" stroke={INK} strokeWidth={3} />
        ) : mood === 'smirk' ? (
          <path d="M -14 -750 Q 6 -742 18 -754" stroke={INK} strokeWidth={5} fill="none" />
        ) : mood === 'wide' ? (
          <ellipse cx={0} cy={-744} rx={12} ry={14} fill="#6b2d2d" stroke={INK} strokeWidth={3} />
        ) : (
          <path d="M -18 -748 Q 0 -738 18 -748" stroke={INK} strokeWidth={5} fill="none" />
        )}
      </g>
      {pose === 'hold' && (
        <g transform="translate(-74,-600)">
          <rect x={0} y={0} width={148} height={96} rx={8} fill="#2e6e5a" stroke={INK} strokeWidth={6} />
          <rect x={0} y={0} width={20} height={96} fill="#1f4d3e" />
          <text x={80} y={44} fontFamily={FONT} fontWeight={800} fontSize={18} fill="#f5e9c8" textAnchor="middle">Fishing</text>
          <text x={80} y={68} fontFamily={FONT} fontWeight={800} fontSize={16} fill="#f5e9c8" textAnchor="middle">for Beginners</text>
        </g>
      )}
    </g>
  );
};

// Маргарет — библиотекарь: пучок, очки на цепочке, бирюзовый кардиган, юбка
export const Margaret: React.FC<CharProps> = ({x, y, s = 1, t, pose = 'stand', mood = 'calm', speak = false, flip = false, seed = 3}) => {
  const b = blink(t, seed);
  const m = mouthOpen(t, speak);
  const br = breath(t);
  const card = '#2f7f7a';
  const cardShade = '#1d5450';
  const armR = pose === 'scan' ? 'M 150 -630 Q 220 -600 300 -596' : pose === 'podium' ? 'M 150 -630 Q 180 -520 150 -460' : 'M 150 -630 Q 200 -520 186 -392';
  const armL = pose === 'podium' ? 'M -150 -630 Q -180 -520 -150 -460' : 'M -150 -630 Q -200 -520 -186 -392';
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s}, ${s})`}>
      {/* юбка и туфли */}
      <path d="M -150 -430 Q 0 -400 150 -430 L 210 -120 Q 0 -92 -210 -120 Z" fill="#3d3a52" stroke={INK} strokeWidth={6} />
      <ellipse cx={-70} cy={-40} rx={58} ry={22} fill="#2a2420" stroke={INK} strokeWidth={5} />
      <ellipse cx={70} cy={-40} rx={58} ry={22} fill="#2a2420" stroke={INK} strokeWidth={5} />
      <g transform={`translate(0,-420) scale(1,${br}) translate(0,420)`}>
        <Limb d={armL} w={50} color={card} />
        <Limb d={armR} w={50} color={card} />
        <circle cx={pose === 'scan' ? 300 : pose === 'podium' ? 150 : 186} cy={pose === 'scan' ? -596 : pose === 'podium' ? -460 : -388} r={24} fill="#efbf9c" stroke={INK} strokeWidth={5} />
        <path d="M -160 -650 Q 0 -708 160 -650 Q 170 -520 150 -430 Q 0 -398 -150 -430 Q -170 -520 -160 -650 Z" fill={card} stroke={INK} strokeWidth={6} />
        <path d="M -62 -600 Q -54 -520 -72 -440" stroke={cardShade} strokeWidth={5} fill="none" />
        <path d="M 62 -600 Q 54 -520 72 -440" stroke={cardShade} strokeWidth={5} fill="none" />
        <path d="M -40 -740 L -40 -700 L 40 -700 L 40 -740 Z" fill="#d89c7c" stroke={INK} strokeWidth={4} />
        <path d="M -44 -660 L 0 -624 L 44 -660" fill="none" stroke="#f5f0e6" strokeWidth={10} />
        <ellipse cx={-90} cy={-790} rx={16} ry={24} fill="#efbf9c" stroke={INK} strokeWidth={5} />
        <ellipse cx={90} cy={-790} rx={16} ry={24} fill="#efbf9c" stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={-790} rx={90} ry={106} fill="#efbf9c" stroke={INK} strokeWidth={6} />
        {/* волосы с пучком */}
        <path d="M -98 -810 Q -104 -900 0 -904 Q 100 -900 98 -810 Q 60 -852 0 -858 Q -60 -852 -98 -810 Z" fill="#5b3a29" stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-918} r={50} fill="#5b3a29" stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-918} r={18} fill="#3b2418" />
        {/* очки на цепочке */}
        <circle cx={-36} cy={-796} r={28} fill="rgba(200,230,240,0.25)" stroke="#c9a14a" strokeWidth={6} />
        <circle cx={36} cy={-796} r={28} fill="rgba(200,230,240,0.25)" stroke="#c9a14a" strokeWidth={6} />
        <path d="M -8 -800 Q 0 -806 8 -800" stroke="#c9a14a" strokeWidth={5} fill="none" />
        <path d="M -40 -728 Q -20 -700 -54 -676 M 40 -728 Q 20 -700 54 -676" stroke="#c9a14a" strokeWidth={3} fill="none" />
        <ellipse cx={-36} cy={-796} rx={8} ry={8 * b} fill={INK} />
        <ellipse cx={36} cy={-796} rx={8} ry={8 * b} fill={INK} />
        <path d={mood === 'wide' ? 'M -64 -846 Q -36 -858 -12 -846' : 'M -64 -838 Q -36 -846 -12 -840'} stroke={INK} strokeWidth={5} fill="none" />
        <path d="M 64 -838 Q 36 -846 12 -840" stroke={INK} strokeWidth={5} fill="none" />
        <path d="M 0 -796 Q -8 -772 2 -766" stroke="#c4876a" strokeWidth={4} fill="none" />
        {speak ? (
          <ellipse cx={0} cy={-742} rx={14} ry={3 + 10 * m} fill="#6b2d2d" stroke={INK} strokeWidth={3} />
        ) : (
          <path d="M -14 -744 Q 0 -736 14 -744" stroke={INK} strokeWidth={4} fill="none" />
        )}
      </g>
      {pose === 'scan' && (
        <g transform="translate(240,-620)">
          <rect x={0} y={0} width={110} height={70} rx={10} fill="#2b2b33" stroke={INK} strokeWidth={5} />
          <rect x={10} y={10} width={90} height={30} fill="#7fd8c4" opacity={0.7 + 0.3 * Math.sin(t * 24)} />
        </g>
      )}
    </g>
  );
};

// Судья: чёрная мантия, белый парик, строгий взгляд, рот — при реплике
export const Judge: React.FC<CharProps> = ({x, y, s = 1, t, speak = false}) => {
  const b = blink(t, 5);
  const m = mouthOpen(t, speak);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M -210 -640 Q 0 -704 210 -640 L 280 0 L -280 0 Z" fill="#1f1f26" stroke={INK} strokeWidth={6} />
      <path d="M -60 -690 L 0 -640 L 60 -690" fill="#f2efe8" stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={-790} rx={92} ry={108} fill="#e6b08a" stroke={INK} strokeWidth={6} />
      {[[-98, -760, 42], [98, -760, 42], [-74, -866, 44], [0, -898, 48], [74, -866, 44], [-40, -900, 36], [40, -900, 36]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#f2efe8" stroke="#c9c2b5" strokeWidth={4} />
      ))}
      <ellipse cx={-36} cy={-800} rx={8} ry={8 * b} fill={INK} />
      <ellipse cx={36} cy={-800} rx={8} ry={8 * b} fill={INK} />
      <path d="M -64 -850 Q -36 -862 -10 -850 M 64 -850 Q 36 -862 10 -850" stroke={INK} strokeWidth={6} fill="none" />
      {speak ? (
        <ellipse cx={0} cy={-744} rx={20} ry={4 + 16 * m} fill="#6b2d2d" stroke={INK} strokeWidth={3} />
      ) : (
        <path d="M -22 -748 Q 0 -742 22 -748" stroke={INK} strokeWidth={5} fill="none" />
      )}
    </g>
  );
};

// Коза, высунувшая голову (профиль)
export const Goat: React.FC<{x: number; y: number; s?: number; t: number; bleat?: boolean}> = ({x, y, s = 1, t, bleat = false}) => {
  const b = blink(t, 1);
  const m = bleat ? 0.4 + 0.6 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M -20 -120 Q -44 -200 -6 -226" stroke="#b29c7a" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 40 -120 Q 62 -198 30 -220" stroke="#b29c7a" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M -66 -40 Q -68 -120 0 -126 Q 74 -120 84 -40 Q 76 42 4 62 Q -62 42 -66 -40 Z" fill="#ebe5d9" stroke={INK} strokeWidth={6} />
      <ellipse cx={-70} cy={-84} rx={30} ry={14} fill="#ebe5d9" stroke={INK} strokeWidth={5} transform="rotate(-20 -70 -84)" />
      <path d="M 24 34 Q 46 92 12 124 Q 0 84 -8 46 Z" fill="#d7cfc0" stroke={INK} strokeWidth={4} />
      <ellipse cx={-14} cy={-60} rx={14} ry={9 * b} fill="#e0a030" stroke={INK} strokeWidth={3} />
      <rect x={-18} y={-64} width={8} height={8 * b} fill={INK} />
      {bleat ? (
        <ellipse cx={50} cy={20} rx={16} ry={4 + 12 * m} fill="#6b2d2d" stroke={INK} strokeWidth={3} />
      ) : (
        <path d="M 40 24 Q 52 30 62 22" stroke={INK} strokeWidth={5} fill="none" />
      )}
    </g>
  );
};

// Печать: резкий удар с отскоком
export const Stamp: React.FC<{x: number; y: number; t: number; t0: number; text: string; color?: string; size?: number; rot?: number}> = ({x, y, t, t0, text, color = '#c62828', size = 64, rot = -6}) => {
  const k = prog(t, t0, t0 + 0.22);
  const sc = 2.1 - 1.1 * outBack(k);
  const op = prog(t, t0, t0 + 0.04);
  const w = text.length * size * 0.66 + 70;
  const h = size * 1.75;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sc})`} opacity={op}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill="rgba(255,240,230,0.08)" stroke={color} strokeWidth={12} />
      <text x={0} y={size * 0.36} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} textAnchor="middle">{text}</text>
    </g>
  );
};

// Книга в руке/на столе
export const Book: React.FC<{x: number; y: number; rot?: number; s?: number; title?: string; cover?: string}> = ({x, y, rot = 0, s = 1, title = 'Fishing for Beginners', cover = '#2e6e5a'}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-95} y={-125} width={190} height={250} rx={10} fill={cover} stroke={INK} strokeWidth={6} />
    <rect x={-95} y={-125} width={22} height={250} fill="#1f4d3e" stroke={INK} strokeWidth={4} />
    <text x={8} y={-30} fontFamily={FONT} fontWeight={800} fontSize={24} fill="#f5e9c8" textAnchor="middle">{title.split(' ').slice(0, 2).join(' ')}</text>
    <text x={8} y={2} fontFamily={FONT} fontWeight={800} fontSize={24} fill="#f5e9c8" textAnchor="middle">{title.split(' ').slice(2).join(' ')}</text>
    <path d="M -28 60 Q 0 36 30 60 Q 0 84 -28 60 Z" fill="#f5e9c8" />
    <path d="M 30 60 L 52 46 L 52 74 Z" fill="#f5e9c8" />
  </g>
);

// Бумажная карточка с текстом (квитанция, календарь)
export const Paper: React.FC<{x: number; y: number; w: number; h: number; rot?: number; lines?: string[]; tone?: string; size?: number}> = ({x, y, w, h, rot = 0, lines = [], tone = '#f4ecd8', size = 40}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={0} y={0} width={w} height={h} rx={10} fill={tone} stroke={INK} strokeWidth={5} />
    {lines.map((l, i) => (
      <text key={i} x={w / 2} y={size * 1.3 + i * size * 1.35} fontFamily={FONT} fontWeight={800} fontSize={size} fill="#3a2b20" textAnchor="middle">{l}</text>
    ))}
  </g>
);

// Числовой счётчик на чёрной панели
export const Counter: React.FC<{x: number; y: number; w?: number; value: string; label?: string; color?: string}> = ({x, y, w = 640, value, label, color = '#ffd64a'}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={-110} width={w} height={220} rx={24} fill="#1d1714" stroke={INK} strokeWidth={6} />
    {label && <text x={0} y={-48} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#d9c9a8" textAnchor="middle">{label}</text>}
    <text x={0} y={60} fontFamily={FONT} fontWeight={800} fontSize={96} fill={color} textAnchor="middle">{value}</text>
  </g>
);

// Фон: закатное небо
export const Sky: React.FC<{id: string; top: string; bottom: string}> = ({id, top, bottom}) => (
  <g>
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={W2} height={H2} fill={`url(#sky-${id})`} />
  </g>
);
const W2 = 1480;
const H2 = 2320;

// Город: ряд домов с окнами; lit — доля горящих окон
export const Town: React.FC<{lit: number; y?: number; seed?: number}> = ({lit, y = 1220, seed = 1}) => {
  const houses = [
    {x: -40, w: 150, h: 260, c: '#b5563b'}, {x: 110, w: 170, h: 310, c: '#d9a35b'}, {x: 280, w: 140, h: 240, c: '#8c4a3c'},
    {x: 420, w: 190, h: 350, c: '#c97c4a'}, {x: 610, w: 150, h: 270, c: '#a3603f'}, {x: 760, w: 170, h: 300, c: '#d4955a'},
    {x: 930, w: 180, h: 280, c: '#9b5a40'},
  ];
  let k = 0;
  return (
    <g>
      {houses.map((h, i) => (
        <g key={i}>
          <rect x={h.x} y={y - h.h} width={h.w} height={h.h} fill={h.c} stroke={INK} strokeWidth={5} />
          <path d={`M ${h.x - 8} ${y - h.h} L ${h.x + h.w / 2} ${y - h.h - 90} L ${h.x + h.w + 8} ${y - h.h} Z`} fill="#6b3a2c" stroke={INK} strokeWidth={5} />
          {[0, 1, 2].map((r) => [0, 1].map((c) => {
            const on = (((k++ * 7 + seed) % 10) / 10) < lit;
            return (
              <rect key={`${r}-${c}`} x={h.x + 24 + c * 60} y={y - h.h + 36 + r * 74} width={34} height={44} rx={4}
                fill={on ? '#ffd27a' : '#2b2420'} stroke={INK} strokeWidth={3} />
            );
          }))}
        </g>
      ))}
      <rect x={-200} y={y} width={1480} height={800} fill="#4e3a2c" />
      <rect x={-200} y={y + 6} width={1480} height={16} fill="#6e5440" />
    </g>
  );
};

// Осенние деревья: кроны из кругов, лёгкое покачивание
export const Trees: React.FC<{t: number; y?: number; colors?: string[]}> = ({t, y = 1240, colors = ['#c8602e', '#e0923c', '#a8432a', '#d9a53a']}) => (
  <g>
    {[-60, 160, 380, 600, 820, 1040].map((x, i) => (
      <g key={i} transform={`rotate(${Math.sin(t * 0.9 + i) * 1.4} ${x} ${y})`}>
        <rect x={x - 12} y={y - 180} width={24} height={200} fill="#4a3424" stroke={INK} strokeWidth={4} />
        {[[0, -250, 110], [-70, -200, 90], [70, -210, 92], [0, -320, 84]].map(([dx, dy, r], j) => (
          <circle key={j} cx={x + dx} cy={y + dy} r={r} fill={colors[(i + j) % colors.length]} stroke={INK} strokeWidth={4} />
        ))}
      </g>
    ))}
  </g>
);

// Фасад библиотеки «MILLBROOK LIBRARY» (название придумано)
export const LibraryFacade: React.FC = () => (
  <g>
    <rect x={120} y={700} width={840} height={560} fill="#e8d8b8" stroke={INK} strokeWidth={6} />
    <path d="M 100 700 L 540 560 L 980 700 Z" fill="#d6c29a" stroke={INK} strokeWidth={6} />
    {[190, 320, 450, 610, 740, 870].map((x, i) => (
      <g key={i}>
        <rect x={x} y={760} width={34} height={440} fill="#f5ecd6" stroke={INK} strokeWidth={4} />
        <rect x={x - 8} y={744} width={50} height={22} fill="#f5ecd6" stroke={INK} strokeWidth={4} />
      </g>
    ))}
    <rect x={250} y={230} width={580} height={70} rx={10} fill="#2b4d6a" stroke={INK} strokeWidth={6} />
    <text x={540} y={282} fontFamily={FONT} fontWeight={800} fontSize={46} fill="#f5e9c8" textAnchor="middle">MILLBROOK LIBRARY</text>
    <rect x={470} y={1020} width={140} height={240} rx={70} fill="#5a3b26" stroke={INK} strokeWidth={6} />
    <rect x={0} y={1260} width={1080} height={70} fill="#8a7a64" stroke={INK} strokeWidth={5} />
  </g>
);

// Книжные полки: цветные корешки разной высоты
export const Shelves: React.FC<{x: number; y: number; w: number; rows?: number; seed?: number}> = ({x, y, w, rows = 4, seed = 2}) => {
  const rng = (n: number) => ((Math.sin(n * 12.9898 + seed) * 43758.5453) % 1 + 1) % 1;
  const cols = ['#8a3b2a', '#2f6e6a', '#c9963a', '#3d4f7a', '#6d7a3a', '#a5584a'];
  const elems: React.ReactNode[] = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    const yy = y + r * 170;
    elems.push(<rect key={`shelf-${r}`} x={x} y={yy + 150} width={w} height={20} fill="#5a4030" stroke={INK} strokeWidth={4} />);
    let xx = x + 8;
    while (xx < x + w - 24) {
      const bw = 16 + rng(k) * 14;
      const bh = 96 + rng(k + 3) * 40;
      elems.push(<rect key={`b-${k}`} x={xx} y={yy + 150 - bh} width={bw} height={bh} fill={cols[k % cols.length]} stroke={INK} strokeWidth={2} />);
      xx += bw + 3;
      k++;
    }
  }
  return <g>{elems}</g>;
};
