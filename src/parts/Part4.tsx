import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../lib/camera';
import {H, W, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {ScreenGlow} from '../car/Navigator';
import {Stage} from '../ui/Stage';
import {Subtitles} from '../ui/Subtitles';
import {AudioPlan} from '../audio/AudioPlan';
import {BLANK, NAMES, WallDevice} from '../temple/Temple';
import {AUDIO, SUBTITLES} from '../script/generated/part4';

const COLS = [225, 435, 645, 855];
const ROWS = [600, 800, 1000, 1200, 1400];
const BODY =
  'M -9 -254 L 9 -254 L 11 -238 L 34 -232 Q 42 -196 38 -150 L 30 -100 L 36 -60 L 28 -56 L 24 0 L 6 0 L 2 -90 L -2 -90 L -6 0 L -24 0 L -28 -56 L -36 -60 L -30 -100 L -38 -150 Q -42 -196 -34 -232 L -11 -238 Z';

/** An older Ethan in silhouette: thin, bearded, torn jacket. Feet at (0,0), about 300 units tall. */
const OlderSilhouette: React.FC<{x: number; y: number; s: number; bob?: number; opacity?: number}> = ({
  x,
  y,
  s,
  bob = 0,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`} opacity={opacity} fill="#030403" stroke="#4B6A58" strokeWidth={1.6}>
    <circle cx={0} cy={-276} r={22} />
    <path d="M -14 -262 Q 0 -236 14 -262 Q 8 -246 0 -244 Q -8 -246 -14 -262 Z" />
    <path d={BODY} />
  </g>
);

/** The wall of navigators. `lit` says which screens are on, `name` what each one shows. */
const Wall: React.FC<{lit: (i: number) => boolean; name: (i: number) => string; blank?: string; cursor?: boolean}> = ({
  lit,
  name,
  blank = '',
  cursor = false,
}) => (
  <>
    {ROWS.map((y, r) =>
      COLS.map((x, c) => {
        const i = r * 4 + c;
        return (
          <WallDevice
            key={i}
            x={x}
            y={y}
            name={name(i)}
            lit={lit(i)}
            typed={i === BLANK ? blank : ''}
            cursor={i === BLANK && cursor}
          />
        );
      }),
    )}
  </>
);

const Dark: React.FC = () => <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#040504" />;

/** 0-2.5 s: one screen waiting, its cursor blinking, in close-up. */
const Recap: React.FC = () => (
  <Stage>
    <g transform="translate(540 960) scale(3) translate(-540 -960)">
      <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill="#0C100D" />
      <WallDevice x={540} y={960} name="" lit typed="" cursor />
    </g>
  </Stage>
);

/** 2.5-12 s: the figure steps out of the dark, towards the wall. */
const Emerge: React.FC = () => {
  const f = useCurrentFrame();
  const x = ramp(f, 0, 270, 900, 620);
  return (
    <Stage>
      <Dark />
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 270, z: 1.06}]}>
        <Wall lit={(i) => i === BLANK} name={() => ''} cursor />
      </CameraRig>
      <OlderSilhouette x={x} y={1560} s={1.25} bob={-Math.abs(Math.sin(f * 0.2)) * 3} />
    </Stage>
  );
};

/** 12-24 s: he comes close; the screens light up one after another and show their names. At 22 s they say ARRIVED. */
const Closer: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + sec(12);
  const x = ramp(f, 0, 300, 620, 540);
  return (
    <Stage>
      <Dark />
      <CameraRig keys={[{f: 0, z: 1.06}, {f: 300, z: 1.1}]}>
        <Wall
          lit={(i) => i === BLANK || g >= sec(15) + i * 6}
          name={(i) => (g >= sec(22) ? 'ARRIVED' : NAMES[i])}
          cursor={g < sec(22)}
        />
      </CameraRig>
      <ScreenGlow cx={540} cy={1000} r={560} opacity={0.12 * ramp(g, sec(15), sec(22), 0, 1)} color="#7FFFC4" />
      <OlderSilhouette x={x} y={1600} s={1.4} bob={-Math.abs(Math.sin(f * 0.2)) * 3} />
    </Stage>
  );
};

/** 24-36 s: every screen says the same word. The old man stands in front of the wall. */
const Chorus: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = f < 40 ? 0.22 * (1 - (f % 20) / 20) : 0;
  return (
    <Stage>
      <Dark />
      <CameraRig keys={[{f: 0, z: 1.1}, {f: 360, z: 1.12}]}>
        <Wall lit={() => true} name={() => 'ARRIVED'} />
      </CameraRig>
      <OlderSilhouette x={540} y={1600} s={1.4} />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#7FFFC4" opacity={pulse} />
    </Stage>
  );
};

/** 36-46 s: he is pulled back into the dark, and the screens go out one by one. */
const Dragged: React.FC = () => {
  const f = useCurrentFrame();
  const x = ramp(f, 0, 240, 540, -260);
  const op = ramp(f, 120, 240, 1, 0);
  return (
    <Stage>
      <Dark />
      <CameraRig keys={[{f: 0, z: 1.1}, {f: 300, z: 1.0}]}>
        <Wall lit={(i) => f < 30 + i * 4} name={() => 'ARRIVED'} />
      </CameraRig>
      <OlderSilhouette x={x} y={1600} s={1.4} opacity={op} />
    </Stage>
  );
};

/** A digital watch: the date and time on its screen. The face flickers at the end. */
const Watch: React.FC<{x: number; y: number; s: number; flick: boolean}> = ({x, y, s, flick}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-420} width={140} height={260} rx={24} fill="#151A16" />
    <rect x={-70} y={160} width={140} height={260} rx={24} fill="#151A16" />
    <rect x={-150} y={-150} width={300} height={300} rx={60} fill="#2A2E29" stroke="#0B0D0B" strokeWidth={6} />
    <rect x={-124} y={-124} width={248} height={248} rx={40} fill="#0A0F0C" />
    <g opacity={flick ? 0.35 : 1}>
      <text x={0} y={-72} textAnchor="middle" fontFamily="monospace" fontSize={22} fontWeight={700} fill="#8FB8A6">
        THU
      </text>
      <text x={0} y={-24} textAnchor="middle" fontFamily="monospace" fontSize={34} fontWeight={800} fill="#BFF3DD">
        NOV 23 2023
      </text>
      <text x={0} y={44} textAnchor="middle" fontFamily="monospace" fontSize={48} fontWeight={800} fill="#E8FFF4">
        06:14:52
      </text>
    </g>
  </g>
);

/** 46-60 s: the watch, in the dark. The date on it is the date of the old video. */
const WatchScene: React.FC = () => {
  const f = useCurrentFrame();
  const flick = f > 300 && f % 17 < 3;
  return (
    <Stage>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#020302" />
      <Watch x={540} y={960} s={1.2} flick={flick} />
    </Stage>
  );
};

export const Part4: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(2.5)}>
      <Recap />
    </Sequence>
    <Sequence from={sec(2.5)} durationInFrames={sec(9.5)}>
      <Emerge />
    </Sequence>
    <Sequence from={sec(12)} durationInFrames={sec(12)}>
      <Closer />
    </Sequence>
    <Sequence from={sec(24)} durationInFrames={sec(12)}>
      <Chorus />
    </Sequence>
    <Sequence from={sec(36)} durationInFrames={sec(10)}>
      <Dragged />
    </Sequence>
    <Sequence from={sec(46)} durationInFrames={sec(14)}>
      <WatchScene />
    </Sequence>
    <AudioPlan plan={AUDIO} />
    <Subtitles cards={SUBTITLES} />
  </AbsoluteFill>
);
