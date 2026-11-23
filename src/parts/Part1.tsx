import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {PALETTE, PART_FRAMES, sec} from '../lib/theme';
import {ramp, rng} from '../lib/math';
import {CameraRig, Layer} from '../scene/Camera';
import {Clouds, Dust, Fog, LightRays, Stage} from '../scene/Environment';
import {Cluster, Insects, JungleStack} from '../scene/Jungle';
import {Black, Cockpit, GpsCloseup, StaticNoise, TrackGround} from './shared';
import {JeepSide, JeepTop} from '../characters/Vehicles';
import {TempleFacade} from '../characters/Temple';
import {Flash} from '../characters/Props';
import {Captions} from '../ui/Captions';
import {PartEnd, PartTitle} from '../ui/Cards';
import {Ambience, MusicBed, Sfx, VoiceOver} from '../ui/AudioMix';
import {DIALOGUE} from '../script/model';
import {MUSIC_DIPS, SFX} from '../script/cues';

const P = PALETTE.bright;

/** Winding dirt road seen from above (used by the aerial shot). */
const roadX = (y: number) => 540 + 170 * Math.sin(y / 330) + 60 * Math.sin(y / 140);
const roadD = (() => {
  const parts: string[] = [];
  for (let y = -200; y <= 2120; y += 30) parts.push(`${parts.length ? 'L' : 'M'} ${roadX(y).toFixed(1)} ${y}`);
  return parts.join(' ');
})();

/** Canopy clusters placed so the road stays open. */
const roadCanopy = (() => {
  const r = rng(77);
  const out: Array<{x: number; y: number; s: number; sd: number}> = [];
  while (out.length < 70) {
    const x = -200 + r() * 1480;
    const y = -200 + r() * 2300;
    if (Math.abs(x - roadX(y)) < 150) continue;
    out.push({x, y, s: 130 + r() * 60, sd: Math.floor(r() * 1e6)});
  }
  return out;
})();

/** 1. Aerial over the jungle; the jeep crawls up the winding road. */
const Aerial: React.FC = () => {
  const f = useCurrentFrame();
  const y = 1700 - f * 6;
  const slope = roadX(y - 2) - roadX(y + 2);
  const rot = (Math.atan2(slope, 4) * 180) / Math.PI;
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 0.8, y: 120},
          {f: 180, z: 0.97, y: -40},
        ]}
      >
        <Layer depth={1}>
          <rect x={-300} y={-300} width={1700} height={2600} fill={P.mid} />
          <path d={roadD} stroke={P.road} strokeWidth={130} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={roadD} stroke="#f6e7b5" strokeOpacity={0.45} strokeWidth={6} strokeDasharray="30 40" fill="none" />
        </Layer>
        <Layer depth={1.05}>
          {roadCanopy.map((c, i) => (
            <Cluster key={i} x={c.x} y={c.y} s={c.s} colors={[P.far, P.mid, P.near]} n={7} seed={c.sd} sway={6} speed={0.025} />
          ))}
        </Layer>
        <JeepTop x={roadX(y)} y={y} rot={rot} s={0.9} />
        <LightRays depth={1} opacity={0.12} />
        <Insects count={28} />
        <Dust count={60} />
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
      {f: 150, z: 1.05, y: -20},
    ]}
    mason={{expr: 'grin', look: 0, blinkSeed: 20, rec: true}}
    gps={{text: 'FOLLOW ROUTE', arrow: 'straight', signal: 4}}
    seed={12}
  />
);

/** 3. GPS close-up: TURN LEFT. */
const TurnLeftCloseup: React.FC = () => (
  <GpsCloseup
    p={P}
    keys={[
      {f: 0, z: 0.93},
      {f: 105, z: 1.04},
    ]}
    gps={{text: 'TURN LEFT', arrow: 'left', signal: 4}}
    seed={22}
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
          {f: 135, x: -120, y: -20, z: 1.12, r: -4},
        ]}
      >
        <Clouds depth={0.15} y={260} opacity={0.4} />
        <JungleStack p={P} seed={31} />
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
        {f: 120, z: 1.03},
      ]}
      shakes={[
        {at: 20, dur: 16, amp: 14},
        {at: 44, dur: 12, amp: 7},
      ]}
      mason={{expr: f > 20 ? 'scared' : 'neutral', look: 0.3}}
      gps={{text: 'NO SIGNAL', arrow: 'none', signal: sig}}
      branches={18}
      rattle={f > 18 && f < 50 ? 3 : 0}
      seed={13}
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
        {f: 120, z: 1.2, x: 0, y: 110},
      ]}
      mason={{expr: 'frown', look: -0.3}}
      gps={{
        text: 'TURN LEFT',
        arrow: 'left',
        signal: 4,
        green: ramp(f, 10, 60, 0, 0.6),
        spiral: ramp(f, 15, 80, 0, 1),
      }}
      seed={14}
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
        {f: 120, z: 1.02},
      ]}
      mason={{expr: 'shock', look: 0}}
      gps={{text: '', arrow: 'none', signal: 0, power: ramp(f, 0, 45, 1, 0.2)}}
      birds={6}
      rattle={f < 30 ? 4 : 0}
      seed={15}
    />
  );
};

/** 8. Slow reveal of the overgrown temple in fog and light rays. */
const TempleReveal: React.FC = () => (
  <Stage p={P}>
    <CameraRig
      keys={[
        {f: 0, z: 0.5, x: 0, y: 260},
        {f: 180, z: 1, x: 0, y: -40},
      ]}
    >
      <Clouds depth={0.15} y={280} opacity={0.35} />
      <JungleStack p={P} seed={71} understory={false} trunks={false} />
      <TempleFacade awake={0} cx={540} cy={760} s={1} />
      <Fog y={1250} depth={1} opacity={0.35} seed={5} />
      <LightRays depth={1} opacity={0.14} />
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
        {f: 150, z: 1.08, y: 40},
      ]}
      mason={{expr: 'determined', armR: ramp(f, 0, 110, 8, -68), look: 0.4, sweat: true}}
      gps={{
        text: 'TURN LEFT',
        arrow: 'left',
        signal: 4,
        green: ramp(f, 40, 110, 0, 1),
        glitch: ramp(f, 60, 110, 0, 0.9),
      }}
      seed={16}
    />
  );
};

/** 10. The temple's face wakes at the GPS whisper; the eyes glow green; then the screen cuts to black. */
const TempleWake: React.FC = () => {
  const f = useCurrentFrame();
  const awake = ramp(f, 180, 204, 0, 1);
  const fade = ramp(f, 330, 360, 0, 1);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1, y: -40},
          {f: 480, z: 1.08, y: -80},
        ]}
        shakes={[{at: 178, dur: 30, amp: 10}]}
      >
        <JungleStack p={P} seed={81} understory={false} />
        <TempleFacade awake={awake} cx={540} cy={760} s={1} />
        <Flash x={540} y={760} start={180} dur={14} color="#b6ffd0" r={900} />
        <Fog y={1250} depth={1} opacity={0.3} seed={6} />
        <Black opacity={fade} />
      </CameraRig>
    </Stage>
  );
};

/** 11. Mason, shaken, sees the screen and hears his name. */
const ShockCab: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cockpit
      p={P}
      keys={[
        {f: 0, z: 1},
        {f: 120, z: 1.05},
      ]}
      mason={{expr: 'shock', look: 0, sweat: true, shiver: f < 30 ? 2 : 0}}
      gps={{text: '', arrow: 'none', signal: 1, power: 0.5}}
      seed={17}
    />
  );
};

/** 12. Cut to black and static; PART 2 card in the last second. */
const BlackStatic: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <StaticNoise opacity={0.25 + 0.15 * Math.sin(f * 0.7)} seed={3} />
      </svg>
    </AbsoluteFill>
  );
};

const L = DIALOGUE['1'];

export const Part1: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(6)}>
      <Aerial />
    </Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(5)}>
      <Grin />
    </Sequence>
    <Sequence from={sec(11)} durationInFrames={sec(3.5)}>
      <TurnLeftCloseup />
    </Sequence>
    <Sequence from={sec(14.5)} durationInFrames={sec(4.5)}>
      <NarrowTrack />
    </Sequence>
    <Sequence from={sec(19)} durationInFrames={sec(4)}>
      <ScrapeCab />
    </Sequence>
    <Sequence from={sec(23)} durationInFrames={sec(4)}>
      <SpiralCab />
    </Sequence>
    <Sequence from={sec(27)} durationInFrames={sec(4)}>
      <EngineDies />
    </Sequence>
    <Sequence from={sec(31)} durationInFrames={sec(6)}>
      <TempleReveal />
    </Sequence>
    <Sequence from={sec(37)} durationInFrames={sec(5)}>
      <ReachCab />
    </Sequence>
    <Sequence from={sec(42)} durationInFrames={sec(8)}>
      <TempleWake />
    </Sequence>
    <Sequence from={sec(50)} durationInFrames={sec(4)}>
      <ShockCab />
    </Sequence>
    <Sequence from={sec(54)} durationInFrames={sec(6)}>
      <BlackStatic />
    </Sequence>
    <Captions script={L} />
    <Ambience dips={MUSIC_DIPS[1]} />
    <MusicBed dips={MUSIC_DIPS[1]} base={0.1} />
    <VoiceOver n={1} />
    <Sfx events={SFX[1]} />
    <PartTitle n={1} title="Turn Left" />
    <PartEnd label="PART 2 →" total={PART_FRAMES} />
  </AbsoluteFill>
);

