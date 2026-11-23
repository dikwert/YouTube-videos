import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CAPTION_FONT} from '../lib/fonts';
import {PilotScene} from './PilotScene';

const TYPE = `${CAPTION_FONT}, Arial Black, sans-serif`;

/**
 * Cover (1080x1920): the short's own scene at the chosen frame (the hook: Kevin shocked at the yoke),
 * the title large in the centre of the frame. No subtitles, no flash, no audio.
 * Render with: node scripts/render-pilot.mjs cover <frame>
 */
export const PilotCover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas width={1080} height={1920} camera={{fov: 50, near: 0.05, far: 1000, position: [0, 1.2, 0]}}>
      <PilotScene />
    </ThreeCanvas>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 52%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)'}} />
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: TYPE,
        fontWeight: 800,
        textTransform: 'uppercase',
      }}
    >
      <div
        style={{
          color: '#FFD60A',
          fontSize: 124,
          lineHeight: 1.02,
          WebkitTextStroke: '16px #000',
          paintOrder: 'stroke fill',
          textShadow: '0 12px 34px rgba(0,0,0,0.8)',
        }}
      >
        THE PILOT
        <br />
        WENT TO THE
        <br />
        BATHROOM
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
