import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, Lights, Sky, Solid, Street, Tree, House, ClockTower, Car, Lamp, camAt, project, signTex, wallTex, woodTex, groundTex, roofTex, W, H, CamKey, Cam} from './scene3d';
import {Bean, Watch, Cup, Suitcase, Scroll, Gavel, Confetti, Bubble, Cake, LOOKS, Look, Pose, Face} from './chars';

// Общая обвязка шота: 3D-мир (three.js), персонажи (SVG, проекцией той же камеры), светотень, сепия для 1887.
export type ShotProps = {t: number};
type BaseProps = {keys: CamKey[]; t: number; sky?: [string, string, string]; light?: 'day' | 'golden' | 'night'; sepia?: boolean; children?: React.ReactNode; over?: (cam: Cam) => React.ReactNode; extra?: React.ReactNode};
const Base: React.FC<BaseProps> = ({keys: keysIn, t, sky = ['#7fb8e6', '#bfe0ff', '#f0d7b0'], light = 'day', sepia = false, children, over, extra}) => {
  // общий отъезд камеры (x1.6 от точки взгляда) и угол 50° — чтобы в кадр помещались люди и сцена
  const keys = keysIn.map((k) => ({...k, p: k.l.map((v, i) => v + (k.p[i] - v) * 1.6) as [number, number, number], f: 50}));
  const cam = camAt(keys, t);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, filter: sepia ? 'sepia(0.75) saturate(1.1) contrast(1.05)' : undefined}}>
        <ThreeCanvas width={W} height={H} camera={{fov: 40, near: 0.1, far: 900, position: [0, 2, 10]}}>
          <CameraRig keys={keys} t={t} />
          <Lights preset={light} />
          <Sky top={sky[0]} mid={sky[1]} low={sky[2]} />
          {children}
        </ThreeCanvas>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        {extra}
        {over ? over(cam) : null}
      </svg>
    </AbsoluteFill>
  );
};

// Персонаж в мире: положение на полу (x, z) → экран; масштаб по расстоянию
const place = (cam: Cam, x: number, z: number) => {
  const q = project([x, 0, z], cam);
  return {x: q.x, y: q.y, s: 620 / 700};
};
const Who: React.FC<{cam: Cam; x: number; z: number; look: Look | string; pose?: Pose; face?: Face; t: number; flip?: boolean; talk?: number; sweat?: boolean; phase?: number}> = ({cam, x, z, look, pose, face, t, flip, talk, sweat, phase}) => {
  const p = place(cam, x, z);
  return <Bean x={p.x} y={p.y} s={p.s} t={t} look={look} pose={pose} face={face} flip={flip} talk={talk} sweat={sweat} phase={phase} />;
};

// Круглые часы на стене (кабинет)
const WallClock: React.FC<{x: number; y: number; z: number; hour: number; minute: number; r?: number}> = ({x, y, z, hour, minute, r = 1.2}) => {
  const face = signTex('wallclock', [' '], '#f6eedc', '#2a1d14', 512, 512);
  const ha = ((hour % 12) * 30 + minute * 0.5) * Math.PI / 180;
  const ma = minute * 6 * Math.PI / 180;
  return (
    <group position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
      <Solid geo="cyl" args={[r, r, 0.12, 28]} color="#f6eedc" map={face} />
      <Solid geo="box" args={[0.08, r * 0.7, 0.05]} p={[0, r * 0.35, 0.09]} r={[0, 0, -ha]} color="#2a1d14" ink={false} />
      <Solid geo="box" args={[0.06, r * 0.9, 0.05]} p={[0, r * 0.45, 0.1]} r={[0, 0, -ma]} color="#2a1d14" ink={false} />
    </group>
  );
};

// Кабинет: стены, пол, окно, стол
const Office: React.FC<{}> = () => (
  <group>
    <Solid geo="plane" args={[18, 12]} p={[0, 6, -4]} color="#d7c7aa" map={wallTex('#d7c7aa', '#7a6a50', '#fff6e4')} basic />
    <Solid geo="plane" args={[18, 12]} p={[0, 6, 8]} r={[0, Math.PI, 0]} color="#c8b898" map={wallTex('#c8b898', '#6a5a40', '#fff6e4')} basic />
    <Solid geo="plane" args={[16, 16]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8a6a48" map={woodTex('#8a6a48')} basic />
    <Solid geo="plane" args={[3.4, 2.4]} p={[-4.8, 4.2, -3.9]} color="#a9d6ef" basic />
    <Solid geo="box" args={[5.2, 0.14, 2.2]} p={[0, 1.02, -2.6]} color="#7a5230" map={woodTex('#7a5230')} />
    <Solid geo="box" args={[0.12, 1.0, 0.12]} p={[-2.4, 0.5, -2.6]} color="#4a3220" />
    <Solid geo="box" args={[0.12, 1.0, 0.12]} p={[2.4, 0.5, -2.6]} color="#4a3220" />
  </group>
);

// 1. OFFICE_HOOK — часы 9:00, Уолтер улыбается
const keysHook: CamKey[] = [{t: 0, p: [0, 1.9, 2.4], l: [0, 2.7, -4], f: 36}, {t: 2.6, p: [0.3, 1.9, 4.0], l: [0, 2.6, -4], f: 42}];
export const ShotOfficeHook: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysHook} t={t} light="day" sky={['#bfe0ff', '#e6f2ff', '#f6e6c8']}
    over={(cam) => <Who cam={cam} x={0.1} z={0.6} look="walter" pose="stand" face="smile" t={t} />}>
    <Office />
    <WallClock x={0} y={3.0} z={-3.9} hour={9} minute={0} r={1.3} />
    <Solid geo="box" args={[0.6, 0.4, 0.2]} p={[1.6, 1.22, -2.6]} color="#3a2a20" />
  </Base>
);

// 2. ARREST — два полицейских, красно-синий свет, удар (тряска в композиции)
const keysArrest: CamKey[] = [{t: 0, p: [0, 1.8, 3.6], l: [0, 1.7, 0], f: 40}, {t: 2, p: [0, 1.8, 3.0], l: [0, 1.7, 0], f: 40}];
export const ShotArrest: React.FC<ShotProps> = ({t}) => {
  const red = 1.2 + 1.4 * Math.abs(Math.sin(t * 9));
  const blue = 1.2 + 1.4 * Math.abs(Math.cos(t * 9));
  return (
    <Base keys={keysArrest} t={t} light="night" sky={['#1d2238', '#2a3050', '#3a3a5a']}
      over={(cam) => (
        <g>
          <Who cam={cam} x={-0.9} z={0} look="cop" pose="stand" face="stern" t={t} />
          <Who cam={cam} x={0.9} z={0} look="cop" pose="stand" face="stern" t={t} flip />
          <Who cam={cam} x={0} z={0} look="walter" pose="stand" face="shock" t={t} sweat />
        </g>
      )}>
      <Office />
      <WallClock x={0} y={3.0} z={-3.9} hour={9} minute={0} r={1.3} />
      <pointLight position={[-2, 2.2, 1.5]} color="#ff3030" intensity={red} distance={9} />
      <pointLight position={[2, 2.2, 1.5]} color="#3060ff" intensity={blue} distance={9} />
    </Base>
  );
};

// 3. AERIAL — долина, городок, башня в центре, золотой утренний свет
const townHouses: [number, number, number, number, number, string][] = [
  [-14, -10, 5, 6, 7, '#e8b68a'], [-6, -10, 5, 6, 8, '#cf8a6a'], [2, -10, 5, 6, 6, '#e8d28a'], [10, -10, 5, 6, 7, '#b7d0a0'],
  [-14, -2, 5, 6, 6, '#d88a7a'], [-6, 6, 5, 6, 7, '#f0c78a'], [6, 6, 5, 6, 8, '#c8a0c0'], [14, -2, 5, 6, 7, '#9ac7c0'],
  [-14, 12, 5, 6, 6, '#e0a070'], [4, 14, 5, 6, 7, '#e8c8a0'], [14, 12, 5, 6, 6, '#b0b8d8'], [-24, 4, 5, 6, 7, '#d8b070'],
];
const keysAerial: CamKey[] = [{t: 0, p: [28, 120, 70], l: [0, 14, 0], f: 36}, {t: 2.5, p: [12, 24, 44], l: [0, 12, 0], f: 40}];
export const ShotAerial: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysAerial} t={t} light="golden" sky={['#f6b56a', '#ffd9a0', '#ffe8c8']}>
    <Solid geo="plane" args={[260, 260]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
    <Solid geo="plane" args={[16, 260]} p={[-18, 0.05, 0]} r={[-Math.PI / 2, 0, 0]} color="#5a8fb0" basic />
    {townHouses.map(([x, z, w, d, h, c], i) => <House key={i} x={x} z={z} w={w} d={d} h={h} wall={c} roof={i % 2 ? '#7a3a2e' : '#8a4a32'} lit={i % 3 === 0} />)}
    <ClockTower x={0} z={0} h={26} hour={9} minute={0} />
    <Street len={120} w={5} />
    {[[-9, 4], [9, 4], [-9, -4], [9, -4], [-4, 18], [4, 18]].map(([x, z], i) => <Tree key={i} x={x} z={z} s={1.1} tint={i % 2 ? '#d7833a' : '#c85a2a'} />)}
  </Base>
);

// 4. SIGN — вывеска на въезде, ненасвеченная (читается)
const keysSign: CamKey[] = [{t: 0, p: [0, 2.2, 24], l: [0, 3.2, 0], f: 36}, {t: 2, p: [0, 2.6, 16], l: [0, 3.4, 0], f: 36}];
export const ShotSign: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysSign} t={t} light="golden" sky={['#f6b56a', '#ffd9a0', '#ffe8c8']}>
    <Solid geo="plane" args={[120, 120]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
    <Street len={120} w={6} />
    <Solid geo="cyl" args={[0.14, 0.14, 4.2, 8]} p={[-2.6, 2.1, 0]} color="#4a3424" />
    <Solid geo="cyl" args={[0.14, 0.14, 4.2, 8]} p={[2.6, 2.1, 0]} color="#4a3424" />
    <Solid geo="box" args={[6.2, 2.2, 0.3]} p={[0, 3.6, 0]} color="#2a4a6a" map={signTex('entrance', ['TARDYVILLE', 'POP. 2,000'], '#2a4a6a', '#fff3d0', 1024, 512)} ink={false} basic />
    {[-12, 12].map((x, i) => <House key={i} x={x} z={-8} w={6} d={6} h={8} wall={i ? '#e8b68a' : '#cf8a6a'} />)}
    <Tree x={-7} z={2} s={1.2} /><Tree x={7} z={2} s={1.1} />
  </Base>
);

// 5. STRANGE_LAW — башня крупно, снизу вверх; часы показывают 3:14, а Уолтер смотрит на наручные
const keysLaw: CamKey[] = [{t: 0, p: [4, 3, 16], l: [0, 16, 0], f: 40}, {t: 2, p: [2, 3, 12], l: [0, 17, 0], f: 40}];
export const ShotLaw: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysLaw} t={t} light="golden" sky={['#7aa6d8', '#f0c8a0', '#f6e0b8']}
    over={(cam) => <Who cam={cam} x={-1} z={6} look="walter" pose="stand" face="shock" t={t} />}>
    <Solid geo="plane" args={[120, 120]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
    <Street len={120} w={8} />
    <ClockTower x={0} z={0} h={26} hour={3} minute={14} />
    {[-10, 10].map((x, i) => <House key={i} x={x} z={-6} w={6} d={6} h={10} wall={i ? '#e8c8a0' : '#d8a070'} />)}
  </Base>
);

// 6. FLASH_1887 — сепия, горожане смотрят на башню
const keysFlash: CamKey[] = [{t: 0, p: [0, 2.2, 22], l: [0, 13, 0], f: 40}, {t: 3, p: [0, 2.4, 16], l: [0, 12, 0], f: 40}];
export const ShotFlash1887: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysFlash} t={t} light="golden" sepia sky={['#f0c8a0', '#e8d0a8', '#d8c09a']}
    over={(cam) => (
      <g>
        <Who cam={cam} x={-3} z={8} look="gent1887" pose="stand" face="shock" t={t} />
        <Who cam={cam} x={0} z={8} look="man1887" pose="stand" face="shock" t={t} />
        <Who cam={cam} x={3} z={8} look="woman" pose="stand" face="stern" t={t} />
      </g>
    )}>
    <Solid geo="plane" args={[120, 120]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#9a8a6a" map={groundTex('#9a8a6a', '#6a5a42')} basic />
    <Street len={120} w={8} />
    <ClockTower x={0} z={0} h={26} hour={9} minute={0} />
    {[-10, 10].map((x, i) => <House key={i} x={x} z={-6} w={6} d={6} h={9} wall={i ? '#d8c4a0' : '#c8ae88'} />)}
  </Base>
);

// 7. NOBODY_FIXED — мэр пожимает плечами
const keysFixed: CamKey[] = [{t: 0, p: [1.2, 1.7, 5.2], l: [0, 1.6, 0], f: 36}, {t: 1.5, p: [0.8, 1.7, 4.6], l: [0, 1.6, 0], f: 38}];
export const ShotNobodyFixed: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysFixed} t={t} light="golden" sepia sky={['#f0c8a0', '#e8d0a8', '#d8c09a']}
    over={(cam) => <Who cam={cam} x={0} z={0} look="gent1887" pose="shrug" face="neutral" t={t} />}>
    <Solid geo="plane" args={[40, 40]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#9a8a6a" map={groundTex('#9a8a6a', '#6a5a42')} basic />
    <ClockTower x={-6} z={-10} h={26} hour={9} minute={0} />
    <House x={5} z={-6} w={8} d={6} h={10} wall="#c8ae88" />
  </Base>
);

// 8. LATE_LAW — собрание, поднятые руки, свиток с печатью
const keysLaw2: CamKey[] = [{t: 0, p: [0, 2.0, 7], l: [0, 1.6, 0], f: 40}, {t: 2.4, p: [0, 2.0, 5.6], l: [0, 1.6, 0], f: 42}];
export const ShotLateLaw: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysLaw2} t={t} light="golden" sepia sky={['#e8c8a0', '#e0c090', '#d0b080']}
    over={(cam) => (
      <g>
        <Who cam={cam} x={-2.2} z={0} look="man1887" pose="raise" face="proud" t={t} />
        <Who cam={cam} x={0} z={-0.5} look="gent1887" pose="raise" face="stern" t={t} />
        <Who cam={cam} x={2.2} z={0} look="woman" pose="raise" face="proud" t={t} />
        <Scroll x={540} y={980} w={560} h={280} lines={['THE LATE LAW']} rot={-4} size={58} />
      </g>
    )}>
    <Solid geo="box" args={[18, 6, 0.4]} p={[0, 3, -4]} color="#9a7a58" map={woodTex('#9a7a58')} />
    <Solid geo="plane" args={[40, 40]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#9a8a6a" map={groundTex('#9a8a6a', '#6a5a42')} basic />
  </Base>
);

// 9. RULE — улица, горожане идут медленно и смотрят на часы
const keysRule: CamKey[] = [{t: 0, p: [-6, 2.0, 12], l: [0, 1.8, 0], f: 38}, {t: 2.6, p: [-2, 2.0, 10], l: [0, 1.8, 0], f: 38}];
export const ShotRule: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysRule} t={t} light="day" over={(cam) => (<g>
    <Who cam={cam} x={-1.8} z={2} look="woman2" pose="walk" face="neutral" t={t} phase={t * 2} />
    <Who cam={cam} x={1.6} z={4} look="man1887" pose="walk" face="neutral" t={t} phase={t * 1.8} />
    <Who cam={cam} x={-0.4} z={0.5} look="gent1887" pose="stand" face="nervous" t={t} sweat />
  </g>)}>
    <Solid geo="plane" args={[80, 80]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
    <Street len={80} w={9} />
    {[-9, 9].map((x, i) => <House key={i} x={x} z={-2} w={6} d={6} h={9} wall={i ? '#e8c8a0' : '#d8a070'} />)}
    <Tree x={-8} z={6} s={1.1} /><Tree x={8} z={6} s={1.2} />
  </Base>
);

// 10. BAKERY — вывеска «Open at 7:00», пекарь у двери, дверь открывается в 7:15
const keysBakery: CamKey[] = [{t: 0, p: [0, 1.8, 7.2], l: [0, 2.2, 0], f: 40}, {t: 3.2, p: [0.6, 1.8, 6.4], l: [0, 2.2, 0], f: 40}];
export const ShotBakery: React.FC<ShotProps> = ({t}) => {
  const doorOpen = t > 1.8 ? Math.min(1, (t - 1.8) / 0.6) : 0;
  return (
    <Base keys={keysBakery} t={t} light="golden" sky={['#f6b56a', '#ffd9a0', '#ffe8c8']}
      over={(cam) => <Who cam={cam} x={1.6} z={3.2} look="baker" pose="stand" face="stern" t={t} />}>
      <Solid geo="plane" args={[40, 40]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
      <Solid geo="box" args={[7, 4.6, 5]} p={[0, 2.3, 0]} color="#e8b07a" map={wallTex('#e8b07a', '#7a4a2a', '#fff3dd')} />
      <Solid geo="box" args={[2, 3.4, 0.2]} p={[-1.2, 1.7, 2.6]} color="#7a3a2e" map={woodTex('#7a3a2e')} />
      <Solid geo="box" args={[2.2, 0.2, 0.3]} p={[-1.2, 3.4, 2.6]} color="#f6eedc" map={signTex('open7', ['Open at 7:00'], '#f6eedc', '#7a2a1a', 1024, 256)} ink={false} basic />
      <group position={[-0.25, 1.7, 2.7]} rotation={[0, -doorOpen * 1.2, 0]}>
        <Solid geo="box" args={[0.15, 3.2, 1.0]} p={[0, 0, 0.5]} color="#7a3a2e" map={woodTex('#7a3a2e')} ink={false} />
      </group>
      <Solid geo="box" args={[7.4, 0.8, 0.3]} p={[0, 4.8, 0]} color="#c8482a" map={signTex('bakery', ['BAKERY'], '#c8482a', '#fff3dd', 1024, 256)} ink={false} basic />
    </Base>
  );
};

// 11. SCHOOL — колокол, дети на ступенях с игрушечными часами
const keysSchool: CamKey[] = [{t: 0, p: [0, 1.8, 14], l: [0, 2.2, 0], f: 40}, {t: 3, p: [0, 1.8, 11], l: [0, 2.2, 0], f: 40}];
export const ShotSchool: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysSchool} t={t} light="day"
    over={(cam) => (
      <g>
        <Who cam={cam} x={-1.2} z={2.4} look="kid1" pose="sit" face="nervous" t={t} />
        <Who cam={cam} x={0} z={2.6} look="kid2" pose="sit" face="neutral" t={t} />
        <Who cam={cam} x={1.2} z={2.4} look="kid1" pose="sit" face="stern" t={t} />
        <Watch x={560} y={1480} r={22} hour={9} minute={0} />
      </g>
    )}>
    <Solid geo="plane" args={[60, 60]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
    <Solid geo="box" args={[12, 7, 5]} p={[0, 3.5, -2]} color="#e8d8b8" map={wallTex('#e8d8b8', '#7a6a50', '#fff6e4')} />
    <Solid geo="box" args={[12.6, 0.4, 5.4]} p={[0, 7.2, -2]} color="#7a3a2e" map={roofTex('#7a3a2e', '#2a1410')} />
    <Solid geo="cyl" args={[0.5, 0.6, 1.2, 14]} p={[0, 8.6, -2]} color="#b8962a" />
    <Solid geo="box" args={[3, 0.3, 2]} p={[0, 0.15, 1.6]} color="#c8b8a0" map={woodTex('#c8b8a0')} />
  </Base>
);

// 12. WEDDING — гости смотрят на часы, потом все заходят сразу
const keysWed: CamKey[] = [{t: 0, p: [0, 1.7, 9], l: [0, 1.8, 0], f: 40}, {t: 2, p: [0, 1.8, 8], l: [0, 1.8, 0], f: 40}];
export const ShotWedding: React.FC<ShotProps> = ({t}) => {
  const walk = t > 1.2 ? Math.min(1, (t - 1.2) / 0.8) : 0;
  return (
    <Base keys={keysWed} t={t} light="golden" sky={['#f6d8a0', '#ffe8c8', '#ffd9b0']}
      over={(cam) => (
        <g>
          <Who cam={cam} x={-1.6} z={0} look="groom" pose="stand" face="nervous" t={t} />
          <Who cam={cam} x={1.6} z={0} look="bride" pose="stand" face="smile" t={t} />
          <Who cam={cam} x={-2.6} z={3} look="woman2" pose="stand" face="neutral" t={t} />
          <Who cam={cam} x={2.6} z={3} look="gent1887" pose={walk > 0 ? 'walk' : 'stand'} face="neutral" t={t} phase={t * 5} />
          <Watch x={300} y={1400} r={18} hour={10} minute={0} />
        </g>
      )}>
      <Solid geo="plane" args={[40, 40]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
      <Solid geo="box" args={[0.2, 3, 0.2]} p={[-1.6, 1.5, -2]} color="#f6eedc" map={wallTex('#f6eedc', '#b8a890', '#ffffff')} />
      <Solid geo="box" args={[0.2, 3, 0.2]} p={[1.6, 1.5, -2]} color="#f6eedc" map={wallTex('#f6eedc', '#b8a890', '#ffffff')} />
      <Solid geo="box" args={[3.6, 0.2, 0.2]} p={[0, 3, -2]} color="#f6eedc" map={wallTex('#f6eedc', '#b8a890', '#ffffff')} />
      <Solid geo="box" args={[2.4, 0.1, 6]} p={[0, 0.05, 2]} color="#e8e0d0" map={woodTex('#e8e0d0')} />
    </Base>
  );
};

// 13. BUS — автобус у остановки, водитель читает газету, потом уезжает
const keysBus: CamKey[] = [{t: 0, p: [0, 1.9, 13], l: [0, 1.8, 0], f: 40}, {t: 2, p: [-1, 1.9, 12], l: [0, 1.8, 0], f: 40}];
export const ShotBus: React.FC<ShotProps> = ({t}) => {
  const leave = t > 1.4 ? Math.min(1, (t - 1.4) / 0.7) : 0;
  return (
    <Base keys={keysBus} t={t} light="day">
      <Solid geo="plane" args={[60, 60]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
      <Street len={60} w={9} />
      <group position={[-3.2 + leave * 14, 0, 0]}>
        <Solid geo="box" args={[2.6, 2.8, 8]} p={[0, 1.8, 0]} color="#e8b02a" map={wallTex('#e8b02a', '#8a6010', '#fff6c0')} />
        <Solid geo="box" args={[2.7, 0.9, 6]} p={[0, 2.4, 0]} color="#7aa8c8" ink={false} />
      </group>
      <Solid geo="box" args={[1.4, 0.2, 0.2]} p={[-4, 2.6, 2]} color="#c8482a" map={signTex('stop', ['BUS STOP'], '#c8482a', '#fff3dd', 512, 128)} ink={false} basic />
      <Lamp x={-3.6} z={1.5} />
    </Base>
  );
};

// 14. CAKE — день рождения: свечи догорают, гости с ножами
const keysCake: CamKey[] = [{t: 0, p: [0, 1.6, 5], l: [0, 1.2, 0], f: 40}, {t: 3, p: [0, 1.6, 4.4], l: [0, 1.2, 0], f: 40}];
export const ShotCake: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysCake} t={t} light="day" sky={['#ffd7b8', '#ffe8d8', '#fff0e0']}
    over={(cam) => (
      <g>
        <Who cam={cam} x={-1.4} z={1.4} look="woman" pose="hold" face="nervous" t={t} />
        <Who cam={cam} x={1.4} z={1.4} look="man1887" pose="hold" face="stern" t={t} />
        <Who cam={cam} x={0} z={-0.2} look="kid2" pose="stand" face="smile" t={t} />
        <Cake x={540} y={1200} burn={1 - Math.min(1, t / 3)} />
      </g>
    )}>
    <Solid geo="box" args={[7, 0.2, 4]} p={[0, 1.0, 0]} color="#f2e6d6" map={woodTex('#f2e6d6')} />
  </Base>
);

// 15. LUCKILY — перрон: пассажиры спокойны
const keysLuck: CamKey[] = [{t: 0, p: [4, 2.0, 14], l: [0, 2.0, 0], f: 40}, {t: 2, p: [2, 2.0, 12], l: [0, 2.0, 0], f: 40}];
export const ShotLuckily: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysLuck} t={t} light="day"
    over={(cam) => (
      <g>
        <Who cam={cam} x={-1} z={1} look="man1887" pose="stand" face="smile" t={t} />
        <Who cam={cam} x={1.2} z={2} look="woman2" pose="stand" face="proud" t={t} />
        <Who cam={cam} x={-2.4} z={3} look="prof" pose="stand" face="neutral" t={t} />
      </g>
    )}>
    <Solid geo="plane" args={[60, 60]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#9a9488" map={groundTex('#9a9488', '#5a5448')} basic />
    <Solid geo="box" args={[30, 0.4, 3]} p={[0, 0.2, 6]} color="#7a7468" map={woodTex('#7a7468')} />
    <Solid geo="box" args={[30, 3.4, 0.4]} p={[0, 2, -4]} color="#c8bca8" map={wallTex('#c8bca8', '#6a5e4a', '#fff6e4')} />
    <Lamp x={-3} z={4} on />
  </Base>
);

// 16. UNLUCKILY — поезд опаздывает, часы на вокзале показывают +15
const keysUnluck: CamKey[] = [{t: 0, p: [0, 1.9, 13], l: [0, 2.0, 0], f: 42}, {t: 2, p: [2, 1.9, 11], l: [0, 2.0, 0], f: 42}];
export const ShotUnluckily: React.FC<ShotProps> = ({t}) => {
  const trainX = 9 - Math.min(1, t / 1.8) * 12;
  return (
    <Base keys={keysUnluck} t={t} light="day"
      over={(cam) => <Who cam={cam} x={-1.4} z={2} look="man1887" pose="stand" face="shock" t={t} />}>
      <Solid geo="plane" args={[60, 60]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#9a9488" map={groundTex('#9a9488', '#5a5448')} basic />
      <group position={[trainX, 0, -3]}>
        <Solid geo="box" args={[16, 3.4, 3]} p={[0, 1.8, 0]} color="#2a5a8a" map={wallTex('#2a5a8a', '#14304a', '#c8e0f0')} />
        <Solid geo="box" args={[2.8, 0.4, 3.2]} p={[-6, 3.6, 0]} color="#f6eedc" map={signTex('stationclock', ['10:15'], '#f6eedc', '#2a1d14', 512, 256)} ink={false} basic />
      </group>
      <ClockTower x={6} z={-10} h={18} hour={10} minute={15} />
    </Base>
  );
};

// 17. MOVE_IN — грузовик, Уолтер с чемоданом, вставки опозданий
const keysMove: CamKey[] = [{t: 0, p: [0, 1.9, 14], l: [0, 2.0, 0], f: 40}, {t: 3.2, p: [-1, 1.9, 11], l: [0, 2.0, 0], f: 40}];
export const ShotMoveIn: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysMove} t={t} light="golden" sky={['#f6b56a', '#ffd9a0', '#ffe8c8']}
    over={(cam) => (
      <g>
        <Who cam={cam} x={-0.5} z={3.2} look="walter" pose={t < 2 ? 'walk' : 'stand'} face="smile" t={t} phase={t * 5} />
        <Suitcase x={300} y={1400} s={1.2} />
        <Scroll x={800} y={880} w={380} h={170} lines={['LATE TO SCHOOL']} size={34} rot={-5} />
      </g>
    )}>
    <Solid geo="plane" args={[60, 60]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
    <Street len={60} w={8} />
    <Solid geo="box" args={[3.2, 3.6, 7]} p={[4.5, 1.8, -2]} color="#d8d2c4" map={wallTex('#d8d2c4', '#6a6258', '#ffffff')} />
    <Car x={-3} z={-1} rot={Math.PI / 2} color="#c44a3a" />
  </Base>
);

// 18. HIS_DREAM_TOWN — Уолтер у окна смотрит на городок
const keysDream: CamKey[] = [{t: 0, p: [0, 2.2, 1.8], l: [0, 2.5, -8], f: 42}, {t: 2, p: [0.4, 2.2, 1.6], l: [0, 2.5, -8], f: 42}];
export const ShotDreamTown: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysDream} t={t} light="golden" sky={['#f6b56a', '#ffd9a0', '#ffe8c8']}
    over={(cam) => <Who cam={cam} x={0} z={0.8} look="walter" pose="stand" face="proud" t={t} />}>
    {townHouses.slice(0, 6).map(([x, z, w, d, h, c], i) => <House key={i} x={x * 0.35} z={z * 0.5 - 12} w={w} d={d} h={h} wall={c} lit={i % 2 === 0} />)}
    <ClockTower x={0} z={-22} h={26} hour={9} minute={20} />
  </Base>
);

// 19. NIGHT_MORNING — ночью будильники и пот; утром бежит мимо прохожих
const keysNight: CamKey[] = [{t: 0, p: [0, 1.8, 4], l: [0, 1.8, 0], f: 40}, {t: 1.4, p: [0, 1.8, 3.6], l: [0, 1.8, 0], f: 40}];
const keysRun: CamKey[] = [{t: 0, p: [-3, 1.8, 10], l: [0, 1.8, 0], f: 40}, {t: 1.6, p: [-1, 1.8, 8], l: [0, 1.8, 0], f: 40}];
export const ShotNight: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysNight} t={t} light="night" sky={['#1d2238', '#2a3050', '#3a3a5a']}
    over={(cam) => (
      <g>
        <Who cam={cam} x={0} z={0} look="walter" pose="sit" face="nervous" t={t} sweat />
        <Watch x={260} y={1200} r={26} hour={6} minute={30} />
        <Watch x={820} y={1260} r={26} hour={6} minute={40} />
      </g>
    )}>
    <Solid geo="box" args={[6, 0.2, 3]} p={[0, 1.2, 0]} color="#7a5230" map={woodTex('#7a5230')} />
    <Solid geo="box" args={[2.4, 0.1, 1.2]} p={[0, 1.4, 0]} color="#3b5a7a" ink={false} />
  </Base>
);
export const ShotRunMorning: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysRun} t={t} light="golden" sky={['#f6b56a', '#ffd9a0', '#ffe8c8']}
    over={(cam) => (
      <g>
        <Who cam={cam} x={0} z={0} look="walter" pose="walk" face="sneeze" t={t} phase={t * 9} />
        <Who cam={cam} x={-2} z={2} look="prof" pose="walk" face="neutral" t={t} phase={t * 3} />
        <Who cam={cam} x={2.4} z={4} look="gent1887" pose="walk" face="neutral" t={t} phase={t * 2.5} />
      </g>
    )}>
    <Solid geo="plane" args={[80, 80]} p={[0, 0, 0]} r={[-Math.PI / 2, 0, 0]} color="#8ea86a" map={groundTex('#8ea86a', '#56703e')} basic />
    <Street len={80} w={9} />
    {[-9, 9].map((x, i) => <House key={i} x={x} z={-2} w={6} d={6} h={9} wall={i ? '#e8c8a0' : '#d8a070'} />)}
  </Base>
);

// 20. OFFICE_SHARP — кабинет, часы на 9:00, коллеги поворачивают головы синхронно
const keysSharp: CamKey[] = [{t: 0, p: [0, 1.7, 5.6], l: [0, 1.9, -2], f: 40}, {t: 2.4, p: [0, 1.7, 4.8], l: [0, 1.9, -2], f: 40}];
export const ShotSharp: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysSharp} t={t} light="day"
    over={(cam) => (
      <g>
        <Who cam={cam} x={-2.2} z={0.6} look="student" pose="stand" face={t > 1 ? 'shock' : 'neutral'} t={t} />
        <Who cam={cam} x={2.2} z={0.6} look="prof" pose="stand" face={t > 1 ? 'shock' : 'neutral'} t={t} />
        <Who cam={cam} x={0} z={-0.4} look="walter" pose="stand" face="nervous" t={t} sweat />
      </g>
    )}>
    <Office />
    <WallClock x={0} y={3.0} z={-3.9} hour={9} minute={0} r={1.3} />
    <Solid geo="box" args={[0.8, 0.12, 2]} p={[-1, 0.9, -1]} color="#7a5230" map={woodTex('#7a5230')} />
  </Base>
);

// 21. FROZE_COPS — кофе падает, пауза, сирены, полиция входит
const keysFroze: CamKey[] = [{t: 0, p: [0, 1.7, 5], l: [0, 1.6, 0], f: 40}, {t: 3, p: [0, 1.7, 4.2], l: [0, 1.6, 0], f: 40}];
export const ShotFroze: React.FC<ShotProps> = ({t}) => {
  const fall = Math.min(1, Math.max(0, (t - 0.6) / 1.0));
  return (
    <Base keys={keysFroze} t={t} light="night" sky={['#1d2238', '#2a3050', '#3a3a5a']}
      over={(cam) => (
        <g>
          <Who cam={cam} x={-2} z={0} look="prof" pose="stand" face="shock" t={t} />
          <Who cam={cam} x={2} z={0} look="student" pose="stand" face="shock" t={t} />
          <Cup x={540} y={1240 + fall * 360} s={1.2} />
          {fall > 0.9 && <Bubble x={720} y={1180} text="Sirens" s={1} />}
        </g>
      )}>
      <Office />
      <pointLight position={[-2, 2.4, 1.5]} color="#ff3030" intensity={1.6 + Math.sin(t * 12) * 0.6} distance={9} />
      <pointLight position={[2, 2.4, 1.5]} color="#3060ff" intensity={1.6 + Math.cos(t * 12) * 0.6} distance={9} />
    </Base>
  );
};

// 22. COURT_TEN — зал суда, судья в парике, пустой стул, часы на 10:00
const keysCourt: CamKey[] = [{t: 0, p: [0, 1.9, 9], l: [0, 2.0, -4], f: 40}, {t: 2.4, p: [0, 1.9, 8], l: [0, 2.0, -4], f: 40}];
export const ShotCourt: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysCourt} t={t} light="day"
    over={(cam) => (
      <g>
        <Who cam={cam} x={0} z={-5} look="judge" pose="stand" face="stern" t={t} />
        <Who cam={cam} x={-3} z={1} look="prof" pose="stand" face="shock" t={t} />
        <Who cam={cam} x={3} z={1} look="gent1887" pose="stand" face="neutral" t={t} />
        <Bubble x={540} y={1000} text="..." s={0.9} />
      </g>
    )}>
    <Solid geo="box" args={[18, 6, 0.4]} p={[0, 3, -8]} color="#6a4a2e" map={woodTex('#6a4a2e')} />
    <Solid geo="box" args={[7, 1.4, 1.2]} p={[0, 0.7, -4.6]} color="#5a3a24" map={woodTex('#5a3a24')} />
    <Solid geo="box" args={[9, 0.4, 3]} p={[0, 0.2, 1]} color="#3a2a1e" map={woodTex('#3a2a1e')} />
    <WallClock x={5} y={4.6} z={-7.7} hour={10} minute={0} r={1.0} />
    <Solid geo="box" args={[1.2, 0.8, 0.8]} p={[-3, 0.4, 2.3]} color="#4a3220" map={woodTex('#4a3220')} />
    <Solid geo="box" args={[1.4, 1.2, 1.4]} p={[3.4, 0.6, 1.1]} color="#5a3a24" map={woodTex('#5a3a24')} />
  </Base>
);

// 23. WALTER_ENTERS — Уолтер входит спокойно, зал ахает, потом аплодирует
const keysEnter: CamKey[] = [{t: 0, p: [0, 1.8, 7], l: [0, 1.9, -2], f: 40}, {t: 2.4, p: [0, 1.8, 6], l: [0, 1.9, -2], f: 40}];
export const ShotEnters: React.FC<ShotProps> = ({t}) => {
  const wx = 2.6 - Math.min(1, t / 2.0) * 3.1;
  return (
    <Base keys={keysEnter} t={t} light="day"
      over={(cam) => (
        <g>
          <Who cam={cam} x={0} z={-5} look="judge" pose="stand" face="neutral" t={t} />
          <Who cam={cam} x={-2.4} z={1} look="gent1887" pose="clap" face={t > 1.2 ? 'smile' : 'shock'} t={t} />
          <Who cam={cam} x={2.4} z={1} look="woman2" pose="clap" face={t > 1.2 ? 'proud' : 'shock'} t={t} />
          <Who cam={cam} x={wx} z={2.6} look="walter" pose={t < 2 ? 'walk' : 'stand'} face="proud" t={t} phase={t * 5} />
          {t < 1.1 && <Bubble x={820} y={1080} text="Oh!" s={0.9} />}
        </g>
      )}>
      <Solid geo="box" args={[18, 6, 0.4]} p={[0, 3, -8]} color="#6a4a2e" map={woodTex('#6a4a2e')} />
      <Solid geo="box" args={[7, 1.4, 1.2]} p={[0, 0.7, -4.6]} color="#5a3a24" map={woodTex('#5a3a24')} />
      <Solid geo="box" args={[9, 0.4, 3]} p={[0, 0.2, 1]} color="#3a2a1e" map={woodTex('#3a2a1e')} />
      <Solid geo="box" args={[4, 0.3, 5]} p={[0, 0.15, 4.4]} color="#7a5230" map={woodTex('#7a5230')} />
    </Base>
  );
};

// 24. NOT_GUILTY — судья улыбается, молоток, конфетти из ложи присяжных
const keysGuilty: CamKey[] = [{t: 0, p: [0, 1.9, 7], l: [0, 2.0, -4], f: 40}, {t: 2.2, p: [0, 1.9, 6.2], l: [0, 2.0, -4], f: 40}];
export const ShotGuilty: React.FC<ShotProps> = ({t}) => {
  const hit = t > 0.9 && t < 1.2;
  return (
    <Base keys={keysGuilty} t={t} light="day"
      over={(cam) => (
        <g>
          <Who cam={cam} x={0} z={-5} look="judge" pose="gavel" face={t > 0.4 ? 'smile' : 'stern'} t={t} />
          <Who cam={cam} x={-2.4} z={-1} look="prof" pose="clap" face="smile" t={t} />
          <Who cam={cam} x={2.4} z={-1} look="student" pose="clap" face="proud" t={t} />
          <Who cam={cam} x={0} z={2.4} look="walter" pose="stand" face="proud" t={t} />
          <Gavel x={560} y={1020} rot={hit ? 30 : -20} />
          <Scroll x={540} y={460} w={560} h={150} lines={['NOT GUILTY']} size={56} rot={0} />
          <Confetti t={Math.max(0, t - 0.9)} n={90} />
        </g>
      )}>
      <Solid geo="box" args={[18, 6, 0.4]} p={[0, 3, -8]} color="#6a4a2e" map={woodTex('#6a4a2e')} />
      <Solid geo="box" args={[7, 1.4, 1.2]} p={[0, 0.7, -4.6]} color="#5a3a24" map={woodTex('#5a3a24')} />
    </Base>
  );
};

// 25. GERMANY — аудитория с амфитеатром, доска «c.t.» и профессор в 10:15
const keysGerm: CamKey[] = [{t: 0, p: [0, 2.2, 9], l: [0, 2.0, -6], f: 42}, {t: 4.4, p: [0, 2.6, 7], l: [0, 2.0, -6], f: 42}];
export const ShotGermany: React.FC<ShotProps> = ({t}) => {
  const profX = t > 2.4 ? 0.8 - Math.min(1, (t - 2.4) / 1.6) * 0.8 : -6;
  return (
    <Base keys={keysGerm} t={t} light="day" sky={['#bfe0ff', '#e6f2ff', '#f6e6c8']}
      over={(cam) => (
        <g>
          <Who cam={cam} x={-2.4} z={1.2} look="student" pose="sit" face="neutral" t={t} />
          <Who cam={cam} x={-0.6} z={2.2} look="kid1" pose="sit" face="smile" t={t} />
          <Who cam={cam} x={1.6} z={1.4} look="student" pose="sit" face="stern" t={t} />
          <Who cam={cam} x={profX} z={-2.6} look="prof" pose={t > 2.4 ? 'walk' : 'stand'} face="neutral" t={t} phase={t * 5} />
        </g>
      )}>
      <Solid geo="box" args={[14, 0.6, 9]} p={[0, 0.3, 1]} color="#8a6a48" map={woodTex('#8a6a48')} />
      <Solid geo="box" args={[9, 0.2, 2.4]} p={[0, 0.9, 1.8]} color="#6a4a2e" map={woodTex('#6a4a2e')} />
      <Solid geo="plane" args={[9, 3.4]} p={[0, 2.2, -6.4]} color="#2f4a3a" map={signTex('chalk', ['10 c.t.'], '#2f4a3a', '#f6f2e6', 1024, 512)} ink={false} basic />
    </Base>
  );
};

// 26. CALLBACK — Уолтер сидит в аудитории, пьёт кофе, подмигивает
const keysCallback: CamKey[] = [{t: 0, p: [0, 1.8, 3.4], l: [0, 1.8, -2], f: 40}, {t: 2, p: [0, 1.8, 2.8], l: [0, 1.8, -2], f: 40}];
export const ShotCallback: React.FC<ShotProps> = ({t}) => (
  <Base keys={keysCallback} t={t} light="day" sky={['#bfe0ff', '#e6f2ff', '#f6e6c8']}
    over={(cam) => (
      <g>
        <Who cam={cam} x={0} z={0.4} look="walter" pose="sip" face={t > 1.2 ? 'wink' : 'proud'} t={t} />
        <Cup x={780} y={1360} s={0.9} />
      </g>
    )}>
    <Solid geo="box" args={[14, 0.6, 9]} p={[0, 0.3, 1]} color="#8a6a48" map={woodTex('#8a6a48')} />
    <Solid geo="box" args={[9, 0.2, 2.4]} p={[0, 0.9, 1.8]} color="#6a4a2e" map={woodTex('#6a4a2e')} />
    <Solid geo="plane" args={[9, 3.4]} p={[0, 2.2, -6.4]} color="#2f4a3a" map={signTex('chalk2', ['10 c.t.'], '#2f4a3a', '#f6f2e6', 1024, 512)} ink={false} basic />
  </Base>
);

// Ночь (будильники, пот) и утро (бег мимо прохожих) — один шот, переход на второй кадр через 1.9 с
export const ShotNightMorning: React.FC<ShotProps> = ({t}) => (t < 1.9 ? <ShotNight t={t} /> : <ShotRunMorning t={t - 1.9} />);

// Порядок и соответствие шотов тексту: id — как в timeline.py
export const SHOT_COMPONENTS: Record<string, React.FC<ShotProps>> = {
  OFFICE_HOOK: ShotOfficeHook, ARREST: ShotArrest, AERIAL: ShotAerial, SIGN: ShotSign, STRANGE_LAW: ShotLaw,
  FLASH_1887: ShotFlash1887, NOBODY_FIXED: ShotNobodyFixed, LATE_LAW: ShotLateLaw, RULE: ShotRule, BAKERY: ShotBakery,
  SCHOOL: ShotSchool, WEDDING: ShotWedding, BUS: ShotBus, CAKE: ShotCake, LUCKILY: ShotLuckily, UNLUCKILY: ShotUnluckily,
  MOVE_IN: ShotMoveIn, DREAM_TOWN: ShotDreamTown, NIGHT_MORNING: ShotNightMorning, OFFICE_SHARP: ShotSharp,
  FROZE_COPS: ShotFroze, COURT_TEN: ShotCourt, WALTER_ENTERS: ShotEnters, NOT_GUILTY: ShotGuilty, GERMANY: ShotGermany,
  CALLBACK: ShotCallback,
};
