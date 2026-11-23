import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {ASSETS} from '../assets.generated';
import {sec} from '../lib/theme';

/** Background music: the same track in every part, ~15% volume, dipping to near silence at scary moments. */
export const MusicBed: React.FC<{dips?: Array<[number, number]>; base?: number}> = ({dips = [], base = 0.15}) => {
  if (!ASSETS.music) return null;
  return (
    <Audio
      src={staticFile('music.mp3')}
      volume={(f: number) => {
        let v = base;
        for (const [a, b] of dips) {
          const s = sec(a);
          const e = sec(b);
          const dip = interpolate(f, [s - 9, s, e, e + 9], [base, 0.015, 0.015, base], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          v = Math.min(v, dip);
        }
        return v;
      }}
    />
  );
};

/** Voiceover for one part, only if public/voiceover<n>.mp3 existed when the asset list was generated. */
export const VoiceOver: React.FC<{n: number}> = ({n}) => {
  if (!ASSETS.voiceover[n]) return null;
  return <Audio src={staticFile(`voiceover${n}.mp3`)} />;
};

export type SfxEvent = {at: number; name: string; v?: number};

/** One-shot sound effects at part-relative seconds. Files live in public/sfx/ (generated when missing). */
export const Sfx: React.FC<{events: SfxEvent[]}> = ({events}) => (
  <>
    {events.map((e, i) => (
      <Sequence key={i} from={sec(e.at)} layout="none">
        <Audio src={staticFile(`sfx/${e.name}.wav`)} volume={e.v ?? 0.8} />
      </Sequence>
    ))}
  </>
);
