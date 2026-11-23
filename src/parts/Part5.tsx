import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../lib/camera';
import {H, W, sec} from '../lib/theme';
import {ramp} from '../lib/math';
import {Forest} from '../forest/Forest';
import {Rain} from '../rain/Rain';
import {Ethan} from '../ethan/Ethan';
import {Stage} from '../ui/Stage';
import {Subtitles} from '../ui/Subtitles';
import {AudioPlan} from '../audio/AudioPlan';
import {Suv} from '../car/Suv';
import {CabinA, CabinC} from '../car/Cabin';
import {CameraBody} from '../car/Props';
import {NAMES, WallDevice} from '../temple/Temple';
import {AUDIO, SUBTITLES} from '../script/generated/part5';

const COLS = [225, 435, 645, 855];
const ROWS = [600, 800, 1000, 1200, 1400];
/** Screen index -> the second (in the part) when Ethan breaks it. */
const BROKE_AT: Record<number, number> = {1: 6.2, 5: 6.4, 9: 8.6, 2: 8.8, 14: 11.0, 6: 11.2, 18: 13.2, 11: 13.4};

const Dark: React.FC = () => <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#040504" />;

/** A broken screen: a dark hole with cracks. */
const Hole: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-84} y={-58} width={168} height={116} rx={12} fill="#050605" stroke="#2A1A10" strokeWidth={4} />
    <path d="M -60 -40 L -10 0 L -30 30 M 0 -50 L 20 -10 L 60 -30 M -40 40 L 10 10 L 50 46" stroke="#9AA59E" strokeWidth={2} fill="none" opacity={0.6} />
  </g>
);

/** 0-2.5 s: the screens say ARRIVED. */
const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const flick = f % 12 < 2;
  return (
    <Stage>
      <Dark />
      <CameraRig keys={[{f: 0, z: 1.1}, {f: 75, z: 1.12}]}>
        {ROWS.map((y, r) =>
          COLS.map((x, c) => (
            <WallDevice key={r * 4 + c} x={x} y={y} name={flick ? '' : 'ARRIVED'} lit />
          )),
        )}
      </CameraRig>
    </Stage>
  );
};

/** 2.5-14 s: Ethan breaks the screens, one after another. */
const Smash: React.FC = () => {
  const f = useCurrentFrame();
  const g = f / 30 + 2.5;
  const raise = Math.floor(f / 45) % 2 === 1 ? -100 : 0;
  const hit = Object.values(BROKE_AT).some((t) => Math.abs(g - t) < 0.12);
  return (
    <Stage>
      <Dark />
      <CameraRig keys={[{f: 0, z: 1.05}, {f: 330, z: 1.12}]} shakes={[{at: 150, dur: 20, amp: 6}, {at: 200, dur: 20, amp: 5}]}>
        {ROWS.map((y, r) =>
          COLS.map((x, c) => {
            const i = r * 4 + c;
            const t = BROKE_AT[i];
            if (t !== undefined && g >= t) return <Hole key={i} x={x} y={y} />;
            return <WallDevice key={i} x={x} y={y} name={NAMES[i]} lit />;
          }),
        )}
      </CameraRig>
      <Ethan x={540} y={1620} s={1.1} expr="scared" armR={raise} look={0} rim="left" mouth={0} />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#FFFFFF" opacity={hit ? 0.22 : 0} />
    </Stage>
  );
};

/** 14-21 s: he runs under the rain; the jungle shifts past him. */
const Run: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <CameraRig keys={[{f: 0, x: 0, z: 1.05}, {f: 210, x: -600, z: 1.12}]} shakes={[{at: 0, dur: 210, amp: 14}]}>
        <Forest seed={17} dark={0.4} />
        <Rain strength={1.5} wind={0.4} />
      </CameraRig>
      <Ethan x={540} y={1520} s={0.95} walk={f * 0.55} expr="scared" look={1} rim="left" mouth={0} />
    </Stage>
  );
};

/** 21-27 s: his own jeep, the one that would not start. It starts now: lights on, wheels turning. */
const FindJeep: React.FC = () => {
  const f = useCurrentFrame();
  const on = f >= 72;
  const roll = on ? (f - 72) * 4 : 0;
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.0}, {f: 180, z: 1.05}]}>
        <Forest seed={21} dark={0.4} />
        <Suv x={760} y={1400} s={1.25} dirt={0.6} seed={21} lights={on} wheelRot={roll} />
        <Ethan x={ramp(f, 0, 60, 200, 400)} y={1500} s={0.9} walk={f * 0.3} expr="scared" look={1} />
        <Rain strength={1.4} wind={0.3} />
      </CameraRig>
    </Stage>
  );
};

/** 27-44 s: the drive out. The navigator reroutes ("Recalculating"), then the road; dawn comes and the rain stops. */
const Drive: React.FC = () => {
  const f = useCurrentFrame();
  const gps: 'recalc' | 'route' = f < 60 ? 'recalc' : 'route';
  return (
    <Stage>
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 510, z: 1.08}]} shakes={[{at: 0, dur: 510, amp: 1.5}]}>
        <Forest seed={22} dark={ramp(f, 0, 510, 0.5, 0.15)} />
        <Rain strength={ramp(f, 270, 400, 1.2, 0)} wind={0.3} />
      </CameraRig>
      <CabinA
        rain={ramp(f, 270, 400, 1.2, 0.1)}
        expr={f > 330 ? 'calm' : 'scared'}
        turn={Math.sin(f * 0.02) * 4}
        wheel={Math.sin(f * 0.06) * 7}
        gps={{mode: gps}}
      />
    </Stage>
  );
};

/** 44-54 s: the rear-view mirror. On the back seat, the old camera is recording: today's date, live. */
const Mirror: React.FC = () => {
  const f = useCurrentFrame();
  const rec = f % 30 < 18;
  return (
    <Stage>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#0A0F0C" />
      <rect x={540} y={330} width={0} height={0} />
      <rect x={532} y={300} width={16} height={170} fill="#22281F" />
      <rect x={140} y={460} width={800} height={380} rx={36} fill="#2A3028" stroke="#0B0D0B" strokeWidth={10} />
      <rect x={170} y={490} width={740} height={320} rx={22} fill="#0F1A14" />
      <path d="M 260 760 Q 300 600 540 580 Q 780 600 820 760 L 840 790 L 240 790 Z" fill="#14201A" />
      <CameraBody x={540} y={700} s={0.7} />
      <text x={200} y={530} fontFamily="monospace" fontSize={30} fontWeight={700} fill="#F4F4EE">
        NOV 23 2026  06:14
      </text>
      {rec && <circle cx={880} cy={525} r={9} fill="#E23B2B" />}
      {rec && (
        <text x={820} y={534} fontFamily="monospace" fontSize={24} fill="#F4F4EE">
          REC
        </text>
      )}
    </Stage>
  );
};

/** 54-60 s: the navigator says goodbye. Then the screen goes black. */
const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const black = ramp(f, sec(4.6), sec(5.4), 0, 1);
  return (
    <Stage>
      <Dark />
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 180, z: 1.05}]}>
        <Forest seed={23} dark={0.2} />
        <Rain strength={0.1} wind={0.2} />
      </CameraRig>
      <CabinC gps={{mode: 'route', instruction: 'See you soon, Ethan'}} rain={0.2} wipers={false} />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#000" opacity={black} />
    </Stage>
  );
};

export const Part5: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(2.5)}>
      <Recap />
    </Sequence>
    <Sequence from={sec(2.5)} durationInFrames={sec(11.5)}>
      <Smash />
    </Sequence>
    <Sequence from={sec(14)} durationInFrames={sec(7)}>
      <Run />
    </Sequence>
    <Sequence from={sec(21)} durationInFrames={sec(6)}>
      <FindJeep />
    </Sequence>
    <Sequence from={sec(27)} durationInFrames={sec(17)}>
      <Drive />
    </Sequence>
    <Sequence from={sec(44)} durationInFrames={sec(10)}>
      <Mirror />
    </Sequence>
    <Sequence from={sec(54)} durationInFrames={sec(6)}>
      <Finale />
    </Sequence>
    <AudioPlan plan={AUDIO} />
    <Subtitles cards={SUBTITLES} />
  </AbsoluteFill>
);
