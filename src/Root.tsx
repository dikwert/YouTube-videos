import React from 'react';
import {Composition, Still} from 'remotion';
import './lib/fonts';
import {FPS, H, PART_FRAMES, W} from './lib/theme';
import {Part1} from './parts/Part1';
import {Cover1} from './thumbs/Cover1';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Part1" component={Part1} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="Cover1" component={Cover1} width={W} height={H} />
  </>
);
