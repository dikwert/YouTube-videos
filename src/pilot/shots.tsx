import React from 'react';
import {WORDS} from './timing.generated';
import {Airliner, Box, CabinSet, Clouds, CockpitDoor, CockpitSet, HighwaySet, Person, ROW_Z, SkyDome} from './world';

export type Vec3 = [number, number, number];
export type Cam = {p: Vec3; l: Vec3; f: number; r?: number};
export type Ctx = {g: number; t: number; dur: number; mouth: number; frame: number};
export type ShotDef = {id: string; a: number; b: number; cam0: Cam; cam1: Cam; creep?: number; view: (c: Ctx) => React.ReactNode};

/** Mouth openness for the narrator (one voice): open while a word is spoken. */
export function mouthAt(g: number): number {
  for (const w of WORDS) {
    if (g >= w.s && g <= w.e) return 0.45 + 0.4 * Math.abs(Math.sin(g * 27));
  }
  return 0;
}

const R = ROW_Z;
/** The camera's own smootherstep, so a prop that moves with the camera keeps pace with it. */
const ease = (s: number) => s * s * s * (s * (s * 6 - 15) + 10);

/**
 * 27 shots. Each cut lands on the first word of the phrase it opens (words.json), so the picture
 * never runs ahead of the narration. Each close-up puts the chin above the subtitle band
 * (the band sits at 68% of the frame height).
 * Characters: kevin, rick, dave, gloria, edna, tommy, cashier, pax.
 */
export const SHOTS: ShotDef[] = [
  // 1. hook: Kevin in the captain seat, headphones on, eyes like saucers, hands on the yoke
  {
    id: 'hook', a: 0, b: 2.0,
    cam0: {p: [0, 1.36, 1.7], l: [0, 1.02, -0.4], f: 44}, cam1: {p: [0, 1.36, 1.58], l: [0, 1.02, -0.4], f: 44}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CockpitSet kevin={{pose: 'sit', expr: 'shock', mouth}} dave="slump" />
      </>
    ),
  },
  // 2. cockpit wide: "Flight 312." Both pilots in frame
  {
    id: 'cockpit-wide', a: 2.0, b: 4.55,
    cam0: {p: [-0.4, 1.2, 2.5], l: [-0.6, 1.2, -1.0], f: 60}, cam1: {p: [-0.3, 1.2, 2.3], l: [-0.6, 1.2, -1.0], f: 60}, creep: 0.04,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CockpitSet kevin={{pose: 'sit', expr: 'neutral', mouth}} dave="slump" />
      </>
    ),
  },
  // 3. sky: the airliner, "Thirty-four thousand feet."
  {
    id: 'sky-altitude', a: 4.55, b: 6.05,
    cam0: {p: [0, 26, 8], l: [0, 30, -30], f: 45}, cam1: {p: [0.3, 26.5, 7], l: [0, 30, -30], f: 45}, creep: 0.1,
    view: () => (
      <>
        <SkyDome />
        <Clouds seed={3} n={14} span={60} y={[18, 50]} />
        <Airliner p={[0, 30, -30]} s={1.0} ry={0.9} />
      </>
    ),
  },
  // 4. cabin: Kevin in the middle seat
  {
    id: 'kevin-seat', a: 6.05, b: 7.9,
    cam0: {p: [-1.5, 1.2, -0.9], l: [-1.5, 0.85, -3.2], f: 42}, cam1: {p: [-1.5, 1.2, -0.8], l: [-1.5, 0.85, -3.2], f: 42}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet />
        <Person st={{kind: 'kevin', pose: 'sit', expr: 'neutral', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.35} />
        <Box p={[-0.9, 0.7, R(0) + 0.2]} s={[0.2, 0.3, 0.12]} c="#f2c230" />
      </>
    ),
  },
  // 5. the cockpit meals: "Fun fact: many airlines make pilots eat different meals."
  {
    id: 'trays', a: 7.9, b: 11.1,
    cam0: {p: [-2.6, 1.5, 3.6], l: [-0.6, 1.0, -0.4], f: 50}, cam1: {p: [-2.4, 1.5, 3.4], l: [-0.6, 1.0, -0.4], f: 50}, creep: 0.05,
    view: () => (
      <>
        <SkyDome />
        <CockpitSet rick={{pose: 'sit', expr: 'bored', mouth: 0}} dave="eat" trays={{fish: true, pasta: true}} />
      </>
    ),
  },
  // 6. both pilots, each with a different meal: "So food poisoning is less likely to get both."
  {
    id: 'two-shot', a: 11.1, b: 13.6,
    cam0: {p: [0.0, 1.3, 4.2], l: [-0.6, 1.18, -0.4], f: 50}, cam1: {p: [0.05, 1.3, 4.15], l: [-0.6, 1.18, -0.4], f: 50}, creep: 0.05,
    view: () => (
      <>
        <SkyDome />
        <CockpitSet rick={{pose: 'sit', expr: 'neutral', mouth: 0}} dave="eat" trays={{fish: true, pasta: true}} />
      </>
    ),
  },
  // 7. close-up of the fish: "Our co-pilot ate the fish anyway."
  {
    id: 'fish', a: 13.6, b: 15.45,
    cam0: {p: [-0.3, 1.25, 0.9], l: [-1.15, 1.03, -0.4], f: 42}, cam1: {p: [-0.25, 1.25, 0.8], l: [-1.15, 1.03, -0.4], f: 42}, creep: 0.08,
    view: () => (
      <>
        <SkyDome />
        <CockpitSet dave="eat" trays={{fish: true}} />
      </>
    ),
  },
  // 8. the cockpit: Dave passes out on the controls, the captain beside him
  {
    id: 'dave-out', a: 15.45, b: 18.0,
    cam0: {p: [-0.6, 1.25, 4.4], l: [-0.6, 1.15, -0.4], f: 52}, cam1: {p: [-0.6, 1.25, 4.3], l: [-0.6, 1.15, -0.4], f: 52}, creep: 0.05,
    view: () => (
      <>
        <SkyDome />
        <CockpitSet rick={{pose: 'sit', expr: 'shock', mouth: 0}} dave="slump" />
      </>
    ),
  },
  // 9. the captain runs to the bathroom; the lock jams
  {
    id: 'run', a: 18.0, b: 21.25,
    cam0: {p: [0, 1.35, 0.2], l: [0, 1.0, -6], f: 50}, cam1: {p: [0, 1.35, -3], l: [0, 1.0, -9], f: 50}, creep: 0,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      const z = -8 + (-19.6 + 8) * k;
      return (
        <>
          <SkyDome />
          <CabinSet />
          <Person st={{kind: 'rick', pose: 'run', expr: 'panic', variant: 0}} feet={[0, 0, z]} height={1.8} />
        </>
      );
    },
  },
  // 10. Gloria asks the question; her pointing hand rises above the seat backs
  {
    id: 'gloria', a: 21.25, b: 25.4,
    cam0: {p: [0, 1.4, -2.3], l: [0, 1.0, -6.4], f: 45}, cam1: {p: [0, 1.4, -2.6], l: [0, 1.0, -6.4], f: 45}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet />
        <Person st={{kind: 'gloria', pose: 'point', expr: 'neutral', mouth, variant: 0}} feet={[0, 0, -6.4]} height={1.8} />
      </>
    ),
  },
  // 11. Kevin raises his hand
  {
    id: 'hand', a: 25.4, b: 26.2,
    cam0: {p: [-1.5, 1.35, -0.9], l: [-1.5, 0.92, -3.0], f: 44}, cam1: {p: [-1.5, 1.3, -0.85], l: [-1.5, 0.92, -3.0], f: 44},
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'kevin', pose: 'raise', expr: 'proud', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.45} />
      </>
    ),
  },
  // 12. Kevin shrugs: "I'd played a flight simulator. Twice."
  {
    id: 'shrug', a: 26.2, b: 28.75,
    cam0: {p: [-1.5, 1.35, 0.2], l: [-1.5, 0.95, -3.0], f: 42}, cam1: {p: [-1.5, 1.35, 0.25], l: [-1.5, 0.95, -3.0], f: 42}, creep: 0.05,
    view: ({mouth, t}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'kevin', pose: 'shrug', expr: t > 1.6 ? 'smug' : 'neutral', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.45} />
      </>
    ),
  },
  // 13. the cockpit door: "Since 2003, cockpit doors must resist bullets."
  {
    id: 'cockpit-door', a: 28.75, b: 31.5,
    cam0: {p: [0, 1.4, 3.6], l: [0, 1.2, -1.4], f: 46}, cam1: {p: [0.05, 1.4, 3.5], l: [0, 1.2, -1.4], f: 46}, creep: 0.07,
    view: () => (
      <>
        <SkyDome />
        <CockpitDoor />
      </>
    ),
  },
  // 14. the bathroom door: "So the captain shouted instructions through the bathroom door."
  {
    id: 'bathroom-door', a: 31.5, b: 34.1,
    cam0: {p: [0, 1.45, -17.8], l: [0, 1.13, -21.2], f: 38}, cam1: {p: [0, 1.45, -18.1], l: [0, 1.13, -21.2], f: 38}, creep: 0.06,
    view: () => (
      <>
        <SkyDome />
        <CabinSet />
        <Person st={{kind: 'rick', pose: 'stand', expr: 'panic', variant: 0}} feet={[0, 0, -20.4]} height={1.8} />
      </>
    ),
  },
  // 15. passengers passing the message down the aisle: the middle one holds the note
  {
    id: 'aisle-chain', a: 34.1, b: 36.27,
    cam0: {p: [0, 1.4, 0.2], l: [0, 1.14, -5.0], f: 56}, cam1: {p: [0, 1.4, 0.1], l: [0, 1.14, -5.0], f: 56}, creep: 0.08,
    view: ({mouth, t}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'pax', pose: 'stand', expr: 'neutral', variant: 1}} feet={[-0.3, 0, -3.0]} height={1.7} />
        <Person st={{kind: 'pax', pose: 'note', expr: t > 1 ? 'grin' : 'shock', variant: 2}} feet={[0.0, 0, -4.6]} height={1.7} />
        <Person st={{kind: 'pax', pose: 'stand', expr: 'smug', mouth, variant: 3}} feet={[0.55, 0, -6.2]} height={1.7} />
      </>
    ),
  },
  // 16. a passenger says "pull up your socks": the camera is low, on the socks
  {
    id: 'socks', a: 36.27, b: 38.73,
    cam0: {p: [0.0, 0.55, -0.6], l: [0.0, 0.3, -2.6], f: 46}, cam1: {p: [0.0, 0.55, -0.45], l: [0.0, 0.3, -2.6], f: 46}, creep: 0.08,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'pax', pose: 'socks', expr: 'grin', mouth, variant: 4}} feet={[0.0, 0, -2.6]} height={2.2} />
      </>
    ),
  },
  // 17. Grandma knits: "Grandma, watch your knitting."
  {
    id: 'grandma', a: 38.73, b: 41.6,
    cam0: {p: [0, 1.3, R(6) + 2.4], l: [0, 0.92, R(6)], f: 42}, cam1: {p: [0, 1.3, R(6) + 2.2], l: [0, 0.92, R(6)], f: 42}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'edna', pose: 'knit', expr: 'neutral', mouth, variant: 0}} feet={[0.0, 0, R(6)]} height={1.45} />
      </>
    ),
  },
  // 18. Tommy in row nine: "Do a barrel roll!" (camera rolls); the toy airliner is in his raised hand
  {
    id: 'tommy', a: 41.6, b: 44.28,
    cam0: {p: [0, 1.3, R(8) + 2.4], l: [0, 0.83, R(8)], f: 46, r: 0}, cam1: {p: [0, 1.3, R(8) + 2.2], l: [0, 0.83, R(8)], f: 46, r: 0.09}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'tommy', pose: 'raise', expr: 'shock', mouth, variant: 0}} feet={[0.0, 0, R(8)]} height={1.2} />
        <Airliner p={[0.35, 1.05, R(8) + 0.06]} s={0.016} ry={0.3} />
      </>
    ),
  },
  // 19. Kevin: "I did not do a barrel roll."
  {
    id: 'no-roll', a: 44.28, b: 45.98,
    cam0: {p: [-1.5, 1.3, -1.8], l: [-1.5, 0.8, -3.2], f: 42}, cam1: {p: [-1.5, 1.3, -1.75], l: [-1.5, 0.8, -3.2], f: 42},
    view: ({mouth, t}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'kevin', pose: 'stand', expr: 'angry', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.45} ry={Math.sin(t * 18) * 0.22} />
      </>
    ),
  },
  // 20. the clouds open: the airliner crosses in profile, below a few clouds
  {
    id: 'clouds', a: 45.98, b: 49.55,
    cam0: {p: [0, 20, -4], l: [0, 20.5, -90], f: 46}, cam1: {p: [0, 20, -3.6], l: [0, 20.5, -90], f: 46}, creep: 0.1,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <SkyDome />
          <Clouds seed={21} n={4} span={60} y={[44, 60]} />
          <Airliner p={[-3 + 6 * k, 20 - 1.2 * k, -90]} s={1.5} ry={Math.PI / 2} />
        </>
      );
    },
  },
  // 21. the highway: "Just a highway." The airliner rolls out on the empty road; the camera rides alongside
  {
    id: 'landing', a: 49.55, b: 52.03,
    cam0: {p: [-55, 2.2, -75], l: [0, 3.0, -75], f: 50}, cam1: {p: [-55, 2.2, -15], l: [0, 3.0, -15], f: 50}, creep: 0,
    view: ({t, dur}) => {
      const e = ease(Math.min(1, t / dur));
      return (
        <>
          <SkyDome />
          <HighwaySet airliner={[0, 2.75, -75 + 60 * e]} airRy={0} airS={1.1} />
        </>
      );
    },
  },
  // 22. the drive-thru lane: "it was the drive-thru lane." The window is open, the kitchen lit
  {
    id: 'drive-thru', a: 52.03, b: 54.5,
    cam0: {p: [-6.5, 2.1, -10], l: [12, 2.0, -10], f: 55}, cam1: {p: [-5.2, 2.1, -10], l: [12, 2.0, -10], f: 55}, creep: 0,
    view: () => (
      <>
        <SkyDome />
        <HighwaySet />
      </>
    ),
  },
  // 23. the airliner stops right at the speaker: its nose by the speaker post
  {
    id: 'speaker', a: 54.5, b: 56.9,
    cam0: {p: [9.4, 2.0, 3.0], l: [8.2, 1.9, -10], f: 46}, cam1: {p: [9.2, 2.0, 2.6], l: [8.2, 1.9, -10], f: 46}, creep: 0.05,
    view: () => (
      <>
        <SkyDome />
        <HighwaySet airliner={[-2.7, 2.75, -10]} airRy={Math.PI / 2} airS={1.1} />
      </>
    ),
  },
  // 24. the cashier, inside the window: "Welcome! Can I take your order?"
  {
    id: 'cashier', a: 56.9, b: 59.25,
    cam0: {p: [6.5, 1.9, -6.0], l: [12.2, 1.28, -10.0], f: 40}, cam1: {p: [6.7, 1.9, -6.1], l: [12.2, 1.28, -10.0], f: 40}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <HighwaySet />
        <Person st={{kind: 'cashier', pose: 'stand', expr: 'grin', mouth, variant: 0}} feet={[13.5, 0.5, -10]} height={1.8} ry={-Math.PI / 2} />
      </>
    ),
  },
  // 25. the new rule: the bathroom door is open, Rick grins in the doorway
  {
    id: 'new-rule', a: 59.25, b: 63.0,
    cam0: {p: [0, 1.4, -12.2], l: [0, 0.9, -20.6], f: 42}, cam1: {p: [0, 1.42, -12.6], l: [0, 0.9, -20.6], f: 42}, creep: 0.05,
    view: () => (
      <>
        <SkyDome />
        <CabinSet passengers={false} bathroomOpen />
        <Person st={{kind: 'rick', pose: 'thumb', expr: 'proud', variant: 0}} feet={[0.6, 0, -20.8]} height={1.8} />
      </>
    ),
  },
  // 26. Kevin, thumbs up: "And me? Free flights for life."
  {
    id: 'smug', a: 63.0, b: 65.5,
    cam0: {p: [-1.5, 1.3, -1.9], l: [-1.5, 0.8, -3.2], f: 44}, cam1: {p: [-1.5, 1.3, -1.85], l: [-1.5, 0.8, -3.2], f: 44}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'kevin', pose: 'thumb', expr: 'smug', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.45} />
      </>
    ),
  },
  // 27. finale: Kevin wedged in the middle seat between two huge passengers
  {
    id: 'finale', a: 65.5, b: 67.6,
    cam0: {p: [-1.5, 1.35, 1.1], l: [-1.5, 1.1, -3.0], f: 70}, cam1: {p: [-1.5, 1.35, 1.0], l: [-1.5, 1.1, -3.0], f: 70}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'kevin', pose: 'sit', expr: 'grin', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.35} />
        <Person st={{kind: 'pax', pose: 'sit', expr: 'bored', variant: 3}} feet={[-2.3, 0, R(0) + 0.35]} height={2.0} />
        <Person st={{kind: 'pax', pose: 'sit', expr: 'neutral', variant: 1}} feet={[-0.7, 0, R(0) + 0.35]} height={2.0} />
      </>
    ),
  },
];

export const TOTAL_SECONDS = 67.6;
export const TOTAL_FRAMES = 2028;
