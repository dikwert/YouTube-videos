import React from 'react';
import {WORDS} from './timing.generated';
import {nebulaSpriteTex, Pl, panelTileTex, skyCloudTex} from './decor';
import {
  Box, Capsule, CapsuleInterior, Cat, ControlRoomSet, Cyl, Earth, HangarSet, LaunchSet, OfficeSet, BreakRoomSet,
  ParkingSet, Person, Pic, Rocket, SkyDome, SpaceDome, Sphere, StationSet, Smoke, ZLetter,
} from './world';

export type Vec3 = [number, number, number];
export type Cam = {p: Vec3; l: Vec3; f: number; r?: number};
export type Ctx = {g: number; t: number; dur: number; mouth: number; frame: number};
export type ShotDef = {id: string; a: number; b: number; cam0: Cam; cam1: Cam; creep?: number; kicks?: number[]; view: (c: Ctx) => React.ReactNode};

/** Mouth openness for the narrator (one voice): open while a word is spoken. */
export function mouthAt(g: number): number {
  for (const w of WORDS) {
    if (g >= w.s && g <= w.e) return 0.45 + 0.4 * Math.abs(Math.sin(g * 27));
  }
  return 0;
}

/** The camera's own smootherstep, so a prop that moves with the camera keeps pace with it. */
export const ease = (s: number) => s * s * s * (s * (s * 6 - 15) + 10);

/** The countdown digit on the capsule screen at a given narration time. */
const digitAt = (g: number) => (g < 14.1 ? '3' : g < 14.93 ? '2' : '1');

/**
 * 28 shots. Each cut lands on the first frame of the phrase it opens (words.json).
 * Kicks are flip impulses on impacts: the ignition, the spit, the landing.
 */
export const SHOTS: ShotDef[] = [
  // 1. hook: Gary floats in the capsule, Earth below the window, the mop drifts across his face
  {
    id: 'hook', a: 0, b: 2.0,
    cam0: {p: [0, 1.3, -2.0], l: [0, 1.4, 0.6], f: 50}, cam1: {p: [0, 1.3, -1.9], l: [0, 1.4, 0.6], f: 50}, creep: 0.05,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <Earth p={[0, -13.6, 21]} r={14} />
          <CapsuleInterior panel={false} />
          <Person st={{kind: 'gary', pose: 'float', expr: 'proud', variant: 0}} feet={[0, 0.9, 1.0]} height={1.5} ry={Math.PI} roll={0.2} />
          <Cyl p={[-1.4 + 2.8 * k, 1.6, 0.9]} r={0.05} h={1.2} c="#8a6a4a" rot={[0, 0, Math.PI / 2 + 0.5]} seg={6} />
        </>
      );
    },
  },
  // 2. the hangar at night: Gary with the cart, the capsule on its stand
  {
    id: 'hangar', a: 2.0, b: 5.4,
    cam0: {p: [0, 1.6, 4], l: [0, 1.6, -8], f: 50}, cam1: {p: [0.6, 1.6, 3.2], l: [0, 1.7, -8], f: 50}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <HangarSet />
        <Person st={{kind: 'gary', pose: 'mop', expr: 'neutral', mouth, variant: 0}} feet={[0.6, 0, -2.4]} height={1.8} />
      </>
    ),
  },
  // 3. the capsule seat: Gary sits down
  {
    id: 'seat-in', a: 5.4, b: 7.0,
    cam0: {p: [0.4, 1.3, 0.9], l: [0, 1.2, -2.4], f: 46}, cam1: {p: [0.2, 1.3, 0.8], l: [0, 1.2, -2.4], f: 46}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <CapsuleInterior panel={false} />
        <Person st={{kind: 'gary', pose: 'sit', expr: 'shock', mouth, variant: 0}} feet={[0, 0, -2.4]} height={1.5} />
      </>
    ),
  },
  // 4. "the comfiest chair in the building"
  {
    id: 'seat-comfy', a: 7.0, b: 8.6,
    cam0: {p: [-0.6, 1.2, 0.6], l: [0, 1.1, -2.4], f: 44}, cam1: {p: [-0.5, 1.2, 0.5], l: [0, 1.1, -2.4], f: 44}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <CapsuleInterior panel={false} />
        <Person st={{kind: 'gary', pose: 'sit', expr: 'grin', mouth, variant: 0}} feet={[0, 0, -2.4]} height={1.5} />
      </>
    ),
  },
  // 5. the nap: Gary asleep, Zs rising
  {
    id: 'nap', a: 8.6, b: 10.7,
    cam0: {p: [0, 1.25, 0.5], l: [0, 0.95, -2.4], f: 46}, cam1: {p: [0, 1.25, 0.2], l: [0, 0.95, -2.4], f: 46}, creep: 0.08,
    kicks: [],
    view: ({t, dur}) => (
      <>
        <CapsuleInterior digit="" panel={false} />
        <Person st={{kind: 'gary', pose: 'nap', expr: 'sleep', variant: 0}} feet={[0, 0, -2.4]} height={1.5} roll={0.05} />
        {[0, 0.5].map((off, i) => {
          const k = (t / dur + off) % 1;
          return <ZLetter key={i} p={[0.2 + 0.12 * i, 1.45 + 0.75 * k, -2.25]} s={0.3 + 0.12 * k} opacity={1 - k} />;
        })}
      </>
    ),
  },
  // 6. the wake-up: the screen starts counting
  {
    id: 'wake', a: 10.7, b: 12.9,
    cam0: {p: [0.3, 1.3, 0.6], l: [0, 1.1, -2.4], f: 44}, cam1: {p: [0.2, 1.3, 0.5], l: [0, 1.1, -2.4], f: 44}, creep: 0.06,
    view: ({mouth}) => (
      <>
        <CapsuleInterior digit="3" panel={false} />
        <Person st={{kind: 'gary', pose: 'sit', expr: 'shock', mouth, variant: 0}} feet={[0, 0, -2.4]} height={1.5} />
      </>
    ),
  },
  // 7. "three... two... one..." on the screen, the camera shakes
  {
    id: 'countdown', a: 12.9, b: 16.2,
    cam0: {p: [0, 1.25, -0.3], l: [0, 1.6, 0.8], f: 46}, cam1: {p: [0, 1.25, -0.45], l: [0, 1.6, 0.8], f: 44}, creep: 0.05,
    view: ({g, mouth}) => (
      <>
        <CapsuleInterior digit={digitAt(g)} dawn />
        <Person st={{kind: 'gary', pose: 'sit', expr: 'worry', mouth, variant: 0}} feet={[0, 0, -2.4]} height={1.5} roll={Math.sin(g * 70) * 0.02} />
      </>
    ),
  },
  // 8. the launch: the pad, the flame, the smoke, a flip kick on ignition
  {
    id: 'launch', a: 16.2, b: 18.9, kicks: [16.2],
    cam0: {p: [0, 1.2, 6], l: [0, 6, -10], f: 50}, cam1: {p: [0, 1.6, 5], l: [0, 8, -10], f: 52}, creep: 0.1,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <SkyDome dawn />
          <LaunchSet flame={0.5 + k} smoke={0.6 * k} />
        </>
      );
    },
  },
  // 9. the climb to orbit: the Earth through the window
  {
    id: 'orbit-in', a: 18.9, b: 22.0,
    cam0: {p: [0, 1.3, -2.0], l: [0, 1.4, 0.6], f: 50}, cam1: {p: [0, 1.3, -1.8], l: [0, 1.4, 0.6], f: 50}, creep: 0.05,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <Earth p={[0, -13.6 - k * 2, 21]} r={14} />
          <CapsuleInterior panel={false} />
          <Person st={{kind: 'gary', pose: 'float', expr: 'worry', variant: 0}} feet={[0, 0.9 + k * 0.1, 1.0]} height={1.5} ry={Math.PI} roll={0.15} />
        </>
      );
    },
  },
  // 10. weightless: the mop and the sandwich float past
  {
    id: 'floating', a: 22.0, b: 24.8,
    cam0: {p: [0, 1.3, -2.0], l: [0, 1.4, 0.6], f: 50}, cam1: {p: [0.2, 1.4, -1.9], l: [0, 1.4, 0.6], f: 50}, creep: 0.04,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <Earth p={[0, -13.6, 21]} r={14} />
          <CapsuleInterior panel={false} />
          <Person st={{kind: 'gary', pose: 'float', expr: 'proud', variant: 0}} feet={[0, 0.9, 1.0]} height={1.5} ry={Math.PI} roll={0.2} />
          <Cyl p={[-1.4 + 2.8 * k, 1.9, 0.9]} r={0.05} h={1.2} c="#8a6a4a" rot={[0, 0, Math.PI / 2 + 0.4]} seg={6} />
          <Box p={[1.2 - 2.2 * k, 1.6 + 0.3 * Math.sin(k * 6), 1.1]} s={[0.4, 0.2, 0.3]} c="#f2c94c" r={k} />
        </>
      );
    },
  },
  // 11. Mission Control: the radio call, Linda looks up
  {
    id: 'control', a: 24.8, b: 27.8,
    cam0: {p: [0, 1.6, 0.2], l: [0, 1.7, -12], f: 52}, cam1: {p: [0.2, 1.6, 0.0], l: [0, 1.7, -12], f: 52}, creep: 0.06,
    view: ({mouth, g}) => (
      <>
        <ControlRoomSet />
        <Person st={{kind: 'linda', pose: 'stand', expr: 'shock', mouth: g > 26.6 && g < 27.64 ? mouth : 0, variant: 0}} feet={[0, 0, -6]} height={1.8} />
        <Person st={{kind: 'ops', pose: 'sit', expr: 'bored', variant: 0}} feet={[-1.3, 0, -10]} height={1.6} />
        <Person st={{kind: 'ops', pose: 'sit', expr: 'neutral', variant: 1}} feet={[1.3, 0, -10]} height={1.6} />
      </>
    ),
  },
  // 12. "Gary. From cleaning." An operator spits his coffee; a flip kick
  {
    id: 'spit', a: 27.8, b: 29.7, kicks: [28.49],
    cam0: {p: [0, 1.4, -3], l: [0, 1.5, -10], f: 40}, cam1: {p: [0.2, 1.4, -3.2], l: [0, 1.5, -10], f: 40}, creep: 0.06,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <ControlRoomSet />
          <Person st={{kind: 'ops', pose: k > 0.36 ? 'spit' : 'sit', expr: k > 0.36 ? 'shock' : 'neutral', variant: 0}} feet={[-0.8, 0, -10]} height={1.6} />
          <Person st={{kind: 'linda', pose: 'stand', expr: 'worry', variant: 0}} feet={[0.7, 0, -10]} height={1.8} />
        </>
      );
    },
  },
  // 13. "Long silence." A slow push-in on the faces, then one second of silence
  {
    id: 'silence', a: 29.7, b: 31.6,
    cam0: {p: [0, 1.6, 0.5], l: [0, 1.7, -9], f: 46}, cam1: {p: [0, 1.6, -1.6], l: [0, 1.7, -9], f: 36}, creep: 0.03,
    view: ({t}) => (
      <>
        <ControlRoomSet />
        <Person st={{kind: 'linda', pose: 'stand', expr: 'worry', blink: t > 0.9 && t < 1.0, variant: 0}} feet={[0, 0, -6]} height={1.8} />
        <Person st={{kind: 'ops', pose: 'sit', expr: 'dazed', variant: 0}} feet={[-1.3, 0, -10]} height={1.6} />
        <Person st={{kind: 'ops', pose: 'sit', expr: 'bored', variant: 1}} feet={[1.3, 0, -10]} height={1.6} />
      </>
    ),
  },
  // 14. "Fun fact: in space, your spine stretches." Gary stands beside the height marker
  {
    id: 'stretch', a: 31.6, b: 34.6,
    cam0: {p: [0.2, 1.4, -1.6], l: [-1.0, 1.2, -4.2], f: 46}, cam1: {p: [0.2, 1.5, -1.8], l: [-1.0, 1.25, -4.2], f: 46}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <StationSet />
        <Person st={{kind: 'gary', pose: 'stand', expr: 'neutral', mouth, variant: 0}} feet={[-0.8, 0, -4.2]} height={1.8} />
      </>
    ),
  },
  // 15. "Astronauts grow up to two inches." The marker in close-up
  {
    id: 'marker', a: 34.6, b: 38.3,
    cam0: {p: [-0.2, 1.2, -1.2], l: [-1.9, 1.1, -4.2], f: 44}, cam1: {p: [-0.2, 1.25, -1.1], l: [-1.9, 1.1, -4.2], f: 44}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <StationSet />
        <Person st={{kind: 'gary', pose: 'thumb', expr: 'proud', mouth, variant: 0}} feet={[-1.5, 0, -4.2]} height={1.8} />
      </>
    ),
  },
  // 16. "For the first time in my life... I was six feet tall." Gary stands tall, grinning
  {
    id: 'six-feet', a: 38.3, b: 39.45,
    cam0: {p: [0.4, 1.3, -1.5], l: [-0.8, 1.0, -4.2], f: 46}, cam1: {p: [0.4, 1.3, -1.6], l: [-0.8, 1.0, -4.2], f: 46}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <StationSet />
        <Person st={{kind: 'gary', pose: 'thumb', expr: 'grin', mouth, variant: 0}} feet={[-0.8, 0, -4.2]} height={1.8} />
      </>
    ),
  },
  // 17. "I docked at the station." The capsule comes in to the dock
  {
    id: 'dock', a: 39.45, b: 41.0, kicks: [40.9],
    cam0: {p: [4, 2, 6], l: [2.5, 1.5, -5], f: 46}, cam1: {p: [3, 2, 5], l: [2.5, 1.5, -5], f: 46}, creep: 0.1,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <SpaceDome />
          <Earth p={[0, -20, -60]} r={22} />
          <Pl p={[-8, 12, -60]} s={[40, 20]} tex={nebulaSpriteTex()} cut />
          <mesh position={[0, 1.5, -6]}>
            <boxGeometry args={[4.4, 4.4, 12]} />
            <meshLambertMaterial map={panelTileTex('#e8e8e4')} />
          </mesh>
          <Capsule p={[4.2 - 1.1 * k, 1.5, -4]} s={0.9} ry={Math.PI / 2} />
        </>
      );
    },
  },
  // 18. "Nobody was home. Just a cat." The empty station, then the cat floats in
  {
    id: 'cat-in', a: 41.0, b: 42.8,
    cam0: {p: [0, 1.4, -0.5], l: [0, 1.2, -6], f: 50}, cam1: {p: [0, 1.4, -0.4], l: [0, 1.2, -6], f: 50}, creep: 0.05,
    view: ({t}) => (
      <>
        <StationSet cat={t > 0.8} catExpr="judge" />
      </>
    ),
  },
  // 19. "An experiment cat." Close-up: the judgement
  {
    id: 'cat-close', a: 42.8, b: 46.15,
    cam0: {p: [0.2, 1.3, -1.5], l: [0.4, 1.2, -4.6], f: 40}, cam1: {p: [0.2, 1.3, -1.9], l: [0.4, 1.2, -4.6], f: 36}, creep: 0.05,
    view: () => (
      <>
        <StationSet cat catExpr="judge" />
      </>
    ),
  },
  // 20. "Fun fact two: on the station, you drink recycled pee." Gary sips
  {
    id: 'drink', a: 46.15, b: 49.58,
    cam0: {p: [0, 1.4, -0.5], l: [0, 1.3, -6], f: 46}, cam1: {p: [0, 1.4, -0.6], l: [0, 1.3, -6], f: 46}, creep: 0.05,
    view: ({mouth}) => (
      <>
        <StationSet />
        <Person st={{kind: 'gary', pose: 'drink', expr: 'smug', mouth, variant: 0}} feet={[-0.15, 0, -4.4]} height={1.7} />
      </>
    ),
  },
  // 21. "The cat didn't." The cat turns away
  {
    id: 'cat-turn', a: 49.58, b: 50.7,
    cam0: {p: [0, 1.4, -0.5], l: [0.4, 1.2, -4.6], f: 44}, cam1: {p: [0, 1.4, -0.6], l: [0.4, 1.2, -4.6], f: 44}, creep: 0.05,
    view: () => (
      <>
        <StationSet cat catExpr="turn" />
      </>
    ),
  },
  // 22. "The cat was smarter." The cat's smug close-up
  {
    id: 'cat-smug', a: 50.7, b: 51.8,
    cam0: {p: [0.2, 1.3, -1.6], l: [0.4, 1.2, -4.6], f: 40}, cam1: {p: [0.2, 1.3, -1.8], l: [0.4, 1.2, -4.6], f: 38}, creep: 0.05,
    view: () => (
      <>
        <StationSet cat catExpr="smug" />
      </>
    ),
  },
  // 23. "Three days later, they brought me home." The re-entry glow and the parachutes
  {
    id: 'reentry', a: 51.8, b: 54.0,
    cam0: {p: [0, 1.5, 8], l: [0, 6, -10], f: 52}, cam1: {p: [0, 1.6, 7], l: [0, 5, -10], f: 52}, creep: 0.08,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <SkyDome dawn />
          <Capsule p={[0, 8 - 3 * k, -10]} s={1.1} />
          <Smoke p={[0, 10 - 3 * k, -10]} k={0.4 + k * 0.6} />
          <Pl p={[-6, 9, -24]} s={[14, 7]} tex={skyCloudTex()} cut />
          <Pl p={[7, 12, -28]} s={[16, 8]} tex={skyCloudTex()} cut />
        </>
      );
    },
  },
  // 24. "Luckily... the landing was perfect. Unluckily... it was the parking lot."
  {
    id: 'landing', a: 54.0, b: 57.0,
    cam0: {p: [0, 2.4, 9], l: [0, 1.5, -14], f: 52}, cam1: {p: [0, 2.2, 8], l: [0, 1.5, -14], f: 52}, creep: 0.06,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      return (
        <>
          <SkyDome dawn />
          <ParkingSet />
          <Capsule p={[0, 7 - 3.5 * ease(k), -14]} s={1.3} />
          <Pl p={[-6, 9, -26]} s={[14, 7]} tex={skyCloudTex()} cut />
          <Pl p={[8, 12, -30]} s={[16, 8]} tex={skyCloudTex()} cut />
          <Pl p={[-3, 12, -34]} s={[16, 8]} tex={skyCloudTex()} cut />
          <Pl p={[6, 10.5, -38]} s={[18, 9]} tex={skyCloudTex()} cut />
        </>
      );
    },
  },
  // 25. "On my car." The impact: the car is squashed, dust, a flip kick
  {
    id: 'impact', a: 57.0, b: 59.25, kicks: [57.0],
    cam0: {p: [2.5, 1.4, -4], l: [0, 1.0, -14], f: 48}, cam1: {p: [2.2, 1.4, -3.6], l: [0, 1.0, -14], f: 48}, creep: 0.05,
    view: ({t, dur}) => {
      const k = Math.min(1, t / dur);
      const squash = Math.min(1, Math.max(0, k * 3));
      return (
        <>
          <SkyDome dawn />
          <ParkingSet squash={squash} />
          <Capsule p={[0, 2.0 * Math.max(0.25, 1 - squash) + 1.5, -14]} s={1.3} />
          <Smoke p={[0, 0.2, -17]} k={squash * 0.3} />
        </>
      );
    },
  },
  // 26. "Now capsules lock at night. And janitors nap in the break room."
  {
    id: 'break-room', a: 59.25, b: 62.8,
    cam0: {p: [0, 1.5, 2.2], l: [0, 1.2, -3], f: 50}, cam1: {p: [0, 1.5, 2.0], l: [0, 1.2, -3], f: 50}, creep: 0.05,
    view: ({t}) => (
      <>
        <BreakRoomSet />
        <Person st={{kind: 'gary', pose: 'sit', expr: 'sleep', variant: 0}} feet={[0, 0.8, -3]} height={1.5} roll={0.025 * Math.sin(t * 3.2)} />
      </>
    ),
  },
  // 27. "Then my boss called." Mr. Pike on the phone
  {
    id: 'boss', a: 62.8, b: 64.2,
    cam0: {p: [0, 1.4, 2], l: [0, 1.5, -4], f: 46}, cam1: {p: [0, 1.4, 1.9], l: [0, 1.5, -4], f: 46}, creep: 0.05,
    view: () => (
      <>
        <OfficeSet />
        <Person st={{kind: 'pike', pose: 'phone', expr: 'neutral', variant: 0}} feet={[0, 0, -5]} height={1.7} />
      </>
    ),
  },
  // 28. "Gary... you missed a spot." Gary with the phone, the crushed car, the final line
  {
    id: 'finale', a: 64.2, b: 67.0,
    cam0: {p: [0.5, 1.4, -2.2], l: [0, 0.3, -14], f: 46}, cam1: {p: [0.5, 1.4, -2.0], l: [0, 0.3, -14], f: 46}, creep: 0.05,
    view: () => (
      <>
        <SkyDome dawn />
        <ParkingSet squash={0.75} />
        <Person st={{kind: 'gary', pose: 'phone', expr: 'worry', variant: 0}} feet={[0.6, 0, -4]} height={1.8} />
      </>
    ),
  },
];

export const TOTAL_SECONDS = 67.0;
export const TOTAL_FRAMES = 2010;
