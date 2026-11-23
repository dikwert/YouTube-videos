import React from 'react';
import {Composition, Still} from 'remotion';
import './lib/fonts';
import {FPS, H, PART_FRAMES, W} from './lib/theme';
import {Part1} from './parts/Part1';
import {Part2} from './parts/Part2';
import {Part3} from './parts/Part3';
import {Part4} from './parts/Part4';
import {Part5} from './parts/Part5';
import {CoverPart} from './thumbs/CoverPart';
import {PilotShort} from './pilot/PilotShort';

const Cover1: React.FC = () => <CoverPart n={1} name="ETHAN NEVER TOLD IT" seed={3} />;
const Cover2: React.FC = () => <CoverPart n={2} name="THE OTHER JEEP" seed={8} />;
const Cover3: React.FC = () => <CoverPart n={3} name="THE TEMPLE" seed={16} />;
const Cover4: React.FC = () => <CoverPart n={4} name="THE DRIVER" seed={9} />;
const Cover5: React.FC = () => <CoverPart n={5} name="RECALCULATING" seed={23} />;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Part1" component={Part1} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part2" component={Part2} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part3" component={Part3} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part4" component={Part4} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Part5" component={Part5} durationInFrames={PART_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="PilotShort" component={PilotShort} durationInFrames={2028} fps={FPS} width={W} height={H} />
    <Still id="Cover1" component={Cover1} width={W} height={H} />
    <Still id="Cover2" component={Cover2} width={W} height={H} />
    <Still id="Cover3" component={Cover3} width={W} height={H} />
    <Still id="Cover4" component={Cover4} width={W} height={H} />
    <Still id="Cover5" component={Cover5} width={W} height={H} />
  </>
);
