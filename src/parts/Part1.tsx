import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../lib/camera';
import {H, PART_FRAMES, W, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {Forest} from '../forest/Forest';
import {Rain, Lightning} from '../rain/Rain';
import {GpsUnit} from '../gps/GpsUnit';
import {JeepSide, CockpitFrame} from '../jeep/Jeep';
import {Ethan} from '../ethan/Ethan';
import {Beam} from '../ui/Beam';
import {ChapterCard} from '../ui/Title';
import {Stage} from '../ui/Stage';
import {Subtitles} from '../ui/Subtitles';
import {CHAPTER_CARD, LIGHTNING, SUBTITLES} from '../script/part1';

/** 0-3 s HOOK: night rain, the navigator in close-up with glitching drops. */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const glitch = ramp(f, 36, 78, 0, 0.9);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 90, z: 1.08}]}>
        <Forest seed={3} dark={0.25} />
        <GpsUnit x={540} y={640} s={1.3} mode="route" glitch={glitch} instruction="300 ft · Turn left" />
        <Rain strength={1.25} wind={0.3} />
      </CameraRig>
    </Stage>
  );
};

/** 3-6 s: the chapter card over dark forest. The card is HTML text, so it sits beside the SVG stage, not inside it. */
const Chapter: React.FC = () => (
  <>
    <Stage>
      <Forest seed={4} dark={0.65} />
      <Rain strength={0.6} />
    </Stage>
    <ChapterCard s={CHAPTER_CARD.s - 3} e={CHAPTER_CARD.e - 3} text={CHAPTER_CARD.text} />
  </>
);

/** Layer helper used inside DayDrive (keeps the forest a step behind the cab). */
const Layer: React.FC<{children: React.ReactNode}> = ({children}) => <g>{children}</g>;

/** 6-15 s: daylight under grey cloud, driving; Ethan talks to his camera on the dash. */
const DayDrive: React.FC = () => {
  const f = useCurrentFrame();
  const mouth = 0.5 + 0.5 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, x: 0, z: 1}, {f: 270, x: -160, z: 1.02}]} shakes={[{at: 0, dur: 270, amp: 1.5}]}>
        <Layer>
          <Forest seed={5} dark={0.1} />
        </Layer>
        <CockpitFrame
          wipe={false}
          rain={0}
          gpsSlot={<GpsUnit x={540} y={490} s={0.62} mode="route" instruction="2.1 mi · Keep left" />}
        />
        <Ethan x={540} y={1290} s={1.2} expr="joke" mouth={mouth} look={-0.3} rim="right" rec />
      </CameraRig>
    </Stage>
  );
};

/** 15-25 s: signal drops, the navigator reroutes off the road; rain comes in. */
const SignalLost: React.FC = () => {
  const f = useCurrentFrame();
  const mode = f < 30 ? 'nosignal' : f < 60 ? 'recalc' : 'route';
  const rain = ramp(f, 60, 150, 0, 1.2);
  const tilt = ramp(f, 60, 150, 0, -5);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, x: -160, z: 1.02, r: 0}, {f: 270, x: -220, z: 1.05, r: tilt}]}>
        <Forest seed={6} dark={0.15} />
        <Rain strength={rain} wind={0.25} />
        <CockpitFrame wipe rain={rain} gpsSlot={<GpsUnit x={540} y={490} s={0.62} mode={mode} instruction="Recalculating" />} />
        <Ethan x={540} y={1290} s={1.2} expr={f > 90 ? 'scared' : 'calm'} mouth={f > 120 && f < 150 ? 0.7 : 0} look={-0.5} rim="right" />
      </CameraRig>
      {/* The flash is at 18.2 s; this sequence starts at 15 s, so it is 3.2 s in. */}
      <Lightning times={[LIGHTNING[0] - 15]} />
    </Stage>
  );
};

/** 25-35 s: the road narrows, branches hit the glass; Ethan freezes at the navigator's voice. */
const Narrow: React.FC = () => {
  const f = useCurrentFrame();
  const sweep = f - 60;
  return (
    <Stage>
      <CameraRig keys={[{f: 0, x: -240, z: 1.06}, {f: 300, x: -320, z: 1.1}]} shakes={[{at: 60, dur: 40, amp: 10}]}>
        <Forest seed={7} dark={0.25} />
        <Rain strength={1.2} wind={0.35} />
        <CockpitFrame
          wipe
          rain={1.2}
          gpsSlot={
            <GpsUnit
              x={540}
              y={490}
              s={0.62}
              mode="route"
              instruction={f > 135 ? 'Please continue, Ethan' : 'Continue on route'}
            />
          }
        />
        <Ethan x={540} y={1290} s={1.2} expr={f > 150 ? 'frozen' : 'scared'} mouth={f > 210 && f < 240 ? 0.5 : 0} look={0} rim="right" />
        {sweep > 0 && sweep < 40 && (
          <g>
            {[0, 1, 2, 3].map((k) => (
              <path
                key={k}
                d={`M ${1180 - sweep * 40 + k * 130} ${260 + k * 170} Q ${980 - sweep * 40 + k * 130} ${300 + k * 170} ${820 - sweep * 42 + k * 130} ${220 + k * 180}`}
                stroke="#14261A"
                strokeWidth={22 - k * 3}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>
        )}
      </CameraRig>
    </Stage>
  );
};

/** 35-48 s: dusk, heavy rain. Headlights find the abandoned jeep: the same model, covered in vines. */
const Abandoned: React.FC = () => {
  const f = useCurrentFrame();
  const push = ramp(f, 0, 390, 1.0, 1.12);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 390, z: push}]} shakes={[{at: 200, dur: 40, amp: 4}]}>
        <Forest seed={8} dark={0.5} />
        <JeepSide x={560} y={1400} s={1.35} overgrown lights wet />
        <g opacity={0.85}>
          <rect x={690} y={1270} width={130} height={36} rx={4} fill="#E9C94B" stroke="#2A2A22" strokeWidth={2} />
          <text x={755} y={1296} textAnchor="middle" fontFamily="monospace" fontSize={26} fontWeight={800} fill="#16140E">BRN 2741</text>
        </g>
        <Ethan x={260} y={1500} s={0.9} expr="scared" look={1} rim="left" mouth={0} />
        <Rain strength={1.4} wind={0.3} />
      </CameraRig>
      {/* The flash is at 47.6 s; this sequence starts at 35 s, so it is 12.6 s in. */}
      <Lightning times={[LIGHTNING[1] - 35]} />
    </Stage>
  );
};

/** 48-58 s: Ethan's flashlight into the cabin; the old navigator is still on, then wakes up for him. */
const FlashlightCabin: React.FC = () => {
  const f = useCurrentFrame();
  const mode = f < 120 ? 'nosignal' : 'welcome';
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 300, z: 1.1, y: -40}]}>
        <Forest seed={9} dark={0.6} />
        <JeepSide x={560} y={1450} s={1.35} overgrown lights={false} wet />
        <GpsUnit x={540} y={1000} s={0.9} mode={mode} />
        <Beam x0={372} y0={1400} x1={540} y1={1060} w0={10} w1={130} opacity={0.42} />
        <Ethan x={300} y={1500} s={0.9} expr="scared" look={1} rim="right" rec />
        <Rain strength={1.4} wind={0.3} />
      </CameraRig>
    </Stage>
  );
};

/** A man standing in the rain, feet at 0,0 and about 300 units tall (the head is a separate circle). */
const FIGURE_BODY =
  'M -9 -252 L 9 -252 L 10 -238 L 30 -232 Q 40 -200 36 -150 L 30 -100 L 26 0 L 6 0 L 2 -92 L -2 -92 L -6 0 L -26 0 L -30 -100 L -36 -150 Q -40 -200 -30 -232 L -10 -238 Z';

/** 58-60 s: a figure stands in the rain far behind Ethan. The rain cuts out at 59.0 s, then half a second of black. */
const Cliffhanger: React.FC = () => {
  const f = useCurrentFrame();
  const rainStop = f >= 30;
  const black = f >= 45;
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.05}, {f: 120, z: 1.1}]}>
        <Forest seed={10} dark={0.45} />
        <g transform="translate(800 1380) scale(1.2)" fill="#050A07" stroke="#6E8778" strokeWidth={1.4}>
          <circle cx={0} cy={-273} r={21} />
          <path d={FIGURE_BODY} />
        </g>
        <Ethan x={480} y={1500} s={0.92} expr="frozen" look={0} rim="right" />
        {!rainStop && <Rain strength={1.4} wind={0.3} />}
      </CameraRig>
      {black && <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#000" />}
    </Stage>
  );
};

export const Part1: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(3)}>
      <Hook />
    </Sequence>
    <Sequence from={sec(3)} durationInFrames={sec(3)}>
      <Chapter />
    </Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(9)}>
      <DayDrive />
    </Sequence>
    <Sequence from={sec(15)} durationInFrames={sec(10)}>
      <SignalLost />
    </Sequence>
    <Sequence from={sec(25)} durationInFrames={sec(10)}>
      <Narrow />
    </Sequence>
    <Sequence from={sec(35)} durationInFrames={sec(13)}>
      <Abandoned />
    </Sequence>
    <Sequence from={sec(48)} durationInFrames={sec(10)}>
      <FlashlightCabin />
    </Sequence>
    <Sequence from={sec(58)} durationInFrames={sec(2)}>
      <Cliffhanger />
    </Sequence>
    <Subtitles cards={SUBTITLES} />
  </AbsoluteFill>
);

export const PART1_FRAMES = PART_FRAMES;
