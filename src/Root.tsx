import React from 'react';
import {Composition, Still} from 'remotion';
import {FPS, H, PART_FRAMES, W} from './lib/theme';
import {Part1} from './parts/Part1';
import {Part2} from './parts/Part2';
import {Part3} from './parts/Part3';
import {Part4} from './parts/Part4';
import {Part5} from './parts/Part5';
import {Cover1, Cover2, Cover3, Cover4, Cover5} from './thumbs/Covers';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Part1" component={Part1} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part2" component={Part2} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part3" component={Part3} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part4" component={Part4} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part5" component={Part5} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="Cover1" component={Cover1} width={W} height={H} />
    <Still id="Cover2" component={Cover2} width={W} height={H} />
    <Still id="Cover3" component={Cover3} width={W} height={H} />
    <Still id="Cover4" component={Cover4} width={W} height={H} />
    <Still id="Cover5" component={Cover5} width={W} height={H} />
  </>
);
