import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, INK, clamp, prog, easeOut, outBack} from './theme';
import {Harold, Margaret, Judge, Goat, Stamp, Book, Paper, Counter, Sky, Town, Trees, LibraryFacade, Shelves, Limb} from './art';

// Каждая сцена получает локальное время t (секунды от её начала).
const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

const Stage: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = '#1b1410'}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      {children}
    </svg>
  </AbsoluteFill>
);

const money = (v: number) => '$' + Math.round(v).toLocaleString('en-US');

// 1. HOOK: закатный город гаснет, красный штамп BANKRUPT, Гарольд с книгой
export const Hook: React.FC = () => {
  const t = useT();
  return (
    <Stage>
      <Sky id="hook" top="#f2a46a" bottom="#6b3d5a" />
      <Town lit={1 - prog(t, 0.2, 2.4)} seed={2} />
      <Trees t={t} />
      <Harold x={540} y={1600} s={1.15} t={t} pose="hold" speak={t < 2.9} seed={1} />
      <Stamp x={540} y={520} t={t} t0={0.9} text="BANKRUPT" color="#c62828" size={110} rot={-7} />
    </Stage>
  );
};

// 2. TITLE 1954: сепия, молодой Гарольд в библиотеке
export const Title1954: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#5b4128">
      <Sky id="t1954" top="#d9b98a" bottom="#8a6a45" />
      <Shelves x={60} y={880} w={960} rows={3} seed={4} />
      <rect x={0} y={1300} width={1080} height={620} fill="#6b4a30" stroke={INK} strokeWidth={5} />
      <Harold young x={540} y={1600} s={1.0} t={t} speak={t > 0.0 && t < 1.7} seed={2} />
      <Paper x={260} y={330} w={560} h={230} rot={-2} lines={['1954']} size={150} tone="#efe2c2" />
    </Stage>
  );
};

// 3. CHECKOUT: книга «Fishing for Beginners» на выдаче
export const Checkout: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#5b4128">
      <Sky id="chk" top="#e0b880" bottom="#7a5a3c" />
      <Shelves x={60} y={880} w={960} rows={3} seed={6} />
      <rect x={0} y={1300} width={1080} height={620} fill="#6b4a30" stroke={INK} strokeWidth={5} />
      <Book x={540} y={840} s={1.6} rot={-3} />
      <Harold young x={540} y={1600} s={1.0} t={t} speak={t < 2.6} seed={3} />
    </Stage>
  );
};

// 4. DUE: штамп «DUE IN 2 WEEKS» и карточка с датой
export const Due: React.FC = () => {
  const t = useT();
  return (
    <Stage>
      <Sky id="due" top="#f0c08a" bottom="#8b5a4a" />
      <Paper x={170} y={240} w={740} h={540} rot={-3} lines={['DUE DATE', 'Two weeks']} size={70} tone="#f4ecd8" />
      <Stamp x={540} y={600} t={t} t0={0.35} text="DUE IN 2 WEEKS" color="#1e5fb5" size={80} rot={5} />
      <Harold young x={540} y={1620} s={0.9} t={t} speak={t < 2.2} seed={4} />
    </Stage>
  );
};

// 5. MONTAGE: 70 лет за полторы секунды: телевизоры и годы
export const Montage: React.FC = () => {
  const t = useT();
  const idx = Math.min(3, Math.floor(t / 0.42));
  const bgs = ['#3a3a3a', '#5b3c7a', '#2d5f7a', '#1f3a2c'];
  const years = ['1954', '1978', '1996', '2024'];
  return (
    <Stage bg={bgs[idx]}>
      <rect x={0} y={0} width={1080} height={1920} fill={bgs[idx]} />
      <Paper x={300} y={540} w={480} h={330} lines={[years[idx]]} size={110} tone="#f5efdf" />
      <rect x={260} y={960} width={560} height={380} rx={26} fill="#2a2a2e" stroke={INK} strokeWidth={8} />
      <rect x={290} y={990} width={500} height={320} rx={14} fill={idx === 0 ? '#9aa0a6' : idx === 1 ? '#e0a030' : idx === 2 ? '#3aa0b0' : '#ffe8c0'} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={560 + i * 30 * Math.sin(t * 8)} y={1400} width={50} height={22} fill="#2a2a2e" stroke={INK} strokeWidth={3} />
      ))}
      <Paper x={600 - t * 900} y={1500} w={300} h={140} rot={-14} lines={['CALENDAR']} size={36} />
    </Stage>
  );
};

// 6. ATTIC: чердак, шаткий стол с книгой под ножкой
export const Attic: React.FC = () => {
  const t = useT();
  const wob = Math.sin(t * 11) * 2.2 * clamp(t / 0.6);
  return (
    <Stage bg="#2a1f18">
      <rect x={0} y={0} width={1080} height={1920} fill="#2a1f18" />
      {[160, 540, 920].map((x) => <rect key={x} x={x - 14} y={0} width={28} height={1920} fill="#4a3424" stroke={INK} strokeWidth={4} />)}
      <rect x={0} y={420} width={1080} height={26} fill="#4a3424" stroke={INK} strokeWidth={4} />
      <rect x={60} y={1240} width={260} height={220} fill="#6e4f36" stroke={INK} strokeWidth={5} />
      <rect x={760} y={1180} width={240} height={280} fill="#5a4030" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${wob} 540 1260)`}>
        <rect x={330} y={1180} width={420} height={36} fill="#9a7a58" stroke={INK} strokeWidth={6} />
        <rect x={520} y={1216} width={36} height={300} fill="#7a5a40" stroke={INK} strokeWidth={5} />
        <Book x={600} y={1480} s={0.5} rot={90} />
      </g>
      <Harold x={300} y={1600} s={1.0} t={t} pose="stand" mood="calm" seed={5} />
    </Stage>
  );
};

// 7. TABLE: стол падает, книга выскальзывает
export const Table: React.FC = () => {
  const t = useT();
  const fall = easeOut(prog(t, 0.1, 0.7)) * 84;
  return (
    <Stage bg="#2a1f18">
      <rect x={0} y={0} width={1080} height={1920} fill="#2a1f18" />
      <rect x={0} y={1500} width={1080} height={420} fill="#4a3424" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${fall} 470 1490)`}>
        <rect x={250} y={1180} width={420} height={36} fill="#9a7a58" stroke={INK} strokeWidth={6} />
        <rect x={450} y={1216} width={36} height={270} fill="#7a5a40" stroke={INK} strokeWidth={5} />
      </g>
      <Book x={760 + t * 120} y={1420 + t * 40} s={0.8} rot={t * 60} />
      <Harold x={380} y={1620} s={1.0} t={t} mood="wide" seed={6} />
    </Stage>
  );
};

// 8. CAR: старая машина, деревья уплывают назад
export const Car: React.FC = () => {
  const t = useT();
  const spin = t * 260;
  return (
    <Stage bg="#c98a5a">
      <Sky id="car" top="#f2b07a" bottom="#8b5a4a" />
      <g transform={`translate(${-(t * 320) % 500} 0)`}>
        <Trees t={t} />
      </g>
      <rect x={0} y={1420} width={1080} height={500} fill="#5a4a3c" stroke={INK} strokeWidth={5} />
      <Harold x={470} y={1290} s={0.62} t={t} seed={7} />
      <rect x={160} y={1120} width={760} height={330} rx={60} fill="#7a3f2c" stroke={INK} strokeWidth={8} />
      <path d="M 260 1150 L 830 1150 L 880 1290 L 210 1290 Z" fill="#a8d4e0" stroke={INK} strokeWidth={6} opacity={0.85} />
      {[300, 790].map((x) => (
        <g key={x} transform={`translate(${x},1460) rotate(${spin})`}>
          <circle r={96} fill="#1d1714" stroke={INK} strokeWidth={8} />
          <circle r={34} fill="#c9c2b5" stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={-6} y={-70} width={12} height={140} fill="#3a2d24" transform={`rotate(${k * 45})`} />)}
        </g>
      ))}
    </Stage>
  );
};

// 9. SCAN: Маргарет сканирует книгу
export const Scan: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#4a3424">
      <Shelves x={40} y={520} w={1000} rows={3} seed={8} />
      <rect x={0} y={1260} width={1080} height={660} fill="#6b4a30" stroke={INK} strokeWidth={5} />
      <rect x={180} y={1240} width={720} height={60} fill="#8a6442" stroke={INK} strokeWidth={6} />
      <Book x={480} y={1210} s={0.5} rot={-8} />
      <Margaret x={620} y={1600} s={1.05} t={t} pose="scan" speak={t < 1.0} seed={9} />
    </Stage>
  );
};

// 10. SMOKE: старый монитор дымится, искры
export const Smoke: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#4a3424">
      <Shelves x={40} y={520} w={1000} rows={3} seed={10} />
      <rect x={0} y={1260} width={1080} height={660} fill="#6b4a30" stroke={INK} strokeWidth={5} />
      <rect x={320} y={860} width={400} height={330} rx={26} fill="#c9b99a" stroke={INK} strokeWidth={8} />
      <rect x={360} y={900} width={320} height={250} rx={14} fill="#1f4a3c" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => {
        const k = clamp((t - 0.3 - i * 0.25) / 1.2);
        return <circle key={i} cx={470 + i * 40 + Math.sin(i) * 10} cy={880 - k * 180} r={34 + k * 40} fill="#5a5048" opacity={0.7 * (1 - k)} />;
      })}
      {Array.from({length: 8}).map((_, i) => (
        <line key={i} x1={520 + i * 14} y1={960} x2={540 + i * 14 + Math.sin(t * 40 + i) * 12} y2={900 + Math.cos(t * 30 + i) * 40} stroke="#ffd64a" strokeWidth={6} strokeLinecap="round" opacity={t > 0.4 ? 0.9 : 0} />
      ))}
      <Margaret x={540} y={1600} s={1.0} t={t} mood="wide" seed={11} />
    </Stage>
  );
};

// 11. COUNTER: «$0.10 a day», «plus interest», «since 1954»
export const CounterShot: React.FC = () => {
  const t = useT();
  const label = t < 1.8 ? '$0.10 A DAY' : t < 3.4 ? 'PLUS INTEREST' : 'SINCE 1954';
  const value = t < 1.8 ? '$0.10' : t < 3.4 ? '+ INTEREST' : '1954';
  return (
    <Stage bg="#2b2118">
      <Counter x={540} y={480} w={900} value={value} label={label} />
      <Harold x={540} y={1620} s={0.95} t={t} mood="sad" seed={12} />
    </Stage>
  );
};

// 12. TOTAL: «The total?» и очки Маргарет съезжают вниз
export const Total: React.FC = () => {
  const t = useT();
  const slide = easeOut(prog(t, 0.2, 0.9)) * 28;
  return (
    <Stage bg="#2b2118">
      <Paper x={300} y={280} w={480} h={260} lines={['THE TOTAL?']} size={58} />
      <Margaret x={540} y={1600} s={1.0} t={t} mood="wide" seed={13} />
      <g transform={`translate(0,${slide})`} />
    </Stage>
  );
};

// 13. MILLION: счётчик катится до $1,200,000
export const Million: React.FC = () => {
  const t = useT();
  const v = 1200000 * easeOut(prog(t, 0.0, 2.1));
  const hot = t > 1.2;
  return (
    <Stage bg="#2b2118">
      <Counter x={540} y={480} w={960} value={money(v)} label="TOTAL OWED" color={hot ? '#ff5a4a' : '#ffd64a'} />
      <Harold x={540} y={1620} s={0.95} t={t} mood="wide" seed={14} />
    </Stage>
  );
};

// 14. WALLET: $43 и одна пуговица
export const Wallet: React.FC = () => {
  const t = useT();
  const fallY = clamp(t / 0.9) * 360;
  return (
    <Stage bg="#2b2118">
      <Paper x={230} y={300} w={620} h={300} rot={-4} lines={['$43.00']} size={120} tone="#dfe8d0" />
      <circle cx={840} cy={960 + fallY} r={34} fill="#c9963a" stroke={INK} strokeWidth={6} />
      <Harold x={470} y={1620} s={1.0} t={t} mood="sad" seed={15} />
    </Stage>
  );
};

// 15. GOAT: коза просовывает голову
export const GoatShot: React.FC = () => {
  const t = useT();
  const inX = 900 - easeOut(prog(t, 0.0, 0.5)) * 260;
  return (
    <Stage bg="#2b2118">
      <Goat x={inX} y={1220} s={1.5} t={t} bleat={t > 0.15 && t < 0.9} />
      <Harold x={360} y={1620} s={1.0} t={t} mood="wide" seed={16} />
    </Stage>
  );
};

// 16. COURT: судья стучит молотком, «Pay with anything you own»
export const Court: React.FC = () => {
  const t = useT();
  const hit = t > 0.75 && t < 0.95;
  return (
    <Stage bg="#3d2a20">
      <rect x={0} y={0} width={1080} height={1920} fill="#3d2a20" />
      <rect x={120} y={380} width={840} height={620} fill="#5a3e2a" stroke={INK} strokeWidth={6} />
      <Judge x={540} y={1180} s={0.95} t={t} speak={t > 0.14 && t < 1.42} />
      <rect x={0} y={1160} width={1080} height={44} fill="#8a6442" stroke={INK} strokeWidth={5} />
      <g transform={`translate(780,1080) rotate(${hit ? 40 : -18} 0 0)`}>
        <rect x={-14} y={-14} width={150} height={28} rx={8} fill="#c9963a" stroke={INK} strokeWidth={5} />
        <rect x={-40} y={-44} width={70} height={46} rx={8} fill="#8a6442" stroke={INK} strokeWidth={5} />
      </g>
      <Harold x={250} y={1620} s={1.0} t={t} mood="calm" seed={17} />
    </Stage>
  );
};

// 17. FLASHBACK: лампочка загорается, дарственная бумага
export const Flashback: React.FC = () => {
  const t = useT();
  const on = easeOut(prog(t, 0.6, 1.1));
  return (
    <Stage bg="#1f1812">
      <circle cx={540} cy={470} r={260} fill="#ffe59a" opacity={0.25 * on} />
      <circle cx={540} cy={470} r={120} fill={`rgba(255,220,120,${0.5 + 0.5 * on})`} stroke={INK} strokeWidth={6} />
      <rect x={512} y={580} width={56} height={60} fill="#7a7a84" stroke={INK} strokeWidth={5} />
      <Paper x={40} y={640} w={400} h={200} rot={4} lines={['GRANDPA’S DEED']} size={40} tone="#efe2c2" />
      <Harold x={700} y={1620} s={1.0} t={t} mood="smirk" speak={t < 2.2} seed={18} />
    </Stage>
  );
};

// 18. DEED_MAP: карта, красная граница накрывает весь город
export const DeedMap: React.FC = () => {
  const t = useT();
  const z = 0.45 + 0.55 * easeOut(prog(t, 0.0, 1.0));
  return (
    <Stage bg="#2b2118">
      <g transform={`translate(540,960) scale(${z}) translate(-540,-960)`}>
        <rect x={120} y={560} width={840} height={820} fill="#e8d6a8" stroke={INK} strokeWidth={8} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={170 + i * 150} y={620 + (i % 2) * 90} width={110} height={90} fill="#c9a878" stroke={INK} strokeWidth={4} />)}
        <rect x={80} y={520} width={920} height={900} fill="none" stroke="#c62828" strokeWidth={16} strokeDasharray="30 18" />
      </g>
      <Harold x={540} y={1620} s={0.95} t={t} mood="calm" speak={t < 1.9} seed={19} />
    </Stage>
  );
};

// 19. STAMPS: библиотека забирает банк, пекарню и пожарную часть (три штампа)
export const Stamps: React.FC = () => {
  const t = useT();
  const k = t < 1.7 ? 0 : t < 3.6 ? 1 : 2;
  const names = ['BANK', 'BAKERY', 'FIRE STATION'];
  const local = k === 0 ? t : k === 1 ? t - 1.7 : t - 3.6;
  return (
    <Stage bg="#2b2118">
      <rect x={0} y={1260} width={1080} height={660} fill="#6b4a30" stroke={INK} strokeWidth={5} />
      {k === 0 && (
        <g>
          <rect x={150} y={760} width={780} height={460} fill="#d9c4a0" stroke={INK} strokeWidth={6} />
          {[260, 420, 580, 740].map((x) => <rect key={x} x={x} y={820} width={40} height={400} fill="#f5ecd6" stroke={INK} strokeWidth={4} />)}
          <text x={540} y={830} fontFamily={FONT} fontWeight={800} fontSize={60} fill="#3a2b20" textAnchor="middle">{names[0]}</text>
        </g>
      )}
      {k === 1 && (
        <g>
          <rect x={200} y={820} width={680} height={400} rx={18} fill="#e8b878" stroke={INK} strokeWidth={6} />
          <text x={540} y={860} fontFamily={FONT} fontWeight={800} fontSize={60} fill="#3a2b20" textAnchor="middle">{names[1]}</text>
        </g>
      )}
      {k === 2 && (
        <g>
          <rect x={160} y={800} width={760} height={420} fill="#b5563b" stroke={INK} strokeWidth={6} />
          <rect x={300} y={900} width={180} height={320} fill="#ffe0b0" stroke={INK} strokeWidth={5} />
          <rect x={600} y={900} width={180} height={320} fill="#ffe0b0" stroke={INK} strokeWidth={5} />
          <text x={540} y={860} fontFamily={FONT} fontWeight={800} fontSize={52} fill="#fff" textAnchor="middle">{names[2]}</text>
        </g>
      )}
      <Stamp x={540} y={520} t={local} t0={0.2} text="PROPERTY OF MILLBROOK LIBRARY" color="#c62828" size={44} rot={-4} />
      <Harold x={540} y={1620} s={0.8} t={t} mood="smirk" seed={20} />
    </Stage>
  );
};

// 20. MAYOR: Маргарет за трибуной, мэр, лента «MAYOR»
export const Mayor: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#24303a">
      <rect x={0} y={900} width={1080} height={1020} fill="#3a2a20" />
      <rect x={300} y={1180} width={480} height={420} fill="#5a3e2a" stroke={INK} strokeWidth={6} />
      <Margaret x={540} y={1600} s={1.05} t={t} pose="podium" speak={t < 2.2} seed={21} />
      <path d="M 300 1000 L 720 1400 L 690 1440 L 270 1040 Z" fill="#c62828" stroke={INK} strokeWidth={5} />
      <text x={470} y={1205} fontFamily={FONT} fontWeight={800} fontSize={44} fill="#ffe6a8" textAnchor="middle" transform="rotate(38 470 1205)">MAYOR</text>
    </Stage>
  );
};

// 21. WHISPER: «whispering only» — палец у губ, голос тихий
export const Whisper: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#24303a">
      <rect x={0} y={900} width={1080} height={1020} fill="#3a2a20" />
      <rect x={300} y={1180} width={480} height={420} fill="#5a3e2a" stroke={INK} strokeWidth={6} />
      <Margaret x={540} y={1600} s={1.05} t={t} pose="podium" speak={t < 1.7} seed={22} />
      <text x={540} y={480} fontFamily={FONT} fontWeight={800} fontSize={120} fill="#ffe6a8" textAnchor="middle" opacity={0.2 + 0.8 * prog(t, 0.1, 0.5)}>shh…</text>
    </Stage>
  );
};

// 22. TOWN_GAGS: гудок запрещён, чихание — штраф $10
export const TownGags: React.FC = () => {
  const t = useT();
  const sneeze = t > 2.75;
  return (
    <Stage bg="#e0a060">
      <Sky id="gags" top="#f2c48a" bottom="#8b5a4a" />
      <rect x={0} y={1260} width={1080} height={660} fill="#4e3a2c" />
      {!sneeze ? (
        <g>
          <Paper x={170} y={560} w={740} h={260} lines={['NO HONKING']} size={96} tone="#f4ecd8" />
          <rect x={300} y={1220} width={480} height={240} rx={40} fill="#7a3f2c" stroke={INK} strokeWidth={8} />
          <circle cx={400} cy={1460} r={60} fill="#1d1714" stroke={INK} strokeWidth={6} />
          <circle cx={680} cy={1460} r={60} fill="#1d1714" stroke={INK} strokeWidth={6} />
          <path d="M 620 1310 L 720 1260" stroke={INK} strokeWidth={12} strokeLinecap="round" opacity={Math.sin(t * 24) > 0 ? 1 : 0.2} />
        </g>
      ) : (
        <g>
          <Harold young x={420} y={1600} s={0.95} t={t} mood="wide" seed={23} />
          <text x={620} y={640} fontFamily={FONT} fontWeight={800} fontSize={112} fill="#ffffff" stroke={INK} strokeWidth={8} paintOrder="stroke" textAnchor="middle">AH-CHOO!</text>
          <Paper x={560} y={760} w={440} h={200} rot={-6} lines={['$10 FINE']} size={70} tone="#f4ecd8" />
        </g>
      )}
    </Stage>
  );
};

// 23. LAKE: закат, док, Гарольд читает книгу
export const Lake: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#c9703a">
      <Sky id="lake" top="#f5b070" bottom="#7a3e5a" />
      <circle cx={540} cy={1000} r={150} fill="#ffd27a" opacity={0.9} />
      <rect x={0} y={1180} width={1080} height={740} fill="#2b4a5a" />
      {[1260, 1360, 1480, 1600].map((y, i) => (
        <ellipse key={y} cx={540 + Math.sin(t * 1.4 + i) * 40} cy={y} rx={180 - i * 20} ry={8} fill="#ffd27a" opacity={0.5} />
      ))}
      <rect x={260} y={1400} width={560} height={40} fill="#6e4f36" stroke={INK} strokeWidth={5} />
      <Harold x={540} y={1400} s={0.8} t={t} mood="calm" seed={24} />
      <Book x={600} y={1240} s={0.55} rot={-10} />
    </Stage>
  );
};

// 24. ROD: удочка гнётся, всплеск, из воды — мокрая библиотечная книга
export const Rod: React.FC = () => {
  const t = useT();
  const bend = t > 0.8 ? 14 * Math.sin((t - 0.8) * 8) : 0;
  const splash = clamp((t - 1.28) / 0.7);
  return (
    <Stage bg="#c9703a">
      <Sky id="rod" top="#f5b070" bottom="#7a3e5a" />
      <rect x={0} y={1180} width={1080} height={740} fill="#2b4a5a" />
      <rect x={260} y={1400} width={560} height={40} fill="#6e4f36" stroke={INK} strokeWidth={5} />
      <Harold x={380} y={1400} s={0.8} t={t} mood="wide" seed={25} />
      <path d={`M 470 1160 Q ${640 + bend * 4} ${1160 - 60} ${760} ${1020 + bend}`} stroke="#4a3424" strokeWidth={12} fill="none" strokeLinecap="round" />
      <line x1={760} y1={1020 + bend} x2={770} y2={1420} stroke={INK} strokeWidth={3} />
      <ellipse cx={770} cy={1430} rx={60 * splash + 10} ry={16 * splash + 4} fill="none" stroke="#ffe6a8" strokeWidth={8} opacity={1 - splash} />
      {t > 1.6 && <Book x={760} y={1500} s={0.6} rot={-12} title="Overdue Library" cover="#7a6a50" />}
    </Stage>
  );
};

// 25. DUE_1931: квитанция «DUE 1931» и «BORROWER: E. WHITMORE»
export const Due1931: React.FC = () => {
  const t = useT();
  const zoom = t > 2.1 ? 1 + 0.5 * easeOut(prog(t, 2.1, 2.8)) : 1;
  return (
    <Stage bg="#2b2118">
      <g transform={`translate(540,760) scale(${zoom}) translate(-540,-760)`}>
        <Paper x={160} y={500} w={760} h={520} rot={-2} lines={['DUE: 1931', 'BORROWER:', 'E. WHITMORE']} size={68} tone="#f4ecd8" />
      </g>
      <Stamp x={700} y={1000} t={t} t0={0.3} text="OVERDUE" color="#c62828" size={80} rot={-5} />
      <Harold x={240} y={1640} s={0.5} t={t} mood="calm" seed={26} />
    </Stage>
  );
};

// 26. OFFICE: портрет деда, Маргарет смотрит в камеру
export const Office: React.FC = () => {
  const t = useT();
  return (
    <Stage bg="#3a2a20">
      <rect x={0} y={0} width={1080} height={1260} fill="#4e3a2c" />
      <rect x={280} y={340} width={520} height={600} fill="#c9a14a" stroke={INK} strokeWidth={10} />
      <rect x={320} y={380} width={440} height={520} fill="#d9c4a0" stroke={INK} strokeWidth={5} />
      <circle cx={540} cy={560} r={92} fill="#e6b08a" stroke={INK} strokeWidth={5} />
      <path d="M 470 620 Q 540 660 610 620" stroke={INK} strokeWidth={10} fill="none" />
      <text x={540} y={800} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#3a2b20" textAnchor="middle">E. WHITMORE</text>
      <Margaret x={540} y={1600} s={1.0} t={t} mood="calm" seed={27} />
    </Stage>
  );
};

// Соответствие: id сцены в timeline.json -> компонент
export const SHOT_COMPONENTS: Record<string, React.FC> = {
  HOOK: Hook,
  TITLE_1954: Title1954,
  CHECKOUT: Checkout,
  DUE_STAMP: Due,
  MONTAGE: Montage,
  ATTIC: Attic,
  TABLE: Table,
  CAR: Car,
  SCAN: Scan,
  SMOKE: Smoke,
  COUNTER: CounterShot,
  TOTAL: Total,
  MILLION: Million,
  WALLET: Wallet,
  GOAT: GoatShot,
  COURT: Court,
  FLASHBACK: Flashback,
  DEED_MAP: DeedMap,
  STAMPS: Stamps,
  MAYOR: Mayor,
  WHISPER: Whisper,
  TOWN_GAGS: TownGags,
  LAKE: Lake,
  ROD: Rod,
  DUE_1931: Due1931,
  OFFICE: Office,
};
