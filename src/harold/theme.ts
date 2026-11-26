// Общие константы и помощники короткометражки «The Man Who Returned a Library Book 70 Years Late».
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const INK = '#2a1d16';
export const FONT = 'MontserratEB';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// время от a до b: 0..1
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const outBack = (x: number) => {
  const c = 1.70158;
  const y = clamp(x) - 1;
  return 1 + (c + 1) * y * y * y + c * y * y;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

// моргание: короткий прикрыв глаз раз в ~3 с (seed сдвигает фазу)
export const blink = (t: number, seed = 0) => {
  const period = 3.1 + seed * 0.41;
  const x = (t + seed) % period;
  return x < 0.13 ? 0.12 : 1;
};

// дыхание: лёгкое покачивание корпуса
export const breath = (t: number) => 1 + 0.008 * Math.sin(t * 2.4);

// открытие рта при речи (lip-sync по таймкодам строки)
export const mouthOpen = (t: number, on: boolean) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 17)) : 0);

export const speaking = (t: number, a: number, b: number) => t >= a && t <= b;
