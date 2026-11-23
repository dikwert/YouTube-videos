export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const PART_SECONDS = 40;
export const PART_FRAMES = PART_SECONDS * FPS;

/** Seconds -> frames. */
export const sec = (s: number) => Math.round(s * FPS);

/**
 * Central safe area for text and key art. Shorts crops the top and bottom ~15%
 * and the right edge carries the like/comment/share buttons.
 */
export const SAFE = {top: 288, bottom: 1632, left: 60, right: 900};

/** Date shown on the recording timestamp in Part 3: tomorrow relative to the series start (2026-11-23). */
export const TOMORROW_LABEL = 'NOV 24, 2026';

export const COL = {
  skin: '#e3a57a',
  skinShade: '#b9744f',
  skinLight: '#f6c79b',
  hair: '#4a2c1a',
  hairLight: '#6e4426',
  stubble: '#3a2418',
  beard: '#4e3020',
  shirt: '#f0712a',
  shirtShade: '#c4521a',
  shirtRoll: '#ffa25e',
  khaki: '#c9a56a',
  khakiShade: '#9c7a48',
  pack: '#3d4a3a',
  packLight: '#55664f',
  boot: '#4b3322',
  ink: '#2a1b12',
  white: '#fffaf0',
  jeep: '#3f7d4a',
  jeepDark: '#2b5a35',
  jeepLight: '#6aa86b',
  tire: '#171717',
  rim: '#a8adb3',
  rust: '#c4621f',
  rustDark: '#7f3a12',
  rustLight: '#e08a3c',
  moss: '#4d8f3a',
  mossDark: '#2d5e25',
  root: '#5a3d22',
  stone: '#8d8b78',
  stoneDark: '#4d4c43',
  stoneLight: '#b9b5a0',
  gpsBezel: '#15171c',
  gpsBlue: '#1d5fd6',
  gpsBlueDark: '#0b2a6b',
  gpsGreen: '#18c46a',
  gpsGreenDark: '#063d22',
  glowGreen: '#4dff9a',
  sun: '#ffe08a',
  cap: '#c62828',
  truckWhite: '#ecebe3',
  truckShade: '#b8b6a8',
};

export type PaletteName = 'bright' | 'dusk2' | 'dusk3' | 'deep4' | 'sun' | 'twist';

export type Palette = {
  top: string;
  bottom: string;
  far: string;
  mid: string;
  near: string;
  ground: string;
  road: string;
  grade: string;
  gradeOpacity: number;
  glow: string;
};

/** Colour arc across the series: bright jungle -> ever darker and greener -> sunlight -> green twist. */
export const PALETTE: Record<PaletteName, Palette> = {
  bright: {
    top: '#58c4ff',
    bottom: '#eaf9c8',
    far: '#5fbf7a',
    mid: '#2f9a55',
    near: '#17703f',
    ground: '#8a6a3f',
    road: '#b98c55',
    grade: '#fff6c0',
    gradeOpacity: 0,
    glow: '#fff2a8',
  },
  dusk2: {
    top: '#3f9c96',
    bottom: '#b5e3a0',
    far: '#3e8f66',
    mid: '#24734d',
    near: '#145238',
    ground: '#5b4a33',
    road: '#7d6443',
    grade: '#0b3d25',
    gradeOpacity: 0.22,
    glow: '#b6ffd0',
  },
  dusk3: {
    top: '#2b6267',
    bottom: '#79b08f',
    far: '#2a6a4a',
    mid: '#1b5036',
    near: '#0e3a24',
    ground: '#42402e',
    road: '#5e5036',
    grade: '#062a1b',
    gradeOpacity: 0.38,
    glow: '#7dffb0',
  },
  deep4: {
    top: '#16423f',
    bottom: '#3f8064',
    far: '#1d4c36',
    mid: '#11382a',
    near: '#082517',
    ground: '#2b2a20',
    road: '#3d3a2a',
    grade: '#03150c',
    gradeOpacity: 0.55,
    glow: '#5cff9c',
  },
  sun: {
    top: '#ffd27a',
    bottom: '#fff3c4',
    far: '#7fd39a',
    mid: '#3fae6c',
    near: '#22874f',
    ground: '#d9a86a',
    road: '#e9c78f',
    grade: '#ffe08a',
    gradeOpacity: 0.06,
    glow: '#fff4c2',
  },
  twist: {
    top: '#0f5f3a',
    bottom: '#21d17a',
    far: '#16a35a',
    mid: '#0c7a41',
    near: '#06522b',
    ground: '#0b3d20',
    road: '#1b5e35',
    grade: '#00ff88',
    gradeOpacity: 0.22,
    glow: '#4dff9a',
  },
};
