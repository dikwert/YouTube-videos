import React from 'react';

/** Torch or headlight cone from (x0,y0) to (x1,y1), soft at the end. */
export const Beam: React.FC<{x0: number; y0: number; x1: number; y1: number; w0?: number; w1?: number; opacity?: number}> = ({x0, y0, x1, y1, w0 = 10, w1 = 200, opacity = 0.5}) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const pts = [
    [x0 + nx * w0, y0 + ny * w0],
    [x1 + nx * w1, y1 + ny * w1],
    [x1 - nx * w1, y1 - ny * w1],
    [x0 - nx * w0, y0 - ny * w0],
  ]
    .map((p) => p.map((v) => v.toFixed(1)).join(','))
    .join(' ');
  return <polygon points={pts} fill="#FFE7B0" opacity={opacity} />;
};
