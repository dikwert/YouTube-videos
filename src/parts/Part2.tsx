import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../lib/camera';
import {H, W, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {Forest} from '../forest/Forest';
import {Rain, Lightning} from '../rain/Rain';
import {Ethan} from '../ethan/Ethan';
import {Beam} from '../ui/Beam';
import {Stage} from '../ui/Stage';
import {Subtitles} from '../ui/Subtitles';
import {AudioPlan} from '../audio/AudioPlan';
import {Suv} from '../car/Suv';
import {CabinA, CabinB, CabinC} from '../car/Cabin';
import type {GpsMode} from '../car/Navigator';
import {CameraBody, CameraLCD, Footprint, MudGround} from '../car/Props';
import {AUDIO, SUBTITLES} from '../script/generated/part2';

/** 0-2.5 s: the figure is gone; the path is empty in the rain. */
const Recap: React.FC = () => (
  <Stage>
    <CameraRig keys={[{f: 0, z: 1.02}, {f: 75, z: 1.06}]}>
      <Forest seed={12} dark={0.42} />
      <Rain strength={1.1} wind={0.3} />
    </CameraRig>
  </Stage>
);

/** 2.5-10 s: the camera is lifted from the abandoned jeep. */
const Pickup: React.FC = () => {
  const f = useCurrentFrame();
  const y = ramp(f, 0, 150, 1990, 1120);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 210, z: 1.06}]}>
        <Forest seed={8} dark={0.5} />
        <Suv x={560} y={1400} s={1.35} overgrown wet dirt={0.9} seed={11} />
        <Rain strength={1.2} wind={0.3} />
      </CameraRig>
      <CameraBody x={540} y={y} s={1.15} rot={-4} />
    </Stage>
  );
};

/** 10-22 s: the camera plays the old video: Ethan three years ago, driving this same road. */
const Playback: React.FC = () => {
  const f = useCurrentFrame();
  const mouth = 0.5 + 0.5 * Math.sin(f * 0.8) * Math.sin(f * 0.31);
  return (
    <Stage>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#030403" />
      <CameraLCD x={243} y={470} w={594} h={1056} stamp="NOV 23 2023  06:14" rec>
        <Forest seed={5} dark={0.1} />
        <CabinB rain={0.1} expr="joke" mouth={mouth} wheel={Math.sin(f * 0.05) * 6} />
      </CameraLCD>
    </Stage>
  );
};

/** 22-25 s: Ethan walks to his own jeep, parked behind the abandoned one. */
const WalkToJeep: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 90, z: 1.04}]}>
        <Forest seed={14} dark={0.45} />
        <Suv x={760} y={1400} s={1.25} dirt={0.6} seed={21} />
        <Ethan x={ramp(f, 0, 75, 120, 380)} y={1500} s={0.9} walk={f * 0.3} expr="calm" look={1} />
        <Rain strength={1.3} wind={0.3} />
      </CameraRig>
    </Stage>
  );
};

/** 25-35 s: inside his own jeep. The dash lights flicker; the engine turns over and dies. */
const Ignition: React.FC = () => {
  const f = useCurrentFrame();
  const dim = f % 40 < 10 ? 0.2 : 0.5;
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 300, z: 1.03}]}>
        <Forest seed={14} dark={0.45} />
        <Rain strength={1.2} wind={0.3} />
      </CameraRig>
      <CabinA rain={1.0} expr="scared" turn={Math.sin(f * 0.05) * 5} gps={{mode: 'off'}} wheel={Math.sin(f * 0.3) * 12} dim={dim} />
    </Stage>
  );
};

/** 35-41 s: the old navigator in the abandoned jeep wakes and gives the destination. */
const GpsWake: React.FC = () => {
  const f = useCurrentFrame();
  const mode: GpsMode = f < 15 ? 'off' : 'route';
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 180, z: 1.08}]}>
        <Forest seed={9} dark={0.6} />
        <Rain strength={1.1} wind={0.3} />
      </CameraRig>
      <CabinC gps={{mode, instruction: 'Destination · 2.0 mi'}} rain={0.9} wipers={false} dim={0.35} />
    </Stage>
  );
};

/** 41-50 s: on foot in the rain, the flashlight beam on the path. Thunder at 44 s. */
const Walking: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <CameraRig keys={[{f: 0, x: 0, z: 1.05}, {f: 270, x: -180, z: 1.1}]}>
        <Forest seed={13} dark={0.55} />
        <Rain strength={1.4} wind={0.3} />
      </CameraRig>
      <Ethan x={520} y={1500} s={0.9} walk={f * 0.26} expr="scared" look={1} rim="left" mouth={0} />
      <Beam x0={560} y0={1380} x1={1080} y1={900} w0={24} w1={260} opacity={0.42} />
      <Lightning times={[3.0]} />
    </Stage>
  );
};

/** 50-60 s: fresh prints in the mud, one boot tread after another, leading forward into the dark. */
const Prints: React.FC = () => {
  const f = useCurrentFrame();
  const push = ramp(f, 0, 300, 0, 60);
  const prints = [
    {x: 440, y: 1700, rot: 4, s: 1.25},
    {x: 640, y: 1570, rot: -3, s: 1.2},
    {x: 450, y: 1430, rot: 3, s: 1.12},
    {x: 630, y: 1300, rot: -4, s: 1.02},
    {x: 470, y: 1180, rot: 2, s: 0.94},
    {x: 620, y: 1070, rot: -2, s: 0.86},
    {x: 500, y: 960, rot: 1, s: 0.78},
  ];
  return (
    <Stage>
      <g transform={`translate(0 ${push})`}>
        <MudGround seed={31} />
        {prints.map((p, i) => (
          <Footprint key={i} x={p.x} y={p.y} rot={p.rot} s={p.s} />
        ))}
      </g>
      <Rain strength={0.7} wind={0.2} />
    </Stage>
  );
};

export const Part2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(2.5)}>
      <Recap />
    </Sequence>
    <Sequence from={sec(2.5)} durationInFrames={sec(7.5)}>
      <Pickup />
    </Sequence>
    <Sequence from={sec(10)} durationInFrames={sec(12)}>
      <Playback />
    </Sequence>
    <Sequence from={sec(22)} durationInFrames={sec(3)}>
      <WalkToJeep />
    </Sequence>
    <Sequence from={sec(25)} durationInFrames={sec(10)}>
      <Ignition />
    </Sequence>
    <Sequence from={sec(35)} durationInFrames={sec(6)}>
      <GpsWake />
    </Sequence>
    <Sequence from={sec(41)} durationInFrames={sec(9)}>
      <Walking />
    </Sequence>
    <Sequence from={sec(50)} durationInFrames={sec(10)}>
      <Prints />
    </Sequence>
    <AudioPlan plan={AUDIO} />
    <Subtitles cards={SUBTITLES} />
  </AbsoluteFill>
);
