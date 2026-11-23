import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {COL, PALETTE, PART_FRAMES, sec} from '../lib/theme';
import {hash, ramp} from '../lib/math';
import {CameraRig, Layer} from '../scene/Camera';
import {Canopy, Dust, Fireflies, Fog, GroundBand, Stage, Vines} from '../scene/Environment';
import {Insects, JungleStack, JungleWater} from '../scene/Jungle';
import {Corridor, TempleFacade} from '../characters/Temple';
import {Mason} from '../characters/Mason';
import {Beam, Flakes, Flashlight} from '../characters/Props';
import {JeepSide} from '../characters/Vehicles';
import {Gps} from '../characters/Gps';
import {Black} from './shared';
import {Captions} from '../ui/Captions';
import {PartEnd, PartTitle} from '../ui/Cards';
import {Ambience, MusicBed, Sfx, VoiceOver} from '../ui/AudioMix';
import {DIALOGUE} from '../script/model';
import {MUSIC_DIPS, SFX} from '../script/cues';

const P = PALETTE.dusk2;

const degrees = (x1: number, y1: number, x2: number, y2: number) => (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

/** 1. Mason walks up to the temple doorway with his flashlight; cold mist; fade into the dark. */
const Entrance: React.FC = () => {
  const f = useCurrentFrame();
  const my = ramp(f, 0, 150, 1640, 1190);
  const ms = ramp(f, 0, 150, 1.05, 0.74);
  const bob = Math.sin(f * 0.3) * 6;
  const hx = 540 + 78 * ms + 14;
  const hy = my - 170 * ms + bob;
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 0.95, y: 40},
          {f: 180, z: 1.04, y: -20},
        ]}
      >
        <JungleStack p={P} seed={301} />
        <GroundBand y={1240} color={P.ground} depth={1} seed={33} />
        <TempleFacade awake={0} cx={540} cy={700} s={1} />
        <JungleWater seed={9} />
        <Mason x={540} y={my} s={ms} moving="walk" phase={f * 0.32} armR={-12} expr="determined" sweat />
        <Flashlight x={hx} y={hy} angle={-30} />
        <Beam x0={hx + 30} y0={hy - 16} x1={520} y1={1000} w0={8} w1={150} opacity={0.3} />
        <Fog y={1420} depth={1.2} opacity={0.5} seed={9} />
        <Insects count={18} />
        <Dust count={40} />
        <Black opacity={ramp(f, 150, 175, 0, 1)} />
      </CameraRig>
    </Stage>
  );
};

/** 2. Inside: the flashlight sweeps over the carved faces, all with closed eyes. */
const CorridorSweep: React.FC = () => {
  const f = useCurrentFrame();
  const tx = 540 + 390 * Math.sin(f * 0.035 + 0.4);
  const ty = 880 + 140 * Math.sin(f * 0.02);
  const a = degrees(560, 1500, tx, ty);
  const lx = 560 + Math.cos((a * Math.PI) / 180) * 70;
  const ly = 1500 + Math.sin((a * Math.PI) / 180) * 70;
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.02, x: 0},
          {f: 180, z: 1.1, x: 0},
        ]}
      >
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[0.32, 0.58, 0.84]} dim={0.6} />
        <Beam x0={lx} y0={ly} x1={tx} y1={ty} w0={12} w1={230} opacity={0.42} />
        <Flashlight x={560} y={1500} angle={a} />
        <Fog y={1500} depth={1} opacity={0.3} seed={4} />
        <Dust count={30} />
      </CameraRig>
    </Stage>
  );
};

/** 3. The central hall: a jeep lost in shadow, slow push-in. */
const HallPushIn: React.FC = () => {
  const f = useCurrentFrame();
  const ba = degrees(260, 1640, 540, 1300);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 0.9, y: 0},
          {f: 180, z: 1.3, y: -120},
        ]}
      >
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[]} dim={0.5} />
        <Layer depth={1}>
          <JeepSide x={540} y={1400} s={1.25} rusted={1} darken={0.86} />
        </Layer>
        <Beam
          x0={260 + Math.cos((ba * Math.PI) / 180) * 60}
          y0={1640 + Math.sin((ba * Math.PI) / 180) * 60}
          x1={540}
          y1={1300}
          w0={10}
          w1={180}
          opacity={0.25 + 0.05 * Math.sin(f * 0.1)}
        />
        <Fog y={1450} depth={1} opacity={0.35} seed={12} />
      </CameraRig>
      <Black opacity={0.42} />
    </Stage>
  );
};

/** 4. The reveal: rusted to the bone, roots through the wheels, the jerrycan still on the rack. */
const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const rust = ramp(f, 0, 40, 0, 1);
  const dark = ramp(f, 0, 24, 0.86, 0);
  const ba = degrees(260, 1640, 540, 1300);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.3, y: -120},
          {f: 180, z: 1.16, y: -60},
        ]}
      >
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[]} dim={0.6} />
        <JeepSide x={540} y={1400} s={1.25} rusted={rust} darken={dark} />
        <Beam
          x0={260 + Math.cos((ba * Math.PI) / 180) * 60}
          y0={1640 + Math.sin((ba * Math.PI) / 180) * 60}
          x1={540}
          y1={1300}
          w0={10}
          w1={180}
          opacity={0.3}
        />
        <Fog y={1450} depth={1} opacity={0.3} seed={13} />
      </CameraRig>
    </Stage>
  );
};

/** 5. Mason touches the cabin; rust crumbles away in flakes. */
const TouchJeep: React.FC = () => {
  const f = useCurrentFrame();
  const reach = ramp(f, 0, 30, -20, -58);
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.0, x: 0, y: 0},
          {f: 150, z: 1.12, x: -60, y: -50},
        ]}
      >
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[]} dim={0.6} />
        <JeepSide x={600} y={1400} s={1.25} rusted={1} />
        <Mason x={300} y={1420} s={1.0} armR={reach} expr="awe" look={0.8} sweat />
        <Flakes x0={380} x1={560} y0={1080} start={34} count={46} color={COL.rust} speed={4} size={7} seed={3} />
        <Flakes x0={380} x1={560} y0={1080} start={44} count={30} color={COL.rustDark} speed={3} size={5} seed={8} />
      </CameraRig>
    </Stage>
  );
};

/** 6. Under the dashboard: the cracked GPS flickers on and shows TURN LEFT. */
const DashGps: React.FC = () => {
  const f = useCurrentFrame();
  const on = f >= 70;
  const power = ramp(f, 56, 74, 0, 1);
  const flick = f >= 56 && f < 74 ? (hash(f * 3.7) > 0.4 ? 1 : 0.3) : 1;
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.05},
          {f: 180, z: 1.12},
        ]}
      >
        <rect x={-100} y={-100} width={1300} height={2200} fill="#14201a" />
        <path d="M -40 1170 Q 540 1120 1120 1170 L 1120 1980 L -40 1980 Z" fill="#33342b" />
        <path d="M -40 1172 Q 540 1122 1120 1172" stroke="#4d4f43" strokeWidth={6} fill="none" />
        <Layer depth={1.25}>
          <Vines seed={95} count={12} xMin={0} xMax={1080} len={560} y0={-30} sway={14} color={COL.mossDark} leafColor={COL.moss} width={8} />
        </Layer>
        <Gps
          x={540}
          y={1040}
          s={1.2}
          cracked
          text={on ? 'TURN LEFT' : ''}
          arrow={on ? 'left' : 'none'}
          signal={on ? 4 : 0}
          power={power * flick}
        />
        <Fog y={1500} depth={1} opacity={0.25} seed={21} />
        <Fireflies seed={31} count={8} depth={1} />
      </CameraRig>
    </Stage>
  );
};

/** 7. The moss-covered action camera on the seat: red REC light blinking, a beep. */
const SeatCamera: React.FC = () => {
  const f = useCurrentFrame();
  const rec = Math.floor(f / 14) % 2 === 0;
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.0, x: 0, y: 0},
          {f: 180, z: 1.2, x: 0, y: -40},
        ]}
      >
        <rect x={-100} y={-100} width={1300} height={2200} fill="#1a2a1f" />
        <Canopy seed={401} color="#22402c" depth={0.8} y={300} count={14} rMin={100} rMax={170} band={500} sway={3} />
        <rect x={280} y={1280} width={520} height={460} rx={60} fill="#3b2a1a" />
        <rect x={300} y={1300} width={480} height={80} rx={30} fill="#4c3620" />
        <path d="M 340 1420 L 420 1480 M 620 1400 L 700 1500" stroke="#20150c" strokeWidth={6} />
        <g transform="translate(540 1180) rotate(-6)">
          <rect x={-150} y={-100} width={300} height={200} rx={34} fill="#23272b" />
          <rect x={-150} y={-100} width={300} height={200} rx={34} fill="none" stroke="#3b4147" strokeWidth={6} />
          <circle cx={70} cy={0} r={60} fill="#0d0f11" stroke="#4a525b" strokeWidth={8} />
          <circle cx={58} cy={-14} r={12} fill="#7fb2d6" opacity={0.6} />
          <circle cx={-110} cy={-64} r={14} fill={rec ? '#ff2d2d' : '#5a1a1a'} />
          <ellipse cx={-60} cy={70} rx={60} ry={18} fill={COL.moss} />
          <ellipse cx={90} cy={-80} rx={46} ry={16} fill={COL.mossDark} />
          <ellipse cx={-120} cy={-10} rx={24} ry={38} fill={COL.moss} />
          <ellipse cx={20} cy={-96} rx={60} ry={14} fill={COL.moss} />
          <path d="M -150 0 C -170 -40 -150 -70 -120 -90" stroke="#1a1d20" strokeWidth={10} fill="none" />
        </g>
        <Fireflies seed={5} count={10} depth={1} />
      </CameraRig>
    </Stage>
  );
};

/** 8. Close-up on Mason's frightened face, held while he remembers nothing. */
const FaceClose: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.0},
          {f: 450, z: 1.06},
        ]}
        shakes={[{at: 120, dur: 24, amp: 3}]}
      >
        <JungleStack p={P} seed={501} understory={false} />
        <Mason x={540} y={1950} s={2.35} expr="scared" shiver={2.5} blinkSeed={40} sweat />
        <Black opacity={ramp(f, 420, 450, 0, 1)} />
      </CameraRig>
    </Stage>
  );
};

/** 9. Black after the close-up; the PART 3 card sits in the last second. */
const EndBlack: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;

const L = DIALOGUE['2'];

export const Part2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(6)}>
      <Entrance />
    </Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(6)}>
      <CorridorSweep />
    </Sequence>
    <Sequence from={sec(12)} durationInFrames={sec(6)}>
      <HallPushIn />
    </Sequence>
    <Sequence from={sec(18)} durationInFrames={sec(6)}>
      <Reveal />
    </Sequence>
    <Sequence from={sec(24)} durationInFrames={sec(5)}>
      <TouchJeep />
    </Sequence>
    <Sequence from={sec(29)} durationInFrames={sec(6)}>
      <DashGps />
    </Sequence>
    <Sequence from={sec(35)} durationInFrames={sec(6)}>
      <SeatCamera />
    </Sequence>
    <Sequence from={sec(41)} durationInFrames={sec(15)}>
      <FaceClose />
    </Sequence>
    <Sequence from={sec(56)} durationInFrames={sec(4)}>
      <EndBlack />
    </Sequence>
    <Captions script={L} />
    <Ambience dips={MUSIC_DIPS[2]} />
    <MusicBed dips={MUSIC_DIPS[2]} base={0.1} />
    <VoiceOver n={2} />
    <Sfx events={SFX[2]} />
    <PartTitle n={2} title="The Jeep Inside" />
    <PartEnd label="PART 3 →" total={PART_FRAMES} />
  </AbsoluteFill>
);

