export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const PART_SECONDS = 60;
export const PART_FRAMES = PART_SECONDS * FPS;

/** Seconds -> frames. */
export const sec = (s: number) => Math.round(s * FPS);

/** Palette: dark, wet green. Yellow is for subtitles, red for keywords only. */
export const C = {
  deep: '#0E1F16',
  mid: '#163024',
  near: '#23402E',
  leaf: '#3B5B3A',
  leafLight: '#5E7F4A',
  fog: '#7F9187',
  rain: '#B8C7BE',
  warm: '#FFD9A0',
  cold: '#CFE8FF',
  subtitle: '#FFD60A',
  keyword: '#FF2B2B',
};

/** Subtitle block: centre at 68% of the frame height, width at most 85%. */
export const SUB_Y = Math.round(H * 0.68);
