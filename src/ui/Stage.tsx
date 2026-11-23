import React from 'react';
import {AbsoluteFill} from 'remotion';
import {H, W} from '../lib/theme';

/** Full-frame background: dark wet-green gradient, the SVG world, and a vignette. */
export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #163024 0%, #0E1F16 55%, #050C08 100%)'}}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
      {children}
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.65) 100%)'}} />
  </AbsoluteFill>
);
