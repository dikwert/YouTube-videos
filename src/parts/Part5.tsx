import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {PALETTE, PART_FRAMES, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {CameraRig} from '../scene/Camera';
import {Canopy, Dust, GroundBand, LightRays, Stage, Sun, Trunks, Vines} from '../scene/Environment';
import {Insects} from '../scene/Jungle';
import {Corridor} from '../characters/Temple';
import {Mason} from '../characters/Mason';
import {Flakes, Flash, Shards} from '../characters/Props';
import {Gps} from '../characters/Gps';
import {Driver, TruckSide} from '../characters/Vehicles';
import {Black, StaticNoise} from './shared';
import {Captions} from '../ui/Captions';
import {PartEnd, PartTitle} from '../ui/Cards';
import {Ambience, MusicBed, Sfx, VoiceOver} from '../ui/AudioMix';
import {DIALOGUE} from '../script/model';
import {MUSIC_DIPS, SFX} from '../script/cues';

const DARK = PALETTE.deep4;
const SUN = PALETTE.sun;
const TWIST = PALETTE.twist;

/** 1. Mason turns RIGHT. The temple rumbles; dust falls. */
const TurnRight: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage p={DARK}>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 180, z: 1.08, x: -20}]} shakes={[{at: 0, dur: 70, amp: 16}]}>
        <Corridor opens={[0.6, 0.6, 0.6]} farOpen={0.6} depthFaces={[]} dim={0.8} />
        <Flakes x0={0} x1={1080} y0={-40} start={0} count={90} color="#8c7b5a" speed={6} size={5} seed={5} />
        <Mason x={ramp(f, 0, 90, 540, 600)} y={1560} s={1.0} expr="determined" look={ramp(f, 0, 90, 0, 1)} tilt={ramp(f, 0, 90, 0, 8)} sweat />
        <Dust count={40} color="#c8b98a" />
        <Insects count={10} />
      </CameraRig>
    </Stage>
  );
};

/** 2. Vines lash at his legs; he breaks free. Blood on his arm. */
const Vined: React.FC = () => {
  const f = useCurrentFrame();
  const free = ramp(f, 84, 104, 1, 0);
  const struggle = f < 84 ? 6 : 2;
  const blood = ramp(f, 60, 80, 0, 1);
  return (
    <Stage p={DARK}>
      <CameraRig keys={[{f: 0, z: 1.08}, {f: 180, z: 1.14}]} shakes={[{at: 84, dur: 18, amp: 12}]}>
        <Corridor opens={[0.6, 0.6, 0.6]} farOpen={0.6} depthFaces={[]} dim={0.8} />
        <g opacity={free}>
          <Vines seed={7} count={7} xMin={260} xMax={820} len={-640} y0={1920} width={18} sway={70} color="#2c4a22" leafColor="#3c6b2f" />
        </g>
        <Mason
          x={620 + (f >= 84 ? ramp(f, 84, 110, 0, 110) : 0)}
          y={1560}
          s={1.0}
          expr="scared"
          shiver={struggle}
          armL={Math.sin(f * 0.6) * 40 - 20}
          armR={Math.sin(f * 0.6 + 2) * 40 + 10}
          look={-0.4}
          sweat
        />
        <g opacity={blood} stroke="#b0121a" strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M 560 1250 L 585 1290 M 575 1240 L 600 1282" />
          <path d="M 548 1300 Q 560 1320 576 1338" />
        </g>
      </CameraRig>
    </Stage>
  );
};

/** 3. The GPS shrieks and glitches green; he smashes it on the stone. */
const Smash: React.FC = () => {
  const f = useCurrentFrame();
  const broken = f >= 84;
  const glitch = ramp(f, 0, 40, 0.3, 0.9);
  return (
    <Stage p={DARK}>
      <CameraRig keys={[{f: 0, z: 1}, {f: 150, z: 1.08}]} shakes={[{at: 84, dur: 20, amp: 14}]}>
        <Corridor opens={[0.6, 0.6, 0.6]} farOpen={0.6} depthFaces={[]} dim={0.8} />
        {!broken && <Gps x={555} y={1010} s={0.58} rot={-6} text="TURN LEFT" arrow="left" signal={4} green={1} glitch={glitch} />}
        {broken && <Shards x={555} y={1040} start={84} count={24} color="#bfe9ff" />}
        {broken && <Shards x={555} y={1040} start={86} count={12} color="#18c46a" seed={9} />}
        <Flash x={555} y={1040} start={84} dur={14} r={520} />
        <Mason x={560} y={1560} s={1.0} expr="shock" shiver={5} armR={150} look={0.3} sweat />
      </CameraRig>
    </Stage>
  );
};

/** 4. The voice keeps talking from his chest camera; he rips it off and throws it into the dark. */
const ChestCam: React.FC = () => {
  const f = useCurrentFrame();
  const glow = ramp(f, 10, 36, 0, 1);
  const tear = ramp(f, 46, 70, 0, 1);
  const throwT = ramp(f, 72, 112, 0, 1);
  const camX = 540 + (150 - 540) * throwT;
  const camY = 1240 + (1500 - 1240) * throwT * throwT - 200 * Math.sin(throwT * Math.PI);
  const camRot = throwT * 540;
  const camScale = 1 - 0.55 * throwT;
  const chestX = 540;
  const chestY = 1560 - 318;
  return (
    <Stage p={DARK}>
      <CameraRig keys={[{f: 0, z: 1.06}, {f: 180, z: 1.1}]} shakes={[{at: 70, dur: 16, amp: 8}]}>
        <Corridor opens={[0.8, 0.8, 0.8]} farOpen={0.9} depthFaces={[]} dim={0.8} />
        <Mason x={540} y={1560} s={1.0} expr="scared" shiver={2} armL={7 + tear * 30} look={0} noCam={throwT > 0.02} blinkSeed={22} sweat />
        {throwT < 0.02 && (
          <g>
            <circle cx={chestX} cy={chestY} r={40 + glow * 22} fill="#4dff9a" opacity={0.25 * glow} />
            <circle cx={chestX + 18} cy={chestY - 14} r={4 + glow * 3} fill="#4dff9a" opacity={glow} />
          </g>
        )}
        {throwT > 0 && throwT < 1 && (
          <g transform={`translate(${camX} ${camY}) rotate(${camRot}) scale(${camScale})`}>
            <rect x={-54} y={-38} width={108} height={76} rx={14} fill="#202326" />
            <circle cx={0} cy={0} r={20} fill="#0c0e10" stroke="#5b6470" strokeWidth={5} />
          </g>
        )}
        <Dust count={36} color="#8aff9a" />
      </CameraRig>
    </Stage>
  );
};

/** 5. He bursts out into bright sunlight onto a road. A white truck stops. */
const Sunlit: React.FC = () => {
  const f = useCurrentFrame();
  const truckX = ramp(f, 60, 124, 1500, 800);
  const roll = Math.min(f, 124) * 14;
  const masonX = ramp(f, 0, 70, -200, 380);
  return (
    <Stage p={SUN}>
      <CameraRig
        keys={[
          {f: 0, z: 1.05},
          {f: 210, z: 1.0},
        ]}
      >
        <Sun x={800} y={420} r={150} />
        <LightRays depth={1} opacity={0.16} color="#fff7d6" seed={12} />
        <Canopy seed={601} color={SUN.far} depth={0.4} y={560} count={14} rMin={120} rMax={180} band={260} sway={4} />
        <Trunks seed={602} color={SUN.mid} depth={0.6} top={0} bottom={1420} count={6} wMin={50} wMax={90} />
        <GroundBand y={1420} color={SUN.road} stoneColor={SUN.ground} depth={1} seed={61} />
        <rect x={-300} y={1600} width={1700} height={28} fill="#f7f1dc" opacity={0.7} />
        <TruckSide x={truckX} y={1480} s={1.2} roll={roll} />
        <Mason x={masonX} y={1520} s={0.9} moving="run" phase={f * 0.5} expr="relief" sweat />
        <Flash x={540} y={960} start={0} dur={16} r={900} color="#fff7d6" />
      </CameraRig>
    </Stage>
  );
};

/** The cab of the truck: the friendly driver, Mason in the passenger seat, the windscreen frame and dash. */
const CabInterior: React.FC<{
  p: typeof SUN;
  gpsText: string;
  gpsGreen: number;
  gpsPower: number;
  masonExpr: 'relief' | 'shock' | 'neutral';
  masonTilt: number;
  frozen?: boolean;
  keys: Array<{f: number; z?: number; x?: number; y?: number}>;
  smile?: number;
  children?: React.ReactNode;
}> = ({p, gpsText, gpsGreen, gpsPower, masonExpr, masonTilt, frozen = false, keys, smile = 1, children}) => (
  <Stage p={p}>
    <CameraRig keys={keys}>
      <Sun x={720} y={380} r={130} />
      <Canopy seed={701} color={p.far} depth={0.4} y={640} count={12} rMin={110} rMax={170} band={260} sway={4} />
      <GroundBand y={1520} color={p.road} stoneColor={p.ground} depth={0.6} seed={81} />
      <Driver x={300} y={1120} s={1.1} smile={smile} />
      <g style={{filter: frozen ? 'grayscale(1) contrast(1.15)' : 'none'}}>
        <Mason x={760} y={1292} s={1.22} expr={masonExpr} tilt={masonTilt} look={0.3} />
      </g>
      <path d="M -10 -10 L 1090 -10 L 1090 1190 L -10 1190 Z" fill="none" stroke="#161c19" strokeWidth={120} />
      <path d="M -40 1170 Q 540 1120 1120 1170 L 1120 1980 L -40 1980 Z" fill="#3a3a33" />
      <path d="M -40 1172 Q 540 1122 1120 1172" stroke="#6b6a5d" strokeWidth={6} fill="none" />
      <Gps x={555} y={1280} s={0.52} text={gpsText} arrow={gpsText ? 'straight' : 'none'} signal={4} green={gpsGreen} power={gpsPower} />
      {children}
    </CameraRig>
  </Stage>
);

/** 6. "Lost, buddy? Hop in." Mason collapses into the seat, relieved. */
const CabTalk: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CabInterior
      p={SUN}
      gpsText=""
      gpsGreen={0}
      gpsPower={0}
      masonExpr="relief"
      masonTilt={ramp(f, 0, 70, 12, -4)}
      keys={[
        {f: 0, z: 1},
        {f: 240, z: 1.06, y: -30},
      ]}
      smile={ramp(f, 20, 70, 0, 1)}
    />
  );
};

/** 7. The driver asks where he's headed. The dash GPS is still dark. */
const CabWait: React.FC = () => (
  <CabInterior
    p={SUN}
    gpsText=""
    gpsGreen={0}
    gpsPower={0}
    masonExpr="neutral"
    masonTilt={-4}
    keys={[
      {f: 0, z: 1.06, y: -30},
      {f: 210, z: 1.08, y: -40},
    ]}
    smile={1}
  />
);

/** 8. The dashboard GPS lights up GREEN: "Welcome back, Mason." The face freezes. */
const CabGlow: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CabInterior
      p={TWIST}
      gpsText={f >= 72 ? 'WELCOME BACK, MASON' : ''}
      gpsGreen={ramp(f, 0, 30, 0, 1)}
      gpsPower={ramp(f, 0, 14, 0, 1)}
      masonExpr="shock"
      masonTilt={-4}
      frozen={f >= 150}
      keys={[
        {f: 0, z: 1.08, y: -40},
        {f: 210, z: 1.12, y: -50},
      ]}
      smile={1}
    />
  );
};

/** 9. The frozen moment, then black; the THE END? card sits in the last second. */
const Freeze: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <StaticNoise opacity={ramp(f, 0, 30, 0.2, 0)} seed={8} />
        <Black opacity={ramp(f, 110, 150, 0, 1)} />
      </svg>
    </AbsoluteFill>
  );
};

const SFX_ITEMS = SFX[5];
const L = DIALOGUE['5'];

export const Part5: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(6)}>
      <TurnRight />
    </Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(6)}>
      <Vined />
    </Sequence>
    <Sequence from={sec(12)} durationInFrames={sec(5)}>
      <Smash />
    </Sequence>
    <Sequence from={sec(17)} durationInFrames={sec(6)}>
      <ChestCam />
    </Sequence>
    <Sequence from={sec(23)} durationInFrames={sec(7)}>
      <Sunlit />
    </Sequence>
    <Sequence from={sec(30)} durationInFrames={sec(8)}>
      <CabTalk />
    </Sequence>
    <Sequence from={sec(38)} durationInFrames={sec(7)}>
      <CabWait />
    </Sequence>
    <Sequence from={sec(45)} durationInFrames={sec(7)}>
      <CabGlow />
    </Sequence>
    <Sequence from={sec(52)} durationInFrames={sec(8)}>
      <Freeze />
    </Sequence>
    <Captions script={L} />
    <Ambience dips={MUSIC_DIPS[5]} />
    <MusicBed dips={MUSIC_DIPS[5]} base={0.1} />
    <VoiceOver n={5} />
    <Sfx events={SFX_ITEMS} />
    <PartTitle n={5} title="Turn Right" />
    <PartEnd label="THE END?" total={PART_FRAMES} />
  </AbsoluteFill>
);

