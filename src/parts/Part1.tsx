import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../lib/camera';
import {H, PART_FRAMES, W, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {Forest} from '../forest/Forest';
import {Rain, Lightning} from '../rain/Rain';
import {Ethan} from '../ethan/Ethan';
import {Beam} from '../ui/Beam';
import {ChapterCard} from '../ui/Title';
import {Stage} from '../ui/Stage';
import {Subtitles} from '../ui/Subtitles';
import {CabinA, CabinB, CabinC} from '../car/Cabin';
import {Suv} from '../car/Suv';
import type {GpsMode} from '../car/Navigator';
import {CHAPTER_CARD, LIGHTNING} from '../script/part1';
import {AUDIO, SUBTITLES} from '../script/generated/part1';
import {AudioPlan} from '../audio/AudioPlan';

/** A cabin shot drawn over the world layer: transparent background, so the world shows through the glass. */
const CabinOverlay: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** 0-3 s HOOK: night, rain on the glass, the navigator glitches on the dash. */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const glitch = ramp(f, 36, 78, 0, 0.9);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 90, z: 1.06}]}>
        <Forest seed={3} dark={0.25} />
        <Rain strength={1.25} wind={0.3} />
      </CameraRig>
      <CabinC gps={{mode: 'route', instruction: '300 ft · Turn left', glitch}} rain={1.2} dim={0.3} />
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

/** 6-35 s: one continuous drive behind the glass. The forest does not restart between shots. */
const DrivingWorld: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + sec(6);
  const rain = ramp(g, sec(14), sec(24), 0.1, 1.2);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, x: 0, z: 1}, {f: sec(29), x: -360, z: 1.1}]} shakes={[{at: sec(21), dur: 40, amp: 10}]}>
        <Forest seed={5} dark={0.12} />
        <Rain strength={rain} wind={0.3} />
      </CameraRig>
    </Stage>
  );
};

/** 6-10 s: Ethan in profile, talking to the camera on the dash. */
const ShotB: React.FC = () => {
  const f = useCurrentFrame();
  const mouth = 0.5 + 0.5 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  return (
    <CabinOverlay>
      <CabinB rain={0.15} expr="joke" mouth={mouth} wheel={Math.sin(f * 0.05) * 6} />
    </CabinOverlay>
  );
};

/** 10-13 s: the navigator close-up, showing the route. */
const ShotC: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CabinOverlay>
      <CabinC gps={{mode: 'route', instruction: '2.1 mi · Keep left'}} rain={0.15} wheel={Math.sin(f * 0.06) * 5} />
    </CabinOverlay>
  );
};

/** 13-15 s: over the shoulder from the back seat. */
const ShotA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CabinOverlay>
      <CabinA
        rain={0.3}
        expr="joke"
        turn={Math.sin(f * 0.03) * 7}
        wheel={Math.sin(f * 0.07) * 6}
        gps={{mode: 'route', instruction: '2.1 mi · Keep left'}}
      />
    </CabinOverlay>
  );
};

/** 15-18 s: the signal drops; the navigator says "No signal". */
const ShotNoSignal: React.FC = () => {
  const f = useCurrentFrame();
  const rain = ramp(f, 0, 90, 0.3, 0.9);
  return (
    <CabinOverlay>
      <CabinC gps={{mode: 'nosignal'}} rain={rain} wheel={Math.sin(f * 0.1) * 8} />
    </CabinOverlay>
  );
};

/** 18-20 s: "Recalculating", and the lightning. The flash is at 18.2 s, 0.2 s into this shot. */
const ShotRecalc: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CabinOverlay>
      <CabinC gps={{mode: 'recalc'}} rain={0.9} wheel={Math.sin(f * 0.1) * 8} />
      <Lightning times={[LIGHTNING[0] - 18]} />
    </CabinOverlay>
  );
};

/** 20-25 s: over the shoulder; the navigator reroutes and Ethan asks where it is taking him. */
const ShotLostA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CabinOverlay>
      <CabinA rain={1.1} expr={f > 60 ? 'scared' : 'calm'} wheel={Math.sin(f * 0.09) * 10} gps={{mode: 'route', instruction: 'Reroute · 1.4 mi'}} />
    </CabinOverlay>
  );
};

/** 25-35 s: the narrow road. Branches hit the glass; the navigator says "Please continue, Ethan." Ethan freezes. */
const ShotNarrow: React.FC = () => {
  const f = useCurrentFrame();
  const sweep = f - 60;
  const gpsText = f < 135 ? 'Continue on route' : 'Please continue, Ethan';
  return (
    <CabinOverlay>
      <CabinA
        rain={1.2}
        expr={f > 150 ? 'frozen' : 'scared'}
        wheel={Math.sin(f * 0.08) * 4}
        gps={{mode: 'route', instruction: gpsText}}
      />
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
    </CabinOverlay>
  );
};

/** 35-48 s: dusk and heavy rain. Headlights find the abandoned jeep: the same model, covered in vines. */
const Abandoned: React.FC = () => {
  const f = useCurrentFrame();
  const push = ramp(f, 0, 390, 1.0, 1.1);
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 390, z: push}]} shakes={[{at: 200, dur: 40, amp: 4}]}>
        <Forest seed={8} dark={0.5} />
        <Suv x={560} y={1400} s={1.35} lights overgrown wet dirt={0.9} seed={11} />
        <g>
          <rect x={884} y={1222} width={96} height={30} rx={4} fill="#E9C94B" stroke="#2A2A22" strokeWidth={2} />
          <text x={932} y={1243} textAnchor="middle" fontFamily="monospace" fontSize={20} fontWeight={800} fill="#16140E">
            BRN 2741
          </text>
        </g>
        <Ethan x={260} y={1500} s={0.9} expr="scared" look={1} rim="left" mouth={0} />
        <Rain strength={1.4} wind={0.3} />
      </CameraRig>
      {/* The flash is at 47.6 s; this scene starts at 35 s, so it is 12.6 s in. */}
      <Lightning times={[LIGHTNING[1] - 35]} />
    </Stage>
  );
};

/** 48-58 s: inside the abandoned jeep, a flashlight beam. The old navigator is still on, then it wakes for him. */
const CabinNight: React.FC = () => {
  const f = useCurrentFrame();
  const mode: GpsMode = f < 120 ? 'nosignal' : 'welcome';
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 300, z: 1.08}]}>
        <Forest seed={9} dark={0.6} />
        <Rain strength={1.1} wind={0.3} />
      </CameraRig>
      <CabinC gps={{mode}} rain={0.9} wipers={false} dim={0.45} />
      <Beam x0={40} y0={1900} x1={520} y1={1000} w0={20} w1={200} opacity={0.4} />
    </Stage>
  );
};

/** 58-60 s: a figure stands in the rain far behind Ethan. The rain cuts out at 59.0 s, then half a second of black. */
const FIGURE_BODY =
  'M -9 -252 L 9 -252 L 10 -238 L 30 -232 Q 40 -200 36 -150 L 30 -100 L 26 0 L 6 0 L 2 -92 L -2 -92 L -6 0 L -26 0 L -30 -100 L -36 -150 Q -40 -200 -30 -232 L -10 -238 Z';

const Cliffhanger: React.FC = () => {
  const f = useCurrentFrame();
  const rainStop = f >= 30;
  const black = f >= 45;
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.05}, {f: 60, z: 1.1}]}>
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
    <Sequence from={sec(6)} durationInFrames={sec(29)}>
      <DrivingWorld />
    </Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(4)}>
      <ShotB />
    </Sequence>
    <Sequence from={sec(10)} durationInFrames={sec(3)}>
      <ShotC />
    </Sequence>
    <Sequence from={sec(13)} durationInFrames={sec(2)}>
      <ShotA />
    </Sequence>
    <Sequence from={sec(15)} durationInFrames={sec(3)}>
      <ShotNoSignal />
    </Sequence>
    <Sequence from={sec(18)} durationInFrames={sec(2)}>
      <ShotRecalc />
    </Sequence>
    <Sequence from={sec(20)} durationInFrames={sec(5)}>
      <ShotLostA />
    </Sequence>
    <Sequence from={sec(25)} durationInFrames={sec(10)}>
      <ShotNarrow />
    </Sequence>
    <Sequence from={sec(35)} durationInFrames={sec(13)}>
      <Abandoned />
    </Sequence>
    <Sequence from={sec(48)} durationInFrames={sec(10)}>
      <CabinNight />
    </Sequence>
    <Sequence from={sec(58)} durationInFrames={sec(2)}>
      <Cliffhanger />
    </Sequence>
    <AudioPlan plan={AUDIO} />
    <Subtitles cards={SUBTITLES} />
  </AbsoluteFill>
);

export const PART1_FRAMES = PART_FRAMES;
