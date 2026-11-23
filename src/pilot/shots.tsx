import React from 'react';
import {WORDS} from './timing.generated';
import {Airliner, Box, CabinSet, Clouds, CockpitDoor, CockpitSet, Cyl, HighwaySet, Person, Pic, ROW_Z, Sphere, SkyDome, fishTex} from './world';

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

/**
 * 27 shots. Times are seconds of the narration (words.json). Each shot has its own set and camera.
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
        <CockpitSet kevin={{pose: 'sit', expr: 'shock', mouth}} dave="upright" />
      </>
    ),
  },
  // 2. cockpit wide: "Flight 312."
  {
    id: 'cockpit-wide', a: 2.0, b: 4.55,
    cam0: {p: [0, 1.2, 2.5], l: [-0.4, 1.2, -1.0], f: 55}, cam1: {p: [0.1, 1.2, 2.3], l: [-0.4, 1.2, -1.0], f: 55}, creep: 0.04,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CockpitSet kevin={{pose: 'sit', expr: 'neutral', mouth}} dave="upright" />
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
        <Airliner p={[0, 30, -30]} s={1.4} ry={0.25} />
      </>
    ),
  },
  // 4. cabin: Kevin in the middle seat
  {
    id: 'kevin-seat', a: 6.05, b: 7.9,
    cam0: {p: [-1.5, 1.2, -0.9], l: [-1.5, 1.05, -3.2], f: 42}, cam1: {p: [-1.5, 1.2, -0.8], l: [-1.5, 1.05, -3.2], f: 42}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet />
        <Person st={{kind: 'kevin', pose: 'sit', expr: 'neutral', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.35} />
        <Box p={[-0.9, 0.7, R(0) + 0.2]} s={[0.2, 0.3, 0.12]} c="#f2c230" />
      </>
    ),
  },
  // 5. food trays: two meals
  {
    id: 'trays', a: 7.9, b: 11.1,
    cam0: {p: [0.0, 1.9, -2.0], l: [-1.5, 0.9, R(2) + 0.35], f: 42}, cam1: {p: [0.05, 1.9, -1.9], l: [-1.5, 0.9, R(2) + 0.35], f: 42}, creep: 0.08,
    view: () => (
      <>
        <SkyDome />
        <CabinSet />
        <Cyl p={[-1.5, 0.92, R(2) + 0.35]} r={0.22} h={0.03} c="#f7f7f2" />
        <Cyl p={[1.5, 0.92, R(2) + 0.35]} r={0.22} h={0.03} c="#f7f7f2" />
        <Pic p={[-1.5, 0.945, R(2) + 0.35]} s={[0.36, 0.22]} tex={fishTex()} rx={-Math.PI / 2} />
        <Sphere p={[1.5, 0.98, R(2) + 0.35]} r={0.14} c="#f1c75c" />
      </>
    ),
  },
  // 6. two-shot of the two passengers with trays
  {
    id: 'two-shot', a: 11.1, b: 13.55,
    cam0: {p: [0, 1.3, -2.3], l: [0, 1.0, R(2)], f: 46}, cam1: {p: [0.05, 1.3, -2.2], l: [0, 1.0, R(2)], f: 46}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet />
        <Person st={{kind: 'pax', pose: 'seated_hand', expr: 'bored', variant: 2}} feet={[-1.5, 0, R(2) + 0.2]} height={1.3} />
        <Person st={{kind: 'pax', pose: 'fork', expr: 'shock', variant: 1}} feet={[1.5, 0, R(2) + 0.2]} height={1.3} />
        <Cyl p={[0, 0.92, R(2) + 0.35]} r={0.2} h={0.03} c="#f7f7f2" />
        <Pic p={[0, 0.95, R(2) + 0.1]} s={[0.3, 0.18]} tex={fishTex()} rx={-Math.PI / 2} />
      </>
    ),
  },
  // 7. close-up of the fish: "Our co-pilot ate the fish anyway."
  {
    id: 'fish', a: 13.55, b: 15.4,
    cam0: {p: [-1.2, 1.1, R(2) + 1.0], l: [-1.5, 0.92, R(2) + 0.35], f: 42}, cam1: {p: [-1.15, 1.08, R(2) + 0.9], l: [-1.5, 0.92, R(2) + 0.35], f: 42}, creep: 0.1,
    view: () => (
      <>
        <SkyDome />
        <CabinSet />
        <Cyl p={[-1.5, 0.92, R(2) + 0.35]} r={0.25} h={0.03} c="#f7f7f2" />
        <Pic p={[-1.5, 0.95, R(2) + 0.35]} s={[0.46, 0.28]} tex={fishTex()} rx={-Math.PI / 2} />
        <Box p={[-1.25, 0.95, R(2) + 0.3]} s={[0.02, 0.01, 0.2]} c="#c0c0c0" />
      </>
    ),
  },
  // 8. cockpit: Dave passes out on the controls
  {
    id: 'dave-out', a: 15.4, b: 17.95,
    cam0: {p: [-0.6, 1.2, 2.0], l: [-0.6, 1.1, -1.2], f: 52}, cam1: {p: [-0.6, 1.2, 1.85], l: [-0.6, 1.1, -1.2], f: 52}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CockpitSet kevin={{pose: 'sit', expr: 'shock', mouth}} dave="slump" />
      </>
    ),
  },
  // 9. the captain runs to the bathroom; the lock jams
  {
    id: 'run', a: 17.95, b: 21.2,
    cam0: {p: [0, 1.35, 0.2], l: [0, 1.4, -6], f: 50}, cam1: {p: [0, 1.35, -3], l: [0, 1.4, -9], f: 50}, creep: 0,
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
  // 10. Gloria asks the question
  {
    id: 'gloria', a: 21.2, b: 25.4,
    cam0: {p: [0, 1.4, -2.3], l: [0, 1.4, -6.4], f: 45}, cam1: {p: [0, 1.4, -2.6], l: [0, 1.4, -6.4], f: 45}, creep: 0.06,
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
    cam0: {p: [-1.5, 1.4, -1.8], l: [-1.5, 0.85, -3.2], f: 44}, cam1: {p: [-1.5, 1.35, -1.75], l: [-1.5, 0.85, -3.2], f: 44},
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
    id: 'shrug', a: 26.2, b: 28.6,
    cam0: {p: [-1.5, 1.3, -1.7], l: [-1.5, 0.8, -3.2], f: 42}, cam1: {p: [-1.5, 1.3, -1.65], l: [-1.5, 0.8, -3.2], f: 42}, creep: 0.05,
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
    id: 'cockpit-door', a: 28.6, b: 31.5,
    cam0: {p: [0, 1.2, 0.7], l: [0, 1.1, -1.4], f: 40}, cam1: {p: [0.05, 1.2, 0.6], l: [0, 1.1, -1.4], f: 40}, creep: 0.07,
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
    cam0: {p: [0, 1.45, -17.8], l: [0, 1.4, -21.2], f: 38}, cam1: {p: [0, 1.45, -18.1], l: [0, 1.4, -21.2], f: 38}, creep: 0.06,
    view: () => (
      <>
        <SkyDome />
        <CabinSet />
        <Person st={{kind: 'rick', pose: 'stand', expr: 'panic', variant: 0}} feet={[0, 0, -20.4]} height={1.8} />
      </>
    ),
  },
  // 15. passengers passing the message down the aisle
  {
    id: 'aisle-chain', a: 34.1, b: 36.2,
    cam0: {p: [0, 1.4, -1.5], l: [0.4, 1.4, -6], f: 50}, cam1: {p: [0, 1.4, -2.0], l: [0.4, 1.4, -6], f: 50}, creep: 0.08,
    view: ({mouth, t}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'pax', pose: 'stand', expr: 'neutral', variant: 1}} feet={[0.7, 0, -4.5]} height={1.7} />
        <Person st={{kind: 'pax', pose: 'stand', expr: t > 1 ? 'grin' : 'shock', variant: 2}} feet={[0.7, 0, -6.0]} height={1.7} />
        <Person st={{kind: 'pax', pose: 'stand', expr: 'smug', mouth, variant: 3}} feet={[0.7, 0, -7.5]} height={1.7} />
      </>
    ),
  },
  // 16. a passenger says "pull up your socks"
  {
    id: 'socks', a: 36.2, b: 38.7,
    cam0: {p: [0, 1.6, -3.6], l: [0.6, 1.4, -6.5], f: 44}, cam1: {p: [0, 1.6, -3.9], l: [0.6, 1.4, -6.5], f: 44}, creep: 0.1,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'pax', pose: 'stand', expr: 'grin', mouth, variant: 4}} feet={[0.6, 0, -6.5]} height={2.2} />
      </>
    ),
  },
  // 17. Grandma knits: "Grandma, watch your knitting."
  {
    id: 'grandma', a: 38.7, b: 41.55,
    cam0: {p: [0, 1.3, R(6) + 2.4], l: [0, 1.15, R(6)], f: 42}, cam1: {p: [0, 1.3, R(6) + 2.2], l: [0, 1.15, R(6)], f: 42}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'edna', pose: 'knit', expr: 'neutral', mouth, variant: 0}} feet={[0.0, 0, R(6)]} height={1.45} />
        <Sphere p={[0.25, 0.95, R(6) + 0.3]} r={0.2} c="#ff8a3d" />
      </>
    ),
  },
  // 18. Tommy in row nine: "Do a barrel roll!" (camera rolls)
  {
    id: 'tommy', a: 41.55, b: 44.2,
    cam0: {p: [0, 1.3, R(8) + 2.4], l: [0, 1.0, R(8)], f: 46, r: 0}, cam1: {p: [0, 1.3, R(8) + 2.2], l: [0, 1.0, R(8)], f: 46, r: 0.09}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'tommy', pose: 'raise', expr: 'shock', mouth, variant: 0}} feet={[0.0, 0, R(8)]} height={1.2} />
        <Airliner p={[-0.35, 1.2, R(8) + 0.25]} s={0.016} ry={0.3} />
      </>
    ),
  },
  // 19. Kevin: "I did not do a barrel roll."
  {
    id: 'no-roll', a: 44.2, b: 45.9,
    cam0: {p: [-1.5, 1.3, -1.8], l: [-1.5, 0.8, -3.2], f: 42}, cam1: {p: [-1.5, 1.3, -1.75], l: [-1.5, 0.8, -3.2], f: 42},
    view: ({mouth, t}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'kevin', pose: 'stand', expr: 'angry', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.45} ry={Math.sin(t * 18) * 0.22} />
      </>
    ),
  },
  // 20. the clouds open: the airliner comes down through them
  {
    id: 'clouds', a: 45.9, b: 49.45,
    cam0: {p: [0, 22, -6], l: [0, 22, -60], f: 45}, cam1: {p: [0, 20, -4], l: [0, 22, -60], f: 45}, creep: 0.2,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <SkyDome />
          <Clouds seed={21} n={9} span={40} y={[18, 30]} near />
          <Airliner p={[0, 24 - k * 8, -80 + k * 46]} s={2.4} />
        </>
      );
    },
  },
  // 21. the highway: "Just a highway." The airliner lands; the road is empty
  {
    id: 'landing', a: 49.45, b: 52.0,
    cam0: {p: [3.2, 1.1, 14], l: [0, 2.6, -60], f: 55}, cam1: {p: [3.0, 1.1, 10], l: [0, 2.6, -60], f: 55}, creep: 0.05,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <SkyDome />
          <HighwaySet airliner={[0, 6 - k * 3.9, -110 + k * 98]} />
        </>
      );
    },
  },
  // 22. the drive-thru lane: "it was the drive-thru lane."
  {
    id: 'drive-thru', a: 52.0, b: 54.5,
    cam0: {p: [5.5, 2.3, 6], l: [15, 2.6, -10], f: 48}, cam1: {p: [6.2, 2.3, -2], l: [15, 2.6, -10], f: 48}, creep: 0.04,
    view: () => (
      <>
        <SkyDome />
        <HighwaySet />
      </>
    ),
  },
  // 23. the airliner stops right at the speaker
  {
    id: 'speaker', a: 54.5, b: 56.8,
    cam0: {p: [6.9, 1.8, -6.3], l: [9.2, 1.5, -10], f: 46}, cam1: {p: [6.7, 1.8, -6.6], l: [9.2, 1.5, -10], f: 46}, creep: 0.05,
    view: () => (
      <>
        <SkyDome />
        <HighwaySet airliner={[3.0, 2.0, -9]} />
      </>
    ),
  },
  // 24. the cashier: "Welcome! Can I take your order?"
  {
    id: 'cashier', a: 56.8, b: 59.2,
    cam0: {p: [6.5, 1.9, -6.0], l: [12.2, 1.8, -10.0], f: 40}, cam1: {p: [6.7, 1.9, -6.1], l: [12.2, 1.8, -10.0], f: 40}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <HighwaySet />
        <Person st={{kind: 'cashier', pose: 'stand', expr: 'grin', mouth, variant: 0}} feet={[12.0, 0, -10]} height={1.8} ry={-Math.PI / 2} />
      </>
    ),
  },
  // 25. the new rule: the bathroom door is open, Rick grins in the doorway
  {
    id: 'new-rule', a: 59.2, b: 63.0,
    cam0: {p: [0, 1.4, -12.2], l: [0, 1.5, -20.6], f: 42}, cam1: {p: [0, 1.42, -12.6], l: [0, 1.5, -20.6], f: 42}, creep: 0.05,
    view: () => (
      <>
        <SkyDome />
        <CabinSet passengers={false} bathroomOpen />
        <Person st={{kind: 'rick', pose: 'thumb', expr: 'proud', variant: 0}} feet={[0.6, 0, -20.8]} height={1.8} />
      </>
    ),
  },
  // 26. Kevin, smug, thumbs up: "And me? Free flights for life."
  {
    id: 'smug', a: 63.0, b: 65.4,
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
    id: 'finale', a: 65.4, b: 67.6,
    cam0: {p: [-1.5, 1.35, -0.8], l: [-1.5, 1.0, -3.0], f: 62}, cam1: {p: [-1.5, 1.35, -0.9], l: [-1.5, 1.0, -3.0], f: 62}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <SkyDome />
        <CabinSet passengers={false} />
        <Person st={{kind: 'kevin', pose: 'sit', expr: 'grin', mouth, variant: 0}} feet={[-1.5, 0, R(0) + 0.2]} height={1.35} />
        <Person st={{kind: 'pax', pose: 'sit', expr: 'bored', variant: 3}} feet={[-2.3, 0, R(0) + 0.35]} height={2.3} />
        <Person st={{kind: 'pax', pose: 'sit', expr: 'neutral', variant: 1}} feet={[-0.7, 0, R(0) + 0.35]} height={2.3} />
      </>
    ),
  },
];

export const TOTAL_SECONDS = 67.6;
export const TOTAL_FRAMES = 2028;
