import {Easing, interpolate} from 'remotion';

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic pseudo-random in [0, 1) derived from a number (no Math.random at render time). */
export const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
};

/** Seeded PRNG (mulberry32) used to build static scenery once. */
export const rng = (seed: number) => {
  let s = (seed | 0) || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const easeInOut = Easing.inOut(Easing.cubic);

/** Piecewise keyframes: [frame, value] pairs, eased inside each segment. Input keys must be strictly increasing. */
export const keyed = (
  frame: number,
  keys: ReadonlyArray<readonly [number, number]>,
  easing: (t: number) => number = easeInOut,
): number => {
  if (keys.length === 0) return 0;
  if (keys.length === 1) return keys[0][1];
  return interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing},
  );
};

/** Linear-by-default ramp from a to b between frames f0 and f1. */
export const ramp = (
  frame: number,
  f0: number,
  f1: number,
  a: number,
  b: number,
  easing: (t: number) => number = (t) => t,
) => interpolate(frame, [f0, f1], [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** 0 before f0, 1 after f1, eased in between. */
export const ease01 = (frame: number, f0: number, f1: number) =>
  ramp(frame, f0, f1, 0, 1, easeInOut);

export const hexToRgb = (h: string): [number, number, number] => {
  const v = h.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};

/** Mix two #rrggbb colours; returns an rgb() string usable in SVG and CSS. */
export const mixHex = (a: string, b: string, t: number) => {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

/** Turn React's useId output into a safe SVG id fragment. */
export const safeId = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '');
