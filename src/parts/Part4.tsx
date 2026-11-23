import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {PALETTE, PART_FRAMES, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {CameraRig, Layer} from '../scene/Camera';
import {Fog, GroundBand, Stage} from '../scene/Environment';
import {Corridor, Frieze, WallEyes} from '../characters/Temple';
import {Mason} from '../characters/Mason';
import {Beam} from '../characters/Props';
import {Gps} from '../characters/Gps';
import {JeepSide, OldCar, OldCart} from '../characters/Vehicles';
import {Black} from './shared';
import {Captions} from '../ui/Captions';
import {PartEnd, PartTitle} from '../ui/Cards';
import {MusicBed, Sfx, SfxEvent, VoiceOver} from '../ui/AudioMix';
import {CAPTIONS, MUSIC_DIPS} from '../script/parts';

const P = PALETTE.deep4;

/** Speed lines racing out from the vanishing point while Mason runs. */
const SpeedLines: React.FC<{speed?: number}> = ({speed = 40}) => {
  const f = useCurrentFrame();
  const targets: Array<[number, number]> = [
    [0, 0], [1080, 0], [0, 1920], [1080, 1920], [0, 960], [1080, 960], [540, 0], [540, 1920], [200, 0], [880, 0], [200, 1920], [880, 1920],
  ];
  return (
    <g stroke="#b9ffd6" strokeOpacity={0.35} strokeWidth={4} fill="none">
      {targets.map(([x, y], i) => (
        <line
          key={i}
          x1={540}
          y1={960}
          x2={x}
          y2={y}
          strokeDasharray="90 260"
          strokeDashoffset={-f * speed * (1 + (i % 3) * 0.3)}
        />
      ))}
    </g>
  );
};

/** 1. Mason runs down the corridor with the old GPS in his hand. */
const Run: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.06, x: 0, y: 0},
          {f: 150, z: 1.14, x: 0, y: -20},
        ]}
        shakes={[
          {at: 0, dur: 30, amp: 6},
          {at: 70, dur: 20, amp: 5},
        ]}
      >
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[0.3, 0.6, 0.85]} />
        <SpeedLines />
        <Mason x={540} y={1580} s={1.0} moving="run" phase={f * 0.5} expr="determined" blinkSeed={3} />
        <Gps x={690} y={1330} s={0.32} rot={14} arrow="straight" signal={4} text="" />
        <Beam x0={560} y0={1300} x1={540} y1={700} w0={20} w1={160} opacity={0.2} />
      </CameraRig>
    </Stage>
  );
};

/** 2. The carvings on the walls come alive, riders and explorers following a glowing arrow. */
const Alive: React.FC = () => {
  const f = useCurrentFrame();
  const a = ramp(f, 20, 90, 0, 1);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.1},
          {f: 180, z: 1.15},
        ]}
      >
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[]} />
        <Frieze alive={a} y={1040} />
        <Mason x={540} y={1640} s={0.92} moving="walk" phase={f * 0.25} expr="awe" />
        <Fog y={1500} depth={1} opacity={0.3} seed={17} />
      </CameraRig>
    </Stage>
  );
};

/** 3. A huge hall of rusted vehicles, all empty. Slow pan across them. */
const Hall: React.FC = () => (
  <Stage p={P}>
    <CameraRig
      keys={[
        {f: 0, z: 1, x: 120},
        {f: 180, z: 1.05, x: -160},
      ]}
    >
      <rect x={-400} y={-200} width={1880} height={2300} fill="#0c1a12" />
      <Layer depth={0.5}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-50 + i * 260} y={200} width={70} height={1300} fill="#1e2f25" />
        ))}
        <path d="M -400 300 Q 540 -100 1480 300" stroke="#1e2f25" strokeWidth={60} fill="none" />
      </Layer>
      <Layer depth={1}>
        <GroundBand y={1480} color="#2a2719" stoneColor="#3d3a2a" depth={1} seed={91} />
        <OldCart x={120} y={1480} s={1.1} />
        <OldCar x={420} y={1480} s={1.1} flip />
        <JeepSide x={760} y={1480} s={1.1} rusted={1} />
        <OldCar x={1060} y={1480} s={1.1} />
        <OldCart x={1400} y={1480} s={1.0} />
        <OldCar x={1720} y={1480} s={1.1} flip />
      </Layer>
    </CameraRig>
  </Stage>
);

const WALL_XS_TOP = [120, 330, 540, 750, 960];
const WALL_XS_LOW = [40, 240, 440, 640, 840, 1040];

/** 4. Carved eyes along the walls open one by one, in three waves, each with a low boom. */
const EyesWake: React.FC = () => {
  const f = useCurrentFrame();
  const top = WALL_XS_TOP.map((_, i) => {
    const wave = Math.floor(i / 2);
    return ramp(f, 20 + wave * 40 + (i % 2) * 6, 34 + wave * 40 + (i % 2) * 6, 0, 1);
  });
  const low = WALL_XS_LOW.map((_, i) => {
    const wave = Math.floor(i / 2);
    return ramp(f, 26 + wave * 40 + (i % 2) * 6, 40 + wave * 40 + (i % 2) * 6, 0, 1);
  });
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1},
          {f: 180, z: 1.1},
        ]}
      >
        <rect x={-400} y={-200} width={1880} height={2300} fill="#0c1a12" />
        <Layer depth={0.6}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={-50 + i * 260} y={200} width={70} height={1300} fill="#1e2f25" />
          ))}
        </Layer>
        <WallEyes opens={top} xs={WALL_XS_TOP} y={560} w={110} />
        <WallEyes opens={low} xs={WALL_XS_LOW} y={960} w={90} />
        <GroundBand y={1480} color="#2a2719" stoneColor="#3d3a2a" depth={1} seed={91} />
        <Fog y={1300} depth={1} opacity={0.25} seed={23} />
      </CameraRig>
    </Stage>
  );
};

/** 5. The GPS: RECALCULATING... */
const Recalc: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1},
          {f: 120, z: 1.05},
        ]}
      >
        <Corridor opens={[0.6, 0.6, 0.6]} farOpen={0.8} depthFaces={[]} />
        <Gps
          x={540}
          y={980}
          s={1.42}
          text="RECALCULATING…"
          arrow="none"
          busy
          signal={2}
          green={0.8}
          glitch={ramp(f, 0, 20, 0.2, 0.5)}
        />
      </CameraRig>
    </Stage>
  );
};

/** The fork: two black tunnels either side of a stone pillar. */
const ForkHall: React.FC<{look?: number}> = ({look = 0}) => (
  <g>
    <rect x={-200} y={-200} width={1480} height={2320} fill="#0b1711" />
    <rect x={450} y={520} width={180} height={1000} fill="#1b2a22" />
    <path d="M 90 1500 L 90 760 Q 260 560 430 760 L 430 1500 Z" fill="#050a07" />
    <path d="M 650 1500 L 650 760 Q 820 560 990 760 L 990 1500 Z" fill="#050a07" />
    <line x1={100} y1={1040} x2={420} y2={1040} stroke="#2a3d33" strokeWidth={4} />
    <line x1={660} y1={1040} x2={980} y2={1040} stroke="#2a3d33" strokeWidth={4} />
    <Mason x={540} y={1640} s={0.95} expr="determined" look={look} blinkSeed={8} />
  </g>
);

/** 6. The fork in the corridor. Mason looks at both tunnels. */
const Fork: React.FC = () => {
  const f = useCurrentFrame();
  const look = f < 60 ? ramp(f, 0, 60, 0, -1) : f < 120 ? ramp(f, 60, 120, -1, 1) : ramp(f, 120, 180, 1, 0);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.0, y: 0},
          {f: 180, z: 1.28, y: 60},
        ]}
      >
        <ForkHall look={look} />
        <Fog y={1500} depth={1} opacity={0.3} seed={31} />
      </CameraRig>
    </Stage>
  );
};

/** 7. The GPS, in a deeper voice: "Turn left, Mason. You always do." Cut. */
const DeepVoice: React.FC = () => {
  const f = useCurrentFrame();
  const look = f < 90 ? ramp(f, 0, 90, 0, -1) : ramp(f, 90, 170, -1, 0.2);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.2, y: 60},
          {f: 195, z: 1.25, y: 60},
        ]}
      >
        <ForkHall look={look} />
        <Gps x={740} y={1260} s={0.58} rot={12} text="TURN LEFT" arrow="left" signal={4} green={0.9} glitch={0.12} />
        <Black opacity={ramp(f, 176, 195, 0, 1)} />
      </CameraRig>
    </Stage>
  );
};

const SFX: SfxEvent[] = [
  {at: 0.2, name: 'step', v: 0.6},
  {at: 0.8, name: 'step', v: 0.6},
  {at: 1.4, name: 'step', v: 0.6},
  {at: 2.0, name: 'step', v: 0.6},
  {at: 2.6, name: 'step', v: 0.6},
  {at: 3.2, name: 'step', v: 0.6},
  {at: 3.8, name: 'step', v: 0.6},
  {at: 4.4, name: 'step', v: 0.6},
  {at: 6.2, name: 'rumble', v: 0.4},
  {at: 9.0, name: 'drip', v: 0.35},
  {at: 11.4, name: 'rumble', v: 0.35},
  {at: 17.67, name: 'boom', v: 1},
  {at: 19.0, name: 'boom', v: 0.95},
  {at: 20.33, name: 'boom', v: 1},
  {at: 23.5, name: 'chime', v: 0.6},
  {at: 24.0, name: 'glitch', v: 0.5},
  {at: 27.4, name: 'whoosh', v: 0.3},
  {at: 33.4, name: 'chime', v: 0.6},
  {at: 36.0, name: 'glitch', v: 0.3},
];

export const Part4: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(5)}>
      <Run />
    </Sequence>
    <Sequence from={sec(5)} durationInFrames={sec(6)}>
      <Alive />
    </Sequence>
    <Sequence from={sec(11)} durationInFrames={sec(6)}>
      <Hall />
    </Sequence>
    <Sequence from={sec(17)} durationInFrames={sec(6)}>
      <EyesWake />
    </Sequence>
    <Sequence from={sec(23)} durationInFrames={sec(4)}>
      <Recalc />
    </Sequence>
    <Sequence from={sec(27)} durationInFrames={sec(6)}>
      <Fork />
    </Sequence>
    <Sequence from={sec(33)} durationInFrames={sec(7)}>
      <DeepVoice />
    </Sequence>
    <Captions lines={CAPTIONS[4]} />
    <MusicBed dips={MUSIC_DIPS[4]} />
    <VoiceOver n={4} />
    <Sfx events={SFX} />
    <PartTitle n={4} title="Recalculating" />
    <PartEnd label="PART 5 →" total={PART_FRAMES} />
  </AbsoluteFill>
);
