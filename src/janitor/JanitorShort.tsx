import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Subtitles} from '../ui/Subtitles';
import {CARDS} from './timing.generated';
import {JanitorScene} from './JanitorScene';

/** White flash at the hook's cut (2.115 to 2.365 s, the end of the hook in the moved timeline). */
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = frame / fps;
  const a = interpolate(g, [2.115, 2.155, 2.365], [0, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#ffffff', opacity: a}} />;
};

/** 1080x1920 base; the final export renders at 1440x2560 (scale 4/3). */
export const JanitorShort: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <ThreeCanvas width={1080} height={1920} camera={{fov: 50, near: 0.05, far: 1000, position: [0, 1.2, 0]}}>
      <JanitorScene />
    </ThreeCanvas>
    <Flash />
    <Subtitles cards={CARDS} />
    <Audio src={staticFile('audio/janitor/mix.wav')} />
  </AbsoluteFill>
);
