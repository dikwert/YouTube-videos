import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CAPTION_FONT} from '../lib/fonts';
import {JanitorScene} from './JanitorScene';

const TYPE = `${CAPTION_FONT}, Arial Black, sans-serif`;

/**
 * Cover (1080x1920): the hook frame (Gary floating with the mop in the capsule, Earth below the window),
 * the title large in the centre of the frame. Render with: node scripts/render-janitor.mjs cover <frame>
 */
export const JanitorCover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas width={1080} height={1920} camera={{fov: 50, near: 0.05, far: 1000, position: [0, 1.2, 0]}}>
      <JanitorScene />
    </ThreeCanvas>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)'}} />
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '60%',
        transform: 'translateY(-50%)',
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
        I WOKE UP
        <br />
        IN ORBIT
      </div>
    </div>
  </AbsoluteFill>
);
