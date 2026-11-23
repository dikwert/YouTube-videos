import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CamKey, CameraRig, Layer, Shake} from '../scene/Camera';
import {Birds, Clouds, GroundBand, Stage} from '../scene/Environment';
import {JungleStack} from '../scene/Jungle';
import {Gps, GpsProps} from '../characters/Gps';
import {Mason, MasonProps} from '../characters/Mason';
import {Palette} from '../lib/theme';
import {hash} from '../lib/math';

/** GPS settings chosen by the scene; position is set by the layout. */
export type GpsParams = Omit<GpsProps, 'x' | 'y'>;

export type CockpitProps = {
  p: Palette;
  keys: CamKey[];
  shakes?: Shake[];
  mason?: Partial<MasonProps>;
  gps: GpsParams;
  /** Frame (local) at which a flock of birds lifts out of the canopy. */
  birds?: number;
  /** Frame (local) at which branches sweep across the windscreen. */
  branches?: number;
  /** Dash rattle amount in px. */
  rattle?: number;
  seed?: number;
};

/**
 * Interior of the jeep: windscreen frame, dashboard, wheel, GPS mounted on the dash, and Mason at the wheel.
 * The jungle outside is a full parallax stack behind the glass.
 */
export const Cockpit: React.FC<CockpitProps> = ({p, keys, shakes = [], mason = {}, gps, birds, branches, rattle = 0, seed = 11}) => {
  const f = useCurrentFrame();
  const shake = rattle ? (hash(f * 1.9) - 0.5) * 2 * rattle : 0;
  const sweep = branches !== undefined ? f - branches : -1;
  return (
    <Stage p={p}>
      <CameraRig keys={keys} shakes={shakes}>
        <Clouds depth={0.12} y={300} opacity={0.5} />
        <JungleStack p={p} seed={seed} understory={false} />
        {birds !== undefined && <Birds start={birds} x={520} y={700} />}

        {/* Mason at the wheel (fixed to the interior) */}
        <Mason x={540} y={1292} s={1.22} expr="neutral" {...mason} />

        {/* branches sweeping across the glass */}
        {sweep >= 0 && sweep < 40 && (
          <g>
            {[0, 1, 2, 3].map((k) => (
              <path
                key={k}
                d={`M ${1200 - sweep * 38 + k * 110} ${230 + k * 180} Q ${1000 - sweep * 38 + k * 110} ${260 + k * 180} ${880 - sweep * 40 + k * 110} ${200 + k * 190}`}
                stroke="#1b3a22"
                strokeWidth={18 - k * 2}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>
        )}

        {/* interior: windscreen frame, dash, wheel, GPS (rattles with the road) */}
        <g transform={`translate(${shake} ${shake * 0.6})`}>
          <path d="M -10 -10 L 1090 -10 L 1090 1190 L -10 1190 Z" fill="none" stroke="#161c19" strokeWidth={120} />
          <path d="M -40 1170 Q 540 1120 1120 1170 L 1120 1980 L -40 1980 Z" fill="#2b312e" />
          <path d="M -40 1172 Q 540 1122 1120 1172" stroke="#56635b" strokeWidth={6} fill="none" />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={560 + k * 46} y={1206} width={28} height={10} rx={4} fill="#1a1f1c" />
          ))}
          <rect x={60} y={1290} width={70} height={28} rx={8} fill="#1d2320" />
          <ellipse cx={300} cy={1420} rx={190} ry={170} fill="none" stroke="#141614" strokeWidth={40} />
          <circle cx={300} cy={1420} r={46} fill="#1e221f" />
          <line x1={300} y1={1420} x2={120} y2={1420} stroke="#141614" strokeWidth={18} />
          <line x1={300} y1={1420} x2={480} y2={1420} stroke="#141614" strokeWidth={18} />
          <Gps x={770} y={1292} s={0.52} {...gps} />
        </g>
      </CameraRig>
    </Stage>
  );
};

/** Close-up of the GPS on a jungle backdrop. */
export const GpsCloseup: React.FC<{p: Palette; keys: CamKey[]; gps: GpsParams; shakes?: Shake[]; seed?: number}> = ({
  p,
  keys,
  gps,
  shakes = [],
  seed = 21,
}) => (
  <Stage p={p}>
    <CameraRig keys={keys} shakes={shakes}>
      <Clouds depth={0.15} y={260} opacity={0.4} />
      <JungleStack p={p} seed={seed} understory={false} />
      <Gps x={540} y={720} s={1.2} {...gps} />
    </CameraRig>
  </Stage>
);

/** Dirt track along the bottom of a side-on scene. */
export const TrackGround: React.FC<{p: Palette; y?: number; depth?: number}> = ({p, y = 1480, depth = 1}) => (
  <GroundBand y={y} color={p.road} stoneColor={p.ground} depth={depth} seed={41} />
);

/** Full-frame black, for cuts and fades (use inside a scene's SVG). */
export const Black: React.FC<{opacity: number}> = ({opacity}) => (
  <rect x={-500} y={-500} width={2080} height={2920} fill="#000" opacity={opacity} />
);

/** Analogue static: random bars that flicker. Used for transitions and the recorder glitch. */
export const StaticNoise: React.FC<{opacity: number; seed?: number}> = ({opacity, seed = 1}) => {
  const f = useCurrentFrame();
  if (opacity <= 0.001) return null;
  return (
    <g opacity={opacity}>
      {Array.from({length: 110}, (_, i) => (
        <rect
          key={i}
          x={-40 + hash(f * 1.3 + i + seed * 7) * 1080}
          y={hash(f * 0.7 + i * 2 + seed) * 1920}
          width={20 + hash(i + seed) * 300}
          height={3 + hash(i * 3 + seed) * 14}
          fill={i % 3 ? '#e8ffe8' : '#000'}
          opacity={0.8}
        />
      ))}
    </g>
  );
};
