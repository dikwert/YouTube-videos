import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {PALETTE, PART_FRAMES, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {CameraRig, Layer} from '../scene/Camera';
import {Stage} from '../scene/Environment';
import {Canopy, Clouds, Dust, Fog, LightRays, Leaves, Trunks} from '../scene/Environment';
import {Cockpit, GpsCloseup, TrackGround} from './shared';
import {JeepSide, JeepTop} from '../characters/Vehicles';
import {TempleFacade} from '../characters/Temple';
import {Flash} from '../characters/Props';
import {Captions} from '../ui/Captions';
import {PartEnd, PartTitle} from '../ui/Cards';
import {MusicBed, Sfx, SfxEvent, VoiceOver} from '../ui/AudioMix';
import {CAPTIONS, MUSIC_DIPS} from '../script/parts';

const P = PALETTE.bright;

/** Winding dirt road seen from above (used by the aerial shot). */
const roadX = (y: number) => 540 + 170 * Math.sin(y / 330) + 60 * Math.sin(y / 140);
const roadD = (() => {
  const parts: string[] = [];
  for (let y = -200; y <= 2120; y += 30) parts.push(`${parts.length ? 'L' : 'M'} ${roadX(y).toFixed(1)} ${y}`);
  return parts.join(' ');
})();

const Black: React.FC<{opacity: number}> = ({opacity}) => (
  <rect x={-500} y={-500} width={2080} height={2920} fill="#000" opacity={opacity} />
);

/** 1. Aerial over the jungle; the jeep crawls up the winding road. */
const Aerial: React.FC = () => {
  const f = useCurrentFrame();
  const y = 1700 - f * 9;
  const slope = roadX(y - 2) - roadX(y + 2);
  const rot = (Math.atan2(slope, 4) * 180) / Math.PI;
  return (
    <Stage p={P}>
      <CameraRig keys={[{f: 0, z: 0.78, y: 120}, {f: 105, z: 0.95, y: -40}]}>
        <Layer depth={1}>
          <rect x={-300} y={-300} width={1700} height={2600} fill={P.mid} />
          <path d={roadD} stroke={P.road} strokeWidth={130} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={roadD} stroke="#f6e7b5" strokeOpacity={0.45} strokeWidth={6} strokeDasharray="30 40" fill="none" />
          <Canopy seed={11} color={P.far} depth={1} y={260} count={26} rMin={130} rMax={220} band={1800} sway={5} />
          <Canopy seed={12} color={P.near} depth={1} y={1600} count={22} rMin={120} rMax={200} band={600} sway={5} />
        </Layer>
        <JeepTop x={roadX(y)} y={y} rot={rot} s={0.9} />
        <Layer depth={1.3}>
          <Leaves seed={13} colors={[P.far, P.mid]} depth={1} count={14} zone={[-60, -60, 1140, 360]} size={[120, 190]} sway={8} />
        </Layer>
        <LightRays depth={1} opacity={0.1} />
        <Dust count={50} />
      </CameraRig>
    </Stage>
  );
};

/** 2. Mason in the cockpit, grinning into his chest camera. */
const Grin: React.FC = () => (
  <Cockpit
    p={P}
    keys={[
      {f: 0, z: 1, y: 0},
      {f: 120, z: 1.05, y: -20},
    ]}
    mason={{expr: 'grin', look: 0, blinkSeed: 20, rec: true}}
    gps={{text: 'FOLLOW ROUTE', arrow: 'straight', signal: 4}}
  />
);

/** 3. GPS close-up: TURN LEFT. */
const TurnLeftCloseup: React.FC = () => (
  <GpsCloseup
    p={P}
    keys={[
      {f: 0, z: 0.93},
      {f: 90, z: 1.04},
    ]}
    gps={{text: 'TURN LEFT', arrow: 'left', signal: 4}}
  />
);

/** 4. The jeep turns onto a narrow path; trees close in. */
const NarrowTrack: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, x: 0, y: 0, z: 1, r: 0},
          {f: 90, x: -120, y: -20, z: 1.12, r: -4},
        ]}
      >
        <Clouds depth={0.15} y={260} opacity={0.4} />
        <Canopy seed={61} color={P.far} depth={0.4} y={420} count={20} rMin={120} rMax={200} band={200} />
        <Trunks seed={62} color={P.mid} depth={0.6} top={0} bottom={1480} count={11} wMin={40} wMax={90} />
        <Trunks seed={63} color={P.near} depth={1.15} top={0} bottom={1640} count={5} wMin={90} wMax={170} />
        <TrackGround p={P} y={1480} />
        <JeepSide x={540} y={1480} s={1.5} roll={f * 5} headlight />
      </CameraRig>
    </Stage>
  );
};

/** 5. Branches scrape the jeep; signal bars drop to zero. */
const ScrapeCab: React.FC = () => {
  const f = useCurrentFrame();
  const sig = f < 18 ? 4 : f < 30 ? 2 : f < 42 ? 1 : 0;
  return (
    <Cockpit
      p={P}
      keys={[
        {f: 0, z: 1},
        {f: 90, z: 1.03},
      ]}
      shakes={[
        {at: 20, dur: 16, amp: 14},
        {at: 44, dur: 12, amp: 7},
      ]}
      mason={{expr: f > 20 ? 'scared' : 'neutral', look: 0.3}}
      gps={{text: 'NO SIGNAL', arrow: 'none', signal: sig}}
      branches={18}
      rattle={f > 18 && f < 50 ? 3 : 0}
    />
  );
};

/** 6. TURN LEFT again; the map curls into a spiral. Mason frowns. */
const SpiralCab: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cockpit
      p={P}
      keys={[
        {f: 0, z: 1, x: 0, y: 0},
        {f: 90, z: 1.2, x: 0, y: 110},
      ]}
      mason={{expr: 'frown', look: -0.3}}
      gps={{
        text: 'TURN LEFT',
        arrow: 'left',
        signal: 4,
        green: ramp(f, 10, 60, 0, 0.6),
        spiral: ramp(f, 15, 80, 0, 1),
      }}
    />
  );
};

/** 7. The engine sputters and dies; birds lift off; silence. */
const EngineDies: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cockpit
      p={P}
      keys={[
        {f: 0, z: 1},
        {f: 90, z: 1.02},
      ]}
      mason={{expr: 'shock', look: 0}}
      gps={{text: '', arrow: 'none', signal: 0, power: ramp(f, 0, 45, 1, 0.2)}}
      birds={6}
      rattle={f < 30 ? 4 : 0}
    />
  );
};

/** 8. Slow reveal of the overgrown temple in fog and light rays. */
const TempleReveal: React.FC = () => (
  <Stage p={P}>
    <CameraRig
      keys={[
        {f: 0, z: 0.5, x: 0, y: 260},
        {f: 165, z: 1, x: 0, y: -40},
      ]}
    >
      <Clouds depth={0.15} y={280} opacity={0.35} />
      <Canopy seed={71} color={P.far} depth={0.5} y={420} count={20} rMin={120} rMax={200} band={200} />
      <TempleFacade awake={0} cx={540} cy={760} s={1} />
      <Fog y={1250} depth={1} opacity={0.35} seed={5} />
      <LightRays depth={1} opacity={0.14} />
      <Layer depth={1.3}>
        <Leaves seed={73} colors={[P.mid, P.near]} depth={1} zone={[-100, 1500, 1180, 1920]} count={14} size={[120, 200]} sway={14} />
      </Layer>
      <Dust count={60} />
    </CameraRig>
  </Stage>
);

/** 9. Mason reaches to switch the GPS off; the screen glitches green. */
const ReachCab: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cockpit
      p={P}
      keys={[
        {f: 0, z: 1},
        {f: 120, z: 1.08, y: 40},
      ]}
      mason={{expr: 'determined', armR: ramp(f, 0, 110, 8, -68), look: 0.4}}
      gps={{
        text: 'TURN LEFT',
        arrow: 'left',
        signal: 4,
        green: ramp(f, 40, 110, 0, 1),
        glitch: ramp(f, 60, 110, 0, 0.9),
      }}
    />
  );
};

/** 10. The temple's face opens its eyes (green glow), then the screen cuts to black. */
const TempleWake: React.FC = () => {
  const f = useCurrentFrame();
  const awake = ramp(f, 60, 84, 0, 1);
  const fade = ramp(f, 192, 204, 0, 1);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1, y: -40},
          {f: 240, z: 1.08, y: -80},
        ]}
        shakes={[{at: 58, dur: 26, amp: 10}]}
      >
        <Canopy seed={81} color={P.far} depth={0.5} y={420} count={18} rMin={120} rMax={200} band={200} />
        <TempleFacade awake={awake} cx={540} cy={760} s={1} />
        <Flash x={540} y={760} start={60} dur={14} color="#b6ffd0" r={900} />
        <Fog y={1250} depth={1} opacity={0.3} seed={6} />
        <Layer depth={1.3}>
          <Leaves seed={83} colors={[P.mid, P.near]} depth={1} zone={[-100, 1500, 1180, 1920]} count={10} size={[120, 200]} sway={14} />
        </Layer>
        <Black opacity={fade} />
      </CameraRig>
    </Stage>
  );
};

const SFX: SfxEvent[] = [
  {at: 0.0, name: 'engine', v: 0.45},
  {at: 3.1, name: 'engine', v: 0.45},
  {at: 6.2, name: 'engine', v: 0.45},
  {at: 9.3, name: 'engine', v: 0.45},
  {at: 12.4, name: 'engine', v: 0.45},
  {at: 15.5, name: 'engine', v: 0.45},
  {at: 18.6, name: 'engine', v: 0.45},
  {at: 8.1, name: 'chime', v: 0.7},
  {at: 13.6, name: 'branches', v: 0.9},
  {at: 16.6, name: 'chime', v: 0.7},
  {at: 19.4, name: 'sputter', v: 0.8},
  {at: 20.0, name: 'birds', v: 0.6},
  {at: 23.0, name: 'chime', v: 0.6},
  {at: 26.1, name: 'drip', v: 0.5},
  {at: 29.8, name: 'glitch', v: 0.6},
  {at: 31.2, name: 'glitch', v: 0.7},
  {at: 34.0, name: 'boom', v: 1},
  {at: 36.1, name: 'chime', v: 0.6},
  {at: 38.4, name: 'smash', v: 0.8},
];

export const Part1: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(3.5)}>
      <Aerial />
    </Sequence>
    <Sequence from={sec(3.5)} durationInFrames={sec(4)}>
      <Grin />
    </Sequence>
    <Sequence from={sec(7.5)} durationInFrames={sec(3)}>
      <TurnLeftCloseup />
    </Sequence>
    <Sequence from={sec(10.5)} durationInFrames={sec(3)}>
      <NarrowTrack />
    </Sequence>
    <Sequence from={sec(13.5)} durationInFrames={sec(3)}>
      <ScrapeCab />
    </Sequence>
    <Sequence from={sec(16.5)} durationInFrames={sec(3)}>
      <SpiralCab />
    </Sequence>
    <Sequence from={sec(19.5)} durationInFrames={sec(3)}>
      <EngineDies />
    </Sequence>
    <Sequence from={sec(22.5)} durationInFrames={sec(5.5)}>
      <TempleReveal />
    </Sequence>
    <Sequence from={sec(28)} durationInFrames={sec(4)}>
      <ReachCab />
    </Sequence>
    <Sequence from={sec(32)} durationInFrames={sec(8)}>
      <TempleWake />
    </Sequence>
    <Captions lines={CAPTIONS[1]} />
    <MusicBed dips={MUSIC_DIPS[1]} />
    <VoiceOver n={1} />
    <Sfx events={SFX} />
    <PartTitle n={1} title="Turn Left" />
    <PartEnd label="PART 2 →" total={PART_FRAMES} />
  </AbsoluteFill>
);
