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
import {PilotCover} from './pilot/PilotCover';
import {JanitorShort} from './janitor/JanitorShort';
import {JanitorCover} from './janitor/JanitorCover';
import {FrozenPart} from './frozen/FrozenPart';
import frozen1 from './frozen/data/part1_full.json';
import frozen2 from './frozen/data/part2_full.json';
import frozen3 from './frozen/data/part3_full.json';
import frozen4 from './frozen/data/part4_full.json';
import frozen5 from './frozen/data/part5_full.json';
import {HaroldShort} from './harold/HaroldShort';
import {HaroldCover} from './harold/Cover';
import harold from './harold/data/timeline.json';
import {LateShort} from './videos/late/LateShort';
import {LateCover} from './videos/late/LateCover';
import late from './videos/late/data/timeline.json';

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
    <Composition id="PilotCover" component={PilotCover} durationInFrames={2028} fps={FPS} width={W} height={H} />
    <Composition id="JanitorShort" component={JanitorShort} durationInFrames={1911} fps={FPS} width={W} height={H} />
    <Composition id="JanitorCover" component={JanitorCover} durationInFrames={2010} fps={FPS} width={W} height={H} />
    <Composition id="FrozenPart1" component={FrozenPart} durationInFrames={Math.ceil(frozen1.duration * 30)} fps={FPS} width={W} height={H} defaultProps={{data: frozen1 as any}} />
    <Composition id="FrozenPart2" component={FrozenPart} durationInFrames={Math.ceil(frozen2.duration * 30)} fps={FPS} width={W} height={H} defaultProps={{data: frozen2 as any}} />
    <Composition id="FrozenPart3" component={FrozenPart} durationInFrames={Math.ceil(frozen3.duration * 30)} fps={FPS} width={W} height={H} defaultProps={{data: frozen3 as any}} />
    <Composition id="FrozenPart4" component={FrozenPart} durationInFrames={Math.ceil(frozen4.duration * 30)} fps={FPS} width={W} height={H} defaultProps={{data: frozen4 as any}} />
    <Composition id="FrozenPart5" component={FrozenPart} durationInFrames={Math.ceil(frozen5.duration * 30)} fps={FPS} width={W} height={H} defaultProps={{data: frozen5 as any}} />
    <Composition id="HaroldShort" component={HaroldShort} durationInFrames={Math.ceil(harold.duration * 30)} fps={30} width={1080} height={1920} />
    <Still id="HaroldCover" component={HaroldCover} width={1080} height={1920} />
    <Composition id="LateShort" component={LateShort} durationInFrames={Math.ceil(late.duration * 30)} fps={30} width={1080} height={1920} />
    <Still id="LateCover" component={LateCover} width={1080} height={1920} />
  </>
);
