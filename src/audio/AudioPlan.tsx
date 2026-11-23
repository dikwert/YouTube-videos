import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {sec} from '../lib/theme';
import type {AudioPlanData} from '../script/types';

/** Places every voice line, sound effect and bed on the timeline. Positions come from the generated plan. */
export const AudioPlan: React.FC<{plan: AudioPlanData}> = ({plan}) => (
  <>
    {plan.beds.map((b, i) => (
      <Audio key={`bed${i}`} src={staticFile(b.file)} volume={b.vol} loop={b.loop} />
    ))}
    {plan.sfx.map((x, i) => (
      <Sequence key={`sfx${i}`} from={sec(x.s)}>
        <Audio src={staticFile(x.file)} volume={x.vol} loop={x.loop} />
      </Sequence>
    ))}
    {plan.lines.map((l) => (
      <Sequence key={l.id} from={sec(l.s)}>
        <Audio src={staticFile(l.file)} />
      </Sequence>
    ))}
  </>
);
