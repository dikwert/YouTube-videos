import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraRig, Layer} from '../scene/Camera';
import {Canopy, GroundBand, Stage} from '../scene/Environment';
import {Corridor, TempleFacade, WallEyes} from '../characters/Temple';
import {Mason} from '../characters/Mason';
import {Gps} from '../characters/Gps';
import {Driver, JeepSide, OldCar, OldCart} from '../characters/Vehicles';
import {CamUI, Flashlight, Beam} from '../characters/Props';
import {PALETTE} from '../lib/theme';

/** Shared thumbnail frame: a dark band behind the title, "PART X" and the series name inside the safe area. */
const Cover: React.FC<{part: number; children: React.ReactNode}> = ({part, children}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {children}
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 26%, rgba(0,0,0,0) 40%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 340,
        left: 60,
        width: 960,
        textAlign: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#ffffff',
      }}
    >
      <div style={{fontSize: 120, fontWeight: 900, textShadow: '0 8px 0 #000'}}>PART {part}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 92,
          fontWeight: 900,
          lineHeight: 1.02,
          color: '#ffe26b',
          WebkitTextStroke: '10px #000',
          paintOrder: 'stroke fill',
        }}
      >
        HIS GPS KNEW
        <br />
        HIS NAME
      </div>
    </div>
  </AbsoluteFill>
);

/** Part 1: Mason's scared face lit by the green GPS, the temple's eyes glowing behind him. */
export const Cover1: React.FC = () => (
  <Cover part={1}>
    <Stage p={PALETTE.dusk3}>
      <CameraRig keys={[{f: 0, z: 1}]}>
        <TempleFacade awake={1} cx={540} cy={800} s={0.95} />
        <Mason x={470} y={1880} s={1.75} expr="scared" shiver={1} rec />
        <Gps x={790} y={1420} s={0.72} text="TURN LEFT" arrow="left" green={1} glitch={0.25} />
      </CameraRig>
    </Stage>
  </Cover>
);

/** Part 2: the rusted jeep inside the temple. */
export const Cover2: React.FC = () => (
  <Cover part={2}>
    <Stage p={PALETTE.dusk2}>
      <CameraRig keys={[{f: 0, z: 1}]}>
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[]} />
        <Beam x0={160} y0={1700} x1={520} y1={1260} w0={14} w1={260} opacity={0.3} />
        <JeepSide x={540} y={1480} s={2.0} rusted={1} />
        <Flashlight x={150} y={1700} angle={-35} />
      </CameraRig>
    </Stage>
  </Cover>
);

/** Part 3: Future Mason on the camera's screen, with REC. */
export const Cover3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cover part={3}>
      <Stage p={PALETTE.dusk3}>
        <CameraRig keys={[{f: 0, z: 1}]}>
          <rect x={-40} y={-40} width={1160} height={2000} fill="#070a08" />
          <Corridor opens={[0, 0, 0]} farOpen={0.7} depthFaces={[]} />
          <Mason x={540} y={1900} s={1.95} future expr="scared" shiver={2} />
          <Layer depth={1}>
            <rect x={-40} y={(f * 17) % 1920} width={1160} height={10} fill="#ffffff" opacity={0.06} />
          </Layer>
          <CamUI timecode="00:00:12:04" rec playing />
        </CameraRig>
      </Stage>
    </Cover>
  );
};

/** Part 4: the hall of rusted vehicles, carved eyes glowing along the walls. */
export const Cover4: React.FC = () => (
  <Cover part={4}>
    <Stage p={PALETTE.deep4}>
      <CameraRig keys={[{f: 0, z: 1, x: 0}]}>
        <rect x={-400} y={-200} width={1880} height={2300} fill="#0c1a12" />
        <WallEyes opens={[1, 1, 1, 1, 1]} xs={[120, 330, 540, 750, 960]} y={640} w={120} />
        <WallEyes opens={[1, 1, 1, 1, 1, 1]} xs={[40, 240, 440, 640, 840, 1040]} y={900} w={96} />
        <GroundBand y={1480} color="#2a2719" stoneColor="#3d3a2a" depth={1} seed={91} />
        <OldCart x={160} y={1500} s={1.3} />
        <OldCar x={520} y={1500} s={1.3} flip />
        <JeepSide x={900} y={1500} s={1.35} rusted={1} />
      </CameraRig>
    </Stage>
  </Cover>
);

/** Part 5: Mason in the truck, the GPS glowing green. */
export const Cover5: React.FC = () => (
  <Cover part={5}>
    <Stage p={PALETTE.twist}>
      <CameraRig keys={[{f: 0, z: 1}]}>
        <path d="M -10 -10 L 1090 -10 L 1090 1190 L -10 1190 Z" fill="none" stroke="#161c19" strokeWidth={120} />
        <Canopy seed={701} color={PALETTE.twist.far} depth={0.4} y={700} count={12} rMin={110} rMax={170} band={260} sway={0} />
        <path d="M -40 1170 Q 540 1120 1120 1170 L 1120 1980 L -40 1980 Z" fill="#3a3a33" />
        <Driver x={300} y={1180} s={1.4} smile={1} />
        <Mason x={760} y={1292} s={1.4} expr="relief" look={0.3} />
        <Gps x={555} y={1280} s={0.52} text="WELCOME BACK" arrow="none" signal={4} green={1} />
      </CameraRig>
    </Stage>
  </Cover>
);
