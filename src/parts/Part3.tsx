import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {PALETTE, PART_FRAMES, TOMORROW_LABEL, sec} from '../lib/theme';
import {hash, ramp} from '../lib/math';
import {CameraRig} from '../scene/Camera';
import {Stage} from '../scene/Environment';
import {Corridor} from '../characters/Temple';
import {Expr, Mason} from '../characters/Mason';
import {Beam, CamUI, Flashlight} from '../characters/Props';
import {Black, StaticNoise} from './shared';
import {Captions} from '../ui/Captions';
import {PartEnd, PartTitle} from '../ui/Cards';
import {Ambience, MusicBed, Sfx, VoiceOver} from '../ui/AudioMix';
import {DIALOGUE} from '../script/model';
import {MUSIC_DIPS, SFX} from '../script/cues';

const P = PALETTE.dusk3;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The recording itself, drawn in a 1080x1920 picture: a dark temple corridor with Future Mason in front,
 * VHS grain and scanlines, and the recorder's on-screen display.
 */
const Footage: React.FC<{expr: Expr; farOpen?: number; seconds: number; staticNoise?: number}> = ({
  expr,
  farOpen = 0,
  seconds,
  staticNoise = 0,
}) => {
  const f = useCurrentFrame();
  const jx = (hash(f * 2.2) - 0.5) * 7;
  const jy = (hash(f * 3.1 + 4) - 0.5) * 5;
  const tc = `00:00:${pad(Math.floor(seconds))}:${pad(Math.floor((seconds % 1) * 30))}`;
  return (
    <g transform={`translate(${jx} ${jy})`}>
      <rect x={-40} y={-40} width={1160} height={2000} fill="#070a08" />
      <Corridor opens={[0, 0, 0]} farOpen={farOpen} depthFaces={[0.5]} dim={0.7} />
      <Mason x={540} y={1520} s={1.25} future expr={expr} shiver={expr === 'scared' ? 2 : 0} look={0} blinkSeed={12} sweat />
      {Array.from({length: 64}, (_, i) => (
        <rect key={i} x={-40} y={i * 30} width={1160} height={3} fill="#000" opacity={0.12} />
      ))}
      <rect x={-40} y={(f * 17) % 1920} width={1160} height={10} fill="#ffffff" opacity={0.06} />
      {staticNoise > 0 && <StaticNoise opacity={staticNoise} seed={f} />}
      <CamUI timecode={tc} rec playing />
      <text x={96} y={1860} fontFamily="Inter, Arial, sans-serif" fontWeight={800} fontSize={34} fill="#ffffff" opacity={0.7}>
        {`${TOMORROW_LABEL.replace(',', '')} · 03:17`}
      </text>
    </g>
  );
};

/** 1. Mason presses play; the camera's screen grows until it fills the frame. */
const PressPlay: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 70, 0.26, 1);
  const tx = 540 - 540 * k;
  const ty = 960 - 960 * k;
  const bodyOpacity = 1 - ramp(f, 40, 80, 0, 1);
  const press = f >= 16 && f < 34 ? 1 - Math.sin(((f - 16) / 18) * Math.PI) * 0.12 : 1;
  return (
    <Stage p={P}>
      <CameraRig keys={[{f: 0, z: 1}]}>
        <g opacity={bodyOpacity}>
          <rect x={290} y={500} width={500} height={900} rx={70} fill="#1d2226" />
          <rect x={290} y={500} width={500} height={900} rx={70} fill="none" stroke="#3b434b" strokeWidth={6} />
          <rect x={360} y={610} width={360} height={560} rx={16} fill="#0a0c0d" />
          <circle cx={540} cy={1310} r={36} fill="#2c3238" transform={`translate(0 ${(1 - press) * 40}) scale(${press})`} />
          <polygon points="530,1292 530,1328 556,1310" fill="#dfe6ee" />
          <circle cx={690} cy={1260} r={16} fill="#ff2d2d" opacity={Math.floor(f / 10) % 2 ? 1 : 0.3} />
        </g>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <Footage expr="scared" seconds={f / 30} />
        </g>
      </CameraRig>
    </Stage>
  );
};

/** 2. The video plays: Future Mason, bearded and terrified, talking. */
const VideoTalk: React.FC = () => {
  const f = useCurrentFrame();
  const expr: Expr = f < 240 ? 'scared' : f < 420 ? 'frown' : 'scared';
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.0},
          {f: 480, z: 1.05},
        ]}
      >
        <Footage expr={expr} seconds={f / 30} />
      </CameraRig>
    </Stage>
  );
};

/** 3. The timestamp zooms in: TOMORROW's date. */
const Timestamp: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 40, 0.2, 1);
  return (
    <Stage p={P}>
      <CameraRig keys={[{f: 0, z: 1}]}>
        <Footage expr="scared" seconds={(480 + f) / 30} />
        <g transform={`translate(540 880) scale(${k})`} opacity={ramp(f, 0, 12, 0, 1)}>
          <rect x={-420} y={-150} width={840} height={300} rx={30} fill="rgba(0,0,0,0.6)" />
          <text x={0} y={-40} textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight={900} fontSize={60} fill="#ffe26b">
            TOMORROW
          </text>
          <text x={0} y={70} textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight={900} fontSize={100} fill="#ffffff">
            {TOMORROW_LABEL}
          </text>
        </g>
      </CameraRig>
    </Stage>
  );
};

/** 4. Behind Future Mason, the stone face's eyes open. Static, cut. */
const EyesInVideo: React.FC = () => {
  const f = useCurrentFrame();
  const open = ramp(f, 30, 60, 0, 1);
  const noise = f >= 150 ? ramp(f, 150, 166, 0.2, 1) : 0;
  return (
    <Stage p={P}>
      <CameraRig keys={[{f: 0, z: 1.04}, {f: 180, z: 1.1}]} shakes={[{at: 28, dur: 24, amp: 6}]}>
        <Footage expr="scared" farOpen={open} seconds={(600 + f) / 30} staticNoise={noise} />
      </CameraRig>
    </Stage>
  );
};

/** 5. Back to the real Mason in the dark corridor. Silence, flashlight shaking. */
const RealSilence: React.FC = () => {
  const f = useCurrentFrame();
  const hx = 636 + Math.sin(f * 0.7) * 4;
  const hy = 1381 + Math.cos(f * 0.9) * 3;
  const tx = 560 + Math.sin(f * 0.5) * 28;
  const ty = 760 + Math.cos(f * 0.6) * 22;
  return (
    <Stage p={P}>
      <CameraRig
        keys={[
          {f: 0, z: 1.02},
          {f: 390, z: 1.12},
        ]}
      >
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[0.5]} dim={0.6} />
        <Beam x0={hx} y0={hy} x1={tx} y1={ty} w0={10} w1={190} opacity={0.34} />
        <Mason x={540} y={1560} s={1.05} expr="scared" shiver={4} rec blinkSeed={60} armR={-30} sweat />
        <Flashlight x={hx} y={hy} angle={-70} flicker={0.4} />
        <Black opacity={0.5} />
      </CameraRig>
    </Stage>
  );
};

/** 6. From the dark corridor, Mason's own voice. He slowly turns toward it. Cut to black. */
const TurnToVoice: React.FC = () => {
  const f = useCurrentFrame();
  const x = ramp(f, 0, 150, 540, 430);
  const look = ramp(f, 0, 140, 0, -1);
  const tilt = ramp(f, 0, 150, 0, -14);
  const cut = ramp(f, 160, 180, 0, 1);
  return (
    <Stage p={P}>
      <CameraRig keys={[{f: 0, z: 1.02}, {f: 180, z: 1.1}]}>
        <Corridor opens={[0, 0, 0]} farOpen={0} depthFaces={[0.5]} dim={0.5} />
        <Mason x={x} y={1560} s={1.05} expr="scared" look={look} tilt={tilt} shiver={2} rec blinkSeed={5} sweat />
        <Black opacity={0.45 + cut * 0.55} />
      </CameraRig>
    </Stage>
  );
};

/** 7. The recorder stops: static and the STOP display. */
const RecorderStop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#050505'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <StaticNoise opacity={ramp(f, 0, 30, 0.1, 0.7)} seed={9} />
        <CamUI timecode="00:00:00:00" rec={false} playing={false} label="STOP" />
        <text x={540} y={960} textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight={900} fontSize={90} fill="#ffffff" opacity={Math.floor(f / 10) % 2 ? 1 : 0.4}>
          STOP
        </text>
      </svg>
    </AbsoluteFill>
  );
};

const L = DIALOGUE['3'];

export const Part3: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={sec(5)}>
      <PressPlay />
    </Sequence>
    <Sequence from={sec(5)} durationInFrames={sec(16)}>
      <VideoTalk />
    </Sequence>
    <Sequence from={sec(21)} durationInFrames={sec(5)}>
      <Timestamp />
    </Sequence>
    <Sequence from={sec(26)} durationInFrames={sec(6)}>
      <EyesInVideo />
    </Sequence>
    <Sequence from={sec(32)} durationInFrames={sec(13)}>
      <RealSilence />
    </Sequence>
    <Sequence from={sec(45)} durationInFrames={sec(7)}>
      <TurnToVoice />
    </Sequence>
    <Sequence from={sec(52)} durationInFrames={sec(5)}>
      <RecorderStop />
    </Sequence>
    <Sequence from={sec(57)} durationInFrames={sec(3)}>
      <AbsoluteFill style={{background: '#000'}} />
    </Sequence>
    <Captions script={L} />
    <Ambience dips={MUSIC_DIPS[3]} />
    <MusicBed dips={MUSIC_DIPS[3]} base={0.1} />
    <VoiceOver n={3} />
    <Sfx events={SFX[3]} />
    <PartTitle n={3} title="The Recording" />
    <PartEnd label="PART 4 →" total={PART_FRAMES} />
  </AbsoluteFill>
);
