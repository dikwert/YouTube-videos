import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import {hash, keyed} from '../lib/math';
import {H, W} from '../lib/theme';

export type CamKey = {f: number; x?: number; y?: number; z?: number; r?: number};
export type Shake = {at: number; dur: number; amp: number};

const CamCtx = createContext<{x: number; y: number}>({x: 0, y: 0});

/**
 * Camera rig for one scene. The outer group applies zoom, rotation and shake
 * around the frame centre. Pan is applied per <Layer> so each depth moves at
 * its own parallax speed.
 */
export const CameraRig: React.FC<{
  keys: CamKey[];
  shakes?: Shake[];
  children: React.ReactNode;
}> = ({keys, shakes = [], children}) => {
  const f = useCurrentFrame();
  const track = (k: 'x' | 'y' | 'z' | 'r', def: number) =>
    keyed(
      f,
      keys.map((kk) => [kk.f, kk[k] ?? def] as const),
    );

  let sx = 0;
  let sy = 0;
  for (const s of shakes) {
    const t = (f - s.at) / s.dur;
    if (t >= 0 && t <= 1) {
      const env = (1 - t) * (1 - t);
      sx += (hash(f * 3.1 + s.at) * 2 - 1) * s.amp * env;
      sy += (hash(f * 5.7 + s.at + 9) * 2 - 1) * s.amp * env;
    }
  }

  const x = track('x', 0);
  const y = track('y', 0);
  const z = track('z', 1);
  const r = track('r', 0);
  const cx = W / 2;
  const cy = H / 2;

  return (
    <CamCtx.Provider value={{x, y}}>
      <g transform={`translate(${cx + sx} ${cy + sy}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>
        {children}
      </g>
    </CamCtx.Provider>
  );
};

/** A group that moves with the camera at `depth` (1 = subject plane, <1 = far background, >1 = foreground). */
export const Layer: React.FC<{depth?: number; children?: React.ReactNode}> = ({depth = 1, children}) => {
  const {x, y} = useContext(CamCtx);
  return <g transform={`translate(${-x * depth} ${-y * depth})`}>{children}</g>;
};
