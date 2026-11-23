import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {rng, safeId} from '../lib/math';
import {Navigator, ScreenGlow, GpsProps} from './Navigator';

/** The windscreen opening: the world shows through it, the dark trim covers the rest. */
export const WINDSCREEN = 'M 70 150 H 1010 V 1040 Q 1010 1100 950 1100 H 130 Q 70 1100 70 1040 Z';
/** The driver's side window, seen from the passenger side (angle B). */
export const SIDE_WINDOW = 'M -20 110 H 470 V 1020 Q 470 1060 430 1060 H -20 Z';

export type Expr = 'calm' | 'joke' | 'scared' | 'frozen';

/** Dark interior trim around an opening. */
const Trim: React.FC<{hole: string; id: string}> = ({hole, id}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1B251E" />
        <stop offset="1" stopColor="#060A07" />
      </linearGradient>
    </defs>
    <path fillRule="evenodd" d={`M -200 -200 H 1280 V 2120 H -200 Z ${hole}`} fill={`url(#${id})`} />
  </>
);

/** Dashboard: a soft-touch top edge with a highlight, two air vents. */
const Dash: React.FC<{id: string}> = ({id}) => (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A352C" />
        <stop offset="0.2" stopColor="#151C17" />
        <stop offset="1" stopColor="#050706" />
      </linearGradient>
    </defs>
    <path d="M -100 1110 Q 540 1040 1180 1110 L 1180 2020 L -100 2020 Z" fill={`url(#${id})`} />
    <path d="M -100 1110 Q 540 1040 1180 1110" stroke="#56695A" strokeWidth={5} fill="none" opacity={0.8} />
    <path d="M -100 1126 Q 540 1058 1180 1126" stroke="#000" strokeWidth={12} fill="none" opacity={0.5} />
    {[110, 780].map((vx) => (
      <g key={vx}>
        <rect x={vx} y={1150} width={300} height={34} rx={6} fill="#0A0E0B" stroke="#2A352D" strokeWidth={3} />
        {Array.from({length: 7}, (_, k) => (
          <line key={k} x1={vx + 16} x2={vx + 284} y1={1158 + k * 4} y2={1158 + k * 4} stroke="#1E2822" strokeWidth={2} />
        ))}
      </g>
    ))}
  </g>
);

/** Round dial with ticks, a needle and a backlight. `v` is 0..1 across the sweep. */
const Gauge: React.FC<{cx: number; cy: number; r: number; v: number; label: string}> = ({cx, cy, r, v, label}) => {
  const id = `gg${safeId(useId())}`;
  const rad = ((-135 + 270 * v) * Math.PI) / 180;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#1B2B24" />
          <stop offset="1" stopColor="#050807" />
        </radialGradient>
      </defs>
      <circle r={r * 1.14} fill="#4DE0C8" opacity={0.1} />
      <circle r={r} fill="#0B100E" stroke="#334239" strokeWidth={5} />
      <circle r={r * 0.9} fill={`url(#${id})`} />
      {Array.from({length: 11}, (_, i) => {
        const a = ((-135 + i * 27) * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={Math.cos(a) * r * 0.76}
            y1={Math.sin(a) * r * 0.76}
            x2={Math.cos(a) * r * 0.88}
            y2={Math.sin(a) * r * 0.88}
            stroke="#CFE8DD"
            strokeWidth={i % 5 === 0 ? 4 : 2}
          />
        );
      })}
      <line x1={0} y1={0} x2={Math.cos(rad) * r * 0.72} y2={Math.sin(rad) * r * 0.72} stroke="#FF6A3D" strokeWidth={4} strokeLinecap="round" />
      <circle r={r * 0.08} fill="#E8F3EE" />
      <text y={r * 0.56} textAnchor="middle" fontSize={r * 0.15} fill="#8FB8A6" fontFamily="monospace">
        {label}
      </text>
    </g>
  );
};

/** Three-spoke steering wheel, drawn as an ellipse (perspective). `rot` turns it. */
const Wheel: React.FC<{cx: number; cy: number; rx: number; ry: number; rot: number}> = ({cx, cy, rx, ry, rot}) => {
  const t = Math.min(rx, ry) * 0.16;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <ellipse rx={rx} ry={ry} fill="none" stroke="#0D100E" strokeWidth={t} />
      <ellipse rx={rx} ry={ry} fill="none" stroke="#2D372F" strokeWidth={t * 0.35} transform="translate(0 -2)" />
      <ellipse rx={rx} ry={ry} fill="none" stroke="#E4D9B2" strokeWidth={2} strokeDasharray="7 9" opacity={0.4} />
      {[90, 210, 330].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={0}
            y1={0}
            x2={Math.cos(rad) * rx * 0.92}
            y2={Math.sin(rad) * ry * 0.92}
            stroke="#1B211C"
            strokeWidth={t * 0.8}
            strokeLinecap="round"
          />
        );
      })}
      <ellipse rx={rx * 0.24} ry={ry * 0.24} fill="#141A16" stroke="#2A332C" strokeWidth={3} />
    </g>
  );
};

/** Rear-view mirror with a pine air freshener on a string. */
const Mirror: React.FC = () => (
  <g>
    <rect x={528} y={150} width={24} height={34} fill="#1E2620" />
    <path d="M 462 184 L 618 184 L 600 250 L 480 250 Z" fill="#0F1712" stroke="#2B3A30" strokeWidth={4} />
    <path d="M 478 194 L 560 194 L 548 232 L 484 232 Z" fill="#2D4A3A" opacity={0.35} />
    <line x1={540} y1={250} x2={540} y2={282} stroke="#A7A08A" strokeWidth={2} />
    <path d="M 540 284 L 514 332 L 528 332 L 506 374 L 574 374 L 552 332 L 566 332 Z" fill="#2F7A3E" />
  </g>
);

/** Head rest of the driver's seat, with stitching. */
const Headrest: React.FC = () => (
  <g>
    <path d="M 396 1040 Q 540 980 684 1040 L 708 1300 L 372 1300 Z" fill="#171E19" stroke="#2A3429" strokeWidth={6} />
    <path d="M 420 1080 Q 540 1040 660 1080" stroke="#2F3A2E" strokeWidth={3} fill="none" strokeDasharray="8 10" />
  </g>
);

/** Ethan from behind, seated: shoulders, neck, head. The head turns with `turn` (degrees). */
const BackOfHead: React.FC<{turn: number; breath: number}> = ({turn, breath}) => (
  <g transform={`translate(0 ${-breath * 5})`}>
    <path d="M 236 1920 Q 246 1500 330 1430 L 750 1430 Q 834 1500 844 1920 Z" fill="#2E3B2B" stroke="#1C2419" strokeWidth={6} />
    <path d="M 332 1450 Q 540 1412 748 1450" stroke="#4A5A45" strokeWidth={4} fill="none" opacity={0.6} />
    <path d="M 462 1270 L 618 1270 L 630 1440 L 450 1440 Z" fill="#A9765A" />
    <g transform={`rotate(${turn} 540 1280)`}>
      <ellipse cx={540} cy={1140} rx={108} ry={132} fill="#2A1D15" />
      <path d="M 452 1112 Q 470 1024 540 1016 Q 616 1024 630 1112 Q 600 1084 540 1084 Q 480 1084 452 1112 Z" fill="#3A2A20" opacity={0.7} />
      <ellipse cx={436} cy={1162} rx={18} ry={28} fill="#A9765A" />
      <ellipse cx={644} cy={1162} rx={18} ry={28} fill="#A9765A" />
    </g>
  </g>
);

/** Ethan in profile, seated: back against the seat, seatbelt across the chest, arm to the rim at nine o'clock. */
const SeatedEthan: React.FC<{mouth: number; blink: boolean; expr: Expr; breath: number}> = ({mouth, blink, expr, breath}) => {
  const brow = expr === 'scared' ? -10 : expr === 'joke' ? -5 : 0;
  return (
    <g>
      <path d="M 420 520 Q 450 480 520 500 L 600 1480 L 430 1500 Z" fill="#131915" stroke="#222B23" strokeWidth={4} />
      <path d="M 470 600 L 540 1420" stroke="#2A342B" strokeWidth={3} strokeDasharray="10 12" opacity={0.7} />
      <g transform={`translate(0 ${-breath * 3})`}>
        <path d="M 572 700 L 616 700 L 622 846 L 566 846 Z" fill="#A9744F" />
        <path d="M 468 850 Q 580 812 706 852 L 742 1330 L 452 1352 Z" fill="#2B3728" stroke="#1B2218" strokeWidth={4} />
        <path d="M 606 852 L 616 1330" stroke="#1A2116" strokeWidth={4} />
        <path d="M 520 1040 Q 600 1020 700 1040" stroke="#3E4C39" strokeWidth={3} fill="none" opacity={0.6} />
        <path d="M 694 846 L 500 1306" stroke="#1F201D" strokeWidth={22} strokeLinecap="round" />
        <path d="M 688 838 L 494 1296" stroke="#55564F" strokeWidth={3} opacity={0.6} />
      </g>
      <g transform="translate(600 680)">
        <ellipse cx={0} cy={0} rx={82} ry={96} fill="#C58D66" />
        <path d="M -86 -8 Q -96 -116 4 -118 Q 88 -112 90 -28 L 66 -36 Q 36 -76 -46 -66 Q -74 -44 -76 -6 Z" fill="#2A1E17" />
        <ellipse cx={-6} cy={12} rx={14} ry={22} fill="#AD7A56" />
        <path d="M 80 -6 Q 100 12 86 26 L 76 24 Z" fill="#B57B57" />
        <path
          d={`M 24 ${-36 + brow} Q 40 ${-48 + brow} 60 ${-38 + brow}`}
          stroke="#2A1E17"
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx={42} cy={-18} rx={10} ry={blink ? 1.5 : 7} fill="#F2EEE6" />
        {!blink && <circle cx={46} cy={-18} r={4.2} fill="#2A1A10" />}
        <path d="M 36 54 Q 56 60 74 50" stroke="#6E3A2E" strokeWidth={6} fill="none" strokeLinecap="round" />
        {mouth > 0.05 && <ellipse cx={56} cy={56} rx={12} ry={2 + mouth * 10} fill="#4A1F18" />}
        <path d="M 30 80 Q 58 98 80 62" stroke="#3A2A20" strokeWidth={22} opacity={0.3} fill="none" />
      </g>
      <path d="M 716 900 Q 744 1010 728 1080" stroke="#2B3728" strokeWidth={62} strokeLinecap="round" fill="none" />
      <path d="M 728 1080 Q 740 1120 752 1140" stroke="#2B3728" strokeWidth={52} strokeLinecap="round" fill="none" />
      <circle cx={756} cy={1146} r={24} fill="#B57B57" />
      <path d="M 470 1340 L 880 1380 L 892 1440 L 466 1404 Z" fill="#1E2A1D" />
    </g>
  );
};

/** Wiper arm sweeping across the glass; the cycle is 4 s. */
const Wiper: React.FC<{px: number; py: number; len: number; f: number}> = ({px, py, len, f}) => {
  const phase = (f % 120) / 120;
  const delta = -28 + 56 * (0.5 - 0.5 * Math.cos(phase * Math.PI * 2));
  return (
    <g transform={`translate(${px} ${py}) rotate(${-90 + delta})`}>
      <line x1={0} y1={0} x2={len} y2={0} stroke="#070807" strokeWidth={11} strokeLinecap="round" />
      <line x1={0} y1={-3} x2={len} y2={-3} stroke="#5A645C" strokeWidth={2} opacity={0.6} />
      <line x1={0} y1={0} x2={len * 0.12} y2={0} stroke="#2A302B" strokeWidth={16} strokeLinecap="round" />
    </g>
  );
};

/** Drops, sheen and fog on the glass, clipped to the opening. */
const Glass: React.FC<{hole: string; id: string; rain: number; wipers: boolean; fog?: boolean}> = ({
  hole,
  id,
  rain,
  wipers,
  fog = false,
}) => {
  const f = useCurrentFrame();
  const r = rng(91);
  const drops = Array.from({length: 90}, () => ({
    x: 80 + r() * 920,
    y: 160 + r() * 900,
    rad: 2 + r() * 7,
    slide: r() > 0.7,
  }));
  const n = Math.round(90 * Math.min(1, rain));
  return (
    <g>
      <defs>
        <clipPath id={`c${id}`}>
          <path d={hole} />
        </clipPath>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.42" stopColor="#FFFFFF" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`f${id}`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#9FB8AC" stopOpacity="0" />
          <stop offset="1" stopColor="#9FB8AC" stopOpacity={fog ? 0.3 : 0} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <path d={hole} fill={`url(#s${id})`} />
        <path d={hole} fill={`url(#f${id})`} />
        {drops.slice(0, n).map((d, i) => {
          const y = d.y + (d.slide ? (f * 0.4) % 80 : 0);
          return (
            <g key={i}>
              <circle cx={d.x} cy={y} r={d.rad} fill="#E7F3EE" opacity={0.22} />
              <circle cx={d.x - d.rad * 0.3} cy={y - d.rad * 0.3} r={d.rad * 0.35} fill="#FFFFFF" opacity={0.6} />
            </g>
          );
        })}
      </g>
      {wipers && (
        <g>
          <Wiper px={330} py={1112} len={700} f={f} />
          <Wiper px={750} py={1112} len={700} f={f} />
        </g>
      )}
    </g>
  );
};

/** Angle A: from behind the driver's seat, over the shoulder. Windscreen, mirror, wheel, Ethan's head and shoulders. */
export const CabinA: React.FC<{
  rain?: number;
  wipers?: boolean;
  expr?: Expr;
  turn?: number;
  wheel?: number;
  gps?: GpsProps;
  dim?: number;
}> = ({rain = 0.6, wipers = true, turn = 0, wheel = 0, gps, dim = 0}) => {
  const f = useCurrentFrame();
  const uid = safeId(useId());
  const breath = Math.sin((f / 30) * Math.PI * 2 * 0.25);
  const bounce = Math.sin(f * 0.23) * 1.5 + Math.sin(f * 0.61) * 1;
  return (
    <g transform={`translate(0 ${bounce})`}>
      <Trim hole={WINDSCREEN} id={`t${uid}`} />
      <Mirror />
      <Wheel cx={540} cy={1250} rx={330} ry={230} rot={wheel} />
      <Headrest />
      <Dash id={`d${uid}`} />
      {gps && <Navigator x={820} y={560} s={0.42} mode={gps.mode} instruction={gps.instruction} glitch={gps.glitch ?? 0} />}
      <BackOfHead turn={turn} breath={breath} />
      <Glass hole={WINDSCREEN} id={`g${uid}`} rain={rain} wipers={wipers} fog />
      {dim > 0 && <rect x={-200} y={-200} width={1500} height={2300} fill="#000" opacity={dim} />}
    </g>
  );
};

/** Angle B: sideways, through the passenger side, the driver's window behind him and Ethan in profile. */
export const CabinB: React.FC<{
  rain?: number;
  expr?: Expr;
  mouth?: number;
  wheel?: number;
  glow?: number;
  dim?: number;
}> = ({rain = 0.6, expr = 'calm', mouth = 0, wheel = 0, glow = 0, dim = 0}) => {
  const f = useCurrentFrame();
  const uid = safeId(useId());
  const breath = Math.sin((f / 30) * Math.PI * 2 * 0.25);
  const blink = f % 150 < 5;
  const bounce = Math.sin(f * 0.23) * 1.5 + Math.sin(f * 0.61) * 1;
  return (
    <g transform={`translate(0 ${bounce})`}>
      <Trim hole={SIDE_WINDOW} id={`t${uid}`} />
      <Dash id={`d${uid}`} />
      <SeatedEthan mouth={mouth} blink={blink} expr={expr} breath={breath} />
      <Wheel cx={960} cy={1150} rx={210} ry={260} rot={wheel} />
      <Glass hole={SIDE_WINDOW} id={`g${uid}`} rain={rain} wipers={false} />
      {glow > 0 && <ScreenGlow cx={820} cy={1020} r={320} opacity={glow} />}
      {dim > 0 && <rect x={-200} y={-200} width={1500} height={2300} fill="#000" opacity={dim} />}
    </g>
  );
};

/** Angle C: close-up of the navigator on the dashboard, the cluster and the wheel below it. */
export const CabinC: React.FC<{
  gps: GpsProps;
  rain?: number;
  wipers?: boolean;
  wheel?: number;
  dim?: number;
}> = ({gps, rain = 0.8, wipers = true, wheel = 0, dim = 0}) => {
  const f = useCurrentFrame();
  const uid = safeId(useId());
  const bounce = Math.sin(f * 0.23) * 1.5 + Math.sin(f * 0.61) * 1;
  const speed = 0.42 + 0.08 * Math.sin(f * 0.035);
  const rpm = 0.5 + 0.1 * Math.sin(f * 0.05 + 1);
  return (
    <g transform={`translate(0 ${bounce})`}>
      <Trim hole={WINDSCREEN} id={`t${uid}`} />
      <Dash id={`d${uid}`} />
      <Gauge cx={600} cy={1330} r={84} v={speed} label="KM/H" />
      <Gauge cx={800} cy={1330} r={84} v={rpm} label="RPM" />
      <Wheel cx={290} cy={1560} rx={300} ry={240} rot={wheel} />
      <Navigator x={540} y={740} s={1.05} mode={gps.mode} instruction={gps.instruction} glitch={gps.glitch ?? 0} />
      <Glass hole={WINDSCREEN} id={`g${uid}`} rain={rain} wipers={wipers} fog />
      {dim > 0 && <rect x={-200} y={-200} width={1500} height={2300} fill="#000" opacity={dim} />}
    </g>
  );
};
