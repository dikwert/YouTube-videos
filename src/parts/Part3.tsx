import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../lib/camera';
import {H, W, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {Forest} from '../forest/Forest';
import {Rain} from '../rain/Rain';
import {Ethan} from '../ethan/Ethan';
import {Beam} from '../ui/Beam';
import {Stage} from '../ui/Stage';
import {Subtitles} from '../ui/Subtitles';
import {AudioPlan} from '../audio/AudioPlan';
import {CameraBody, Footprint, MudGround} from '../car/Props';
import {BLANK, NAMES, TempleFacade, WallDevice} from '../temple/Temple';
import {AUDIO, SUBTITLES} from '../script/generated/part3';

/** 0-2.5 s: the footprints of the last part, in the mud. */
const Recap: React.FC = () => (
  <Stage>
    <g transform="translate(0 0)">
      <MudGround seed={31} />
      <Footprint x={440} y={1420} s={1.1} rot={3} />
      <Footprint x={640} y={1290} s={1.04} rot={-3} />
      <Footprint x={470} y={1160} s={0.96} rot={2} />
      <Footprint x={630} y={1040} s={0.9} rot={-2} />
    </g>
    <Rain strength={0.7} wind={0.2} />
  </Stage>
);

/** 2.5-8 s: following the prints into the jungle. */
const Jungle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <CameraRig keys={[{f: 0, x: 0, z: 1.02}, {f: 165, x: -260, z: 1.08}]}>
        <Forest seed={15} dark={0.45} />
        <Rain strength={1.1} wind={0.3} />
      </CameraRig>
      <Ethan x={540} y={1500} s={0.9} walk={f * 0.26} expr="calm" look={1} />
    </Stage>
  );
};

/** 8-12 s: the temple, through the trees. */
const Approach: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 120, z: 1.05}]}>
        <Forest seed={16} dark={0.5} />
        <TempleFacade x={560} y={1440} s={1.05} />
        <Rain strength={1.0} wind={0.3} />
      </CameraRig>
      <Ethan x={ramp(f, 0, 120, 150, 330)} y={1500} s={0.9} walk={f * 0.26} expr="scared" look={1} rim="left" mouth={0} />
    </Stage>
  );
};

/** 12-60 s: inside. The walls are covered with rusted navigators; the screens come on one by one, the camera moves in on the empty one, and "ETHAN" is typed. */
const Hall: React.FC = () => {
  const f = useCurrentFrame();
  // Local time: 0 is 12 s. The zoom runs from 24 s to 36 s (local), i.e. 36-48 s in the part.
  const cx = ramp(f, 720, 1080, 540, 435);
  const cy = ramp(f, 720, 1080, 960, 1200);
  const z = ramp(f, 720, 1080, 1.0, 2.4);
  const sweep = ramp(f, 0, 900, -120, 960);
  // Typing: one letter every second from 36.5 s (local), after the zoom.
  const letters = 'ETHAN';
  const count = Math.max(0, Math.min(5, Math.floor((f - 1095) / 30) + 1));
  const typed = f >= 1095 ? letters.slice(0, count) : '';
  const COLS = [225, 435, 645, 855];
  const ROWS = [600, 800, 1000, 1200, 1400];
  return (
    <Stage>
      <g transform={`translate(${540 - cx * z} ${960 - cy * z}) scale(${z})`}>
        <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill="#0C100D" />
        {Array.from({length: 9}, (_, i) => (
          <rect key={`b${i}`} x={-600 + (i % 3) * 620} y={-400 + Math.floor(i / 3) * 620} width={600} height={600} rx={14} fill="none" stroke="#161C17" strokeWidth={6} />
        ))}
        {ROWS.map((y, r) =>
          COLS.map((x, c) => {
            const i = r * 4 + c;
            const lit = f + sec(12) >= sec(18) + i * 12;
            const isBlank = i === BLANK;
            return (
              <WallDevice
                key={i}
                x={x}
                y={y}
                name={NAMES[i]}
                lit={lit}
                typed={isBlank ? typed : ''}
                cursor={isBlank && f >= 720}
              />
            );
          }),
        )}
        <Beam x0={sweep} y0={-120} x1={sweep + 220} y1={1980} w0={18} w1={300} opacity={0.2} />
      </g>
    </Stage>
  );
};

export const Part3: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(2.5)}>
      <Recap />
    </Sequence>
    <Sequence from={sec(2.5)} durationInFrames={sec(5.5)}>
      <Jungle />
    </Sequence>
    <Sequence from={sec(8)} durationInFrames={sec(4)}>
      <Approach />
    </Sequence>
    <Sequence from={sec(12)} durationInFrames={sec(48)}>
      <Hall />
    </Sequence>
    <AudioPlan plan={AUDIO} />
    <Subtitles cards={SUBTITLES} />
  </AbsoluteFill>
);
