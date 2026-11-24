import React from 'react';
import * as THREE from 'three';

// Colour and detail for the Janitor Short sets: painted textures and small props.
// Self-contained (it does not import world.tsx), so world.tsx can import from here.

type V3 = [number, number, number];

const CACHE = new Map<string, THREE.Texture>();

/** A canvas texture painted once per render process. */
function paint(
  key: string,
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat?: [number, number],
): THREE.Texture {
  const hit = CACHE.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  CACHE.set(key, t);
  return t;
}

function rng(seed: number) {
  let s = seed | 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// ---------- textures ----------

/** Control room back wall: navy panels with turquoise and yellow strips, LEDs and small graphs. */
export const controlWallTex = () =>
  paint('ctl-wall', 1024, 512, (g, w, h) => {
    g.fillStyle = '#1b2a44';
    g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 8; x++) {
        const px = 16 + x * 126;
        const py = 16 + y * 164;
        g.fillStyle = '#243a5e';
        roundRect(g, px, py, 110, 140, 10);
        g.fill();
        g.fillStyle = r() < 0.5 ? '#2ec4b6' : '#ffd166';
        g.fillRect(px, py, 110, 8);
        for (let k = 0; k < 3; k++) {
          g.fillStyle = ['#ff6b6b', '#ffd166', '#06d6a0'][Math.floor(r() * 3)];
          g.beginPath();
          g.arc(px + 20 + k * 24, py + 36, 6, 0, Math.PI * 2);
          g.fill();
        }
        g.strokeStyle = '#2ec4b6';
        g.lineWidth = 4;
        g.beginPath();
        for (let t = 0; t <= 8; t++) {
          const gx = px + 14 + t * 11;
          const gy = py + 84 + Math.sin(t * 0.9 + x + y) * 20 + r() * 10;
          if (t === 0) g.moveTo(gx, gy);
          else g.lineTo(gx, gy);
        }
        g.stroke();
      }
    }
  });

/** A world map: ocean, continents, a dashed orbit with two satellites. */
export const worldMapTex = () =>
  paint('world-map', 1024, 512, (g, w, h) => {
    g.fillStyle = '#1f6f9f';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2b82b0';
    g.lineWidth = 2;
    for (let x = 0; x <= w; x += 64) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y <= h; y += 64) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    const r = rng(5);
    const blobs: [number, number, number, number][] = [
      [180, 170, 120, 90], [260, 320, 70, 110], [480, 160, 140, 70], [520, 300, 80, 120], [700, 200, 150, 90],
      [840, 330, 60, 50], [620, 380, 50, 40], [380, 240, 40, 60], [930, 140, 40, 40], [120, 300, 50, 40],
    ];
    for (const [cx, cy, rx, ry] of blobs) {
      const pick = r();
      g.fillStyle = pick < 0.45 ? '#7fb069' : pick < 0.75 ? '#c9b37e' : '#5b8c5a';
      g.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 8) {
        const k = 0.75 + 0.35 * r();
        const x = cx + Math.cos(a) * rx * k;
        const y = cy + Math.sin(a) * ry * k;
        if (a === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
    }
    g.strokeStyle = '#ffd166';
    g.lineWidth = 6;
    g.setLineDash([24, 14]);
    g.beginPath();
    g.ellipse(w / 2, h / 2, 440, 150, -0.2, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#ffffff';
    for (const [x, y] of [[w / 2 + 300, h / 2 - 120], [w / 2 - 260, h / 2 + 90]]) {
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI * 2);
      g.fill();
    }
  });

/** Carpet: blue with orange dots and blue stripes, repeated on the floor. */
export const carpetTex = () =>
  paint('carpet', 512, 512, (g, w, h) => {
    g.fillStyle = '#2d4f8c';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4a261';
    for (let y = 0; y < h; y += 64) {
      const off = (y / 64) % 2 ? 32 : 0;
      for (let x = 0; x < w; x += 64) {
        g.beginPath();
        g.arc(x + off + 16, y + 16, 9, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.strokeStyle = '#3f6fb5';
    g.lineWidth = 6;
    for (let y = 32; y < h; y += 64) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
  }, [4, 4]);

/** Warning stripes, yellow and black. */
export const warningTex = () =>
  paint('warning', 256, 256, (g, w, h) => {
    g.fillStyle = '#f2c94c';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1d1f24';
    for (let x = -h; x < w + h; x += 64) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 32, 0);
      g.lineTo(x + 32 + h, h);
      g.lineTo(x + h, h);
      g.closePath();
      g.fill();
    }
  }, [2, 2]);

/** ORBITA mission poster: a rocket or a ringed planet on a gradient, with the mission name. */
export const posterTex = (kind: 'rocket' | 'planet') =>
  paint('poster-' + kind, 256, 384, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, kind === 'rocket' ? '#1f3d7a' : '#5a2d82');
    grd.addColorStop(1, kind === 'rocket' ? '#f28c4a' : '#2ec4b6');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      g.arc((i * 97) % w, (i * 53) % 200, 2 + (i % 3), 0, Math.PI * 2);
      g.fill();
    }
    if (kind === 'rocket') {
      g.fillStyle = '#f5f5f5';
      g.fillRect(112, 120, 32, 110);
      g.beginPath();
      g.moveTo(112, 120);
      g.lineTo(128, 80);
      g.lineTo(144, 120);
      g.closePath();
      g.fill();
      g.fillStyle = '#e63946';
      g.beginPath();
      g.moveTo(112, 190);
      g.lineTo(90, 240);
      g.lineTo(112, 230);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(144, 190);
      g.lineTo(166, 240);
      g.lineTo(144, 230);
      g.closePath();
      g.fill();
      g.fillStyle = '#ffb703';
      g.beginPath();
      g.moveTo(112, 230);
      g.lineTo(128, 300);
      g.lineTo(144, 230);
      g.closePath();
      g.fill();
    } else {
      g.fillStyle = '#ffd166';
      g.beginPath();
      g.arc(128, 170, 60, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 8;
      g.beginPath();
      g.ellipse(128, 170, 96, 22, -0.3, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = '#ffffff';
    g.font = 'bold 34px Arial';
    g.textAlign = 'center';
    g.fillText('ORBITA', w / 2, 352);
  });

/** Keyboard: dark keys with a few coloured ones. */
export const keyboardTex = () =>
  paint('keyboard', 256, 96, (g, w, h) => {
    g.fillStyle = '#1b1f27';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 12; x++) {
        g.fillStyle = (x + y * 3) % 17 === 0 ? '#ff6b6b' : (x * y) % 7 === 0 ? '#2ec4b6' : '#2e3542';
        g.fillRect(8 + x * 20, 8 + y * 20, 16, 14);
      }
    }
  });

/** Console screens: a graph, a bar chart, or a camera feed with a cartoon head. */
export const screenDashTex = (kind: 'graphs' | 'bars' | 'camera') =>
  paint('screen-' + kind, 512, 320, (g, w, h) => {
    g.fillStyle = '#0b1a2b';
    g.fillRect(0, 0, w, h);
    const r = rng(kind.length * 7 + 3);
    if (kind === 'graphs') {
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = ['#2ec4b6', '#ffd166', '#ff6b6b'][k];
        g.lineWidth = 6;
        g.beginPath();
        for (let t = 0; t <= 20; t++) {
          const x = 30 + t * 22;
          const y = 80 + k * 80 + Math.sin(t * 0.6 + k) * 30 + r() * 20;
          if (t === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
    } else if (kind === 'bars') {
      for (let i = 0; i < 14; i++) {
        g.fillStyle = ['#2ec4b6', '#ffd166', '#ff6b6b', '#8ecae6'][i % 4];
        const bh = 40 + r() * 200;
        g.fillRect(24 + i * 34, h - 30 - bh, 22, bh);
      }
    } else {
      g.fillStyle = '#243a5e';
      g.fillRect(40, 30, w - 80, h - 60);
      g.fillStyle = '#e8a87c';
      g.beginPath();
      g.arc(w / 2, h / 2 + 10, 72, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#1e3a8a';
      g.beginPath();
      g.arc(w / 2, h / 2 - 30, 80, Math.PI, 0);
      g.fill();
    }
  });

/** A clock face showing one time; the face colour is a parameter. */
export const clockFaceTex = (hour: number, min: number, face: string) =>
  paint('clock-' + hour + '-' + min + '-' + face, 256, 256, (g) => {
    g.fillStyle = face;
    g.beginPath();
    g.arc(128, 128, 124, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#1d1f24';
    g.lineWidth = 10;
    g.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96);
      g.lineTo(128 + Math.sin(a) * 110, 128 - Math.cos(a) * 110);
      g.stroke();
    }
    const ha = ((hour % 12) + min / 60) / 12 * Math.PI * 2;
    const ma = (min / 60) * Math.PI * 2;
    g.lineCap = 'round';
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(128, 128);
    g.lineTo(128 + Math.sin(ha) * 56, 128 - Math.cos(ha) * 56);
    g.stroke();
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(128, 128);
    g.lineTo(128 + Math.sin(ma) * 84, 128 - Math.cos(ma) * 84);
    g.stroke();
    g.fillStyle = '#ff6b6b';
    g.beginPath();
    g.arc(128, 128, 10, 0, Math.PI * 2);
    g.fill();
  });

/** A painted family photo: three cartoon heads on a green hill. */
export const familyPhotoTex = () =>
  paint('family-photo', 256, 192, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#8ecae6');
    grd.addColorStop(1, '#a8e6a1');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#5b8c5a';
    g.beginPath();
    g.ellipse(128, 200, 180, 60, 0, 0, Math.PI * 2);
    g.fill();
    const people: [number, number, number, string, string][] = [
      [78, 110, 34, '#c4703c', '#2c6bd6'],
      [128, 96, 40, '#e8a87c', '#f2c94c'],
      [184, 116, 30, '#8d5524', '#ff6b6b'],
    ];
    for (const [x, y, rad, skin, shirt] of people) {
      g.fillStyle = shirt;
      g.fillRect(x - rad * 0.9, y + rad * 0.9, rad * 1.8, rad * 1.6);
      g.fillStyle = skin;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#241726';
      g.beginPath();
      g.arc(x - rad * 0.35, y - rad * 0.1, 3, 0, Math.PI * 2);
      g.arc(x + rad * 0.35, y - rad * 0.1, 3, 0, Math.PI * 2);
      g.fill();
    }
  });

/** A small sticker: star, circle, cross or rocket, on a transparent background. */
export const stickerTex = (k: number) =>
  paint('sticker-' + k, 128, 128, (g) => {
    const col = ['#ffd166', '#ff8fab', '#2ec4b6', '#9b5de5'][k % 4];
    g.fillStyle = col;
    g.strokeStyle = '#241726';
    g.lineWidth = 8;
    g.beginPath();
    if (k % 4 === 0) {
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? 54 : 24;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        g.lineTo(64 + Math.cos(a) * rad, 64 + Math.sin(a) * rad);
      }
    } else if (k % 4 === 1) {
      g.arc(64, 64, 50, 0, Math.PI * 2);
    } else if (k % 4 === 2) {
      g.rect(40, 14, 48, 100);
      g.rect(14, 40, 100, 48);
    } else {
      g.moveTo(64, 10);
      g.lineTo(88, 80);
      g.lineTo(40, 80);
      g.closePath();
    }
    g.closePath();
    g.fill();
    g.stroke();
  });

/** A snack bag: a coloured bag with a white seal and a dotted pattern. */
export const foodBagTex = (hue: string) =>
  paint('bag-' + hue, 256, 256, (g, w, h) => {
    g.fillStyle = hue;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    for (let y = 40; y < h; y += 48) {
      const off = (y / 48) % 2 ? 24 : 0;
      for (let x = off; x < w; x += 48) {
        g.beginPath();
        g.arc(x + 12, y, 8, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, 24);
  });

/** A station wall mural: cream with teal, pink and yellow circles and triangles. */
export const stationMuralTex = () =>
  paint('mural', 1024, 512, (g, w, h) => {
    g.fillStyle = '#f7ead8';
    g.fillRect(0, 0, w, h);
    const r = rng(21);
    const cols = ['#2ec4b6', '#ff8fab', '#ffd166', '#f4a261', '#9b5de5'];
    for (let i = 0; i < 26; i++) {
      g.fillStyle = cols[i % cols.length];
      const x = r() * w;
      const y = r() * h;
      if (i % 2 === 0) {
        g.beginPath();
        g.arc(x, y, 30 + r() * 50, 0, Math.PI * 2);
        g.fill();
      } else {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 70, y + 40);
        g.lineTo(x + 20, y + 80);
        g.closePath();
        g.fill();
      }
    }
  });

/** A checkerboard floor, teal and cream. */
export const checkerFloorTex = () =>
  paint('checker', 512, 512, (g, w, h) => {
    const n = 8;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        g.fillStyle = (x + y) % 2 === 0 ? '#2ec4b6' : '#f7ead8';
        g.fillRect((x * w) / n, (y * h) / n, w / n, h / n);
      }
    }
  }, [3, 3]);

/** A puddle on the hangar floor: a blue pool with white glints, transparent outside. */
export const puddleTex = () =>
  paint('puddle', 256, 256, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(60,140,200,0.9)');
    grd.addColorStop(0.7, 'rgba(40,110,170,0.7)');
    grd.addColorStop(1, 'rgba(40,110,170,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.8)';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(w / 2 - 30, h / 2 - 10, 34, Math.PI * 1.1, Math.PI * 1.6);
    g.stroke();
    g.beginPath();
    g.arc(w / 2 + 40, h / 2 + 30, 20, Math.PI * 1.2, Math.PI * 1.7);
    g.stroke();
  });

/** A bookshelf front: rows of coloured book spines. */
export const bookshelfTex = () =>
  paint('books', 256, 512, (g, w, h) => {
    g.fillStyle = '#7a4a2a';
    g.fillRect(0, 0, w, h);
    const r = rng(31);
    const cols = ['#ff6b6b', '#2ec4b6', '#ffd166', '#9b5de5', '#f4a261', '#ffffff', '#8ecae6'];
    for (let row = 0; row < 6; row++) {
      let x = 8;
      while (x < w - 14) {
        const bw = 10 + Math.floor(r() * 8);
        g.fillStyle = cols[Math.floor(r() * cols.length)];
        g.fillRect(x, 10 + row * 84, bw, 70);
        x += bw + 2;
      }
    }
  });

/** A rug: zigzag stripes in orange, teal and yellow. */
export const rugTex = () =>
  paint('rug', 512, 256, (g, w, h) => {
    g.fillStyle = '#f4a261';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2ec4b6';
    for (let x = 0; x < w; x += 64) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 32, h);
      g.lineTo(x + 64, 0);
      g.closePath();
      g.fill();
    }
    g.strokeStyle = '#ffd166';
    g.lineWidth = 10;
    g.strokeRect(14, 14, w - 28, h - 28);
  });

/** Clouds for the dawn sky: soft white puffs on a transparent background. */
export const skyCloudTex = () =>
  paint('sky-cloud', 512, 256, (g) => {
    g.fillStyle = 'rgba(255,255,255,0.92)';
    for (const [x, y, r] of [[120, 150, 60], [190, 120, 80], [280, 140, 70], [360, 160, 55], [240, 170, 50]] as [number, number, number][]) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
  });

/** Parking-lot building facade: beige with rows of blue windows. */
export const facadeTex = () =>
  paint('facade', 256, 512, (g, w, h) => {
    g.fillStyle = '#e8d5b7';
    g.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillStyle = (row + col) % 3 === 0 ? '#ffd166' : '#4cc9f0';
        g.fillRect(18 + col * 58, 24 + row * 60, 42, 40);
      }
    }
  });

/** A round blue sign with a white arrow (no text). */
export const arrowSignTex = () =>
  paint('arrow-sign', 256, 256, (g, w, h) => {
    g.fillStyle = '#1d4ed8';
    g.beginPath();
    g.arc(w / 2, h / 2, 118, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(60, 110);
    g.lineTo(150, 110);
    g.lineTo(150, 80);
    g.lineTo(200, 128);
    g.lineTo(150, 176);
    g.lineTo(150, 146);
    g.lineTo(60, 146);
    g.closePath();
    g.fill();
  });

/** Quilted red seat cushion: diamonds, darker stitching and little dots. */
export const quiltTex = () =>
  paint('quilt', 256, 256, (g, w, h) => {
    g.fillStyle = '#b5523b';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8a3b2b';
    g.lineWidth = 6;
    for (let k = -h; k < w + h; k += 64) {
      g.beginPath();
      g.moveTo(k, 0);
      g.lineTo(k + h, h);
      g.stroke();
      g.beginPath();
      g.moveTo(k, h);
      g.lineTo(k + h, 0);
      g.stroke();
    }
    g.fillStyle = '#e8a87c';
    for (let y = 32; y < h; y += 64) {
      for (let x = 32; x < w; x += 64) {
        g.beginPath();
        g.arc(x, y, 5, 0, Math.PI * 2);
        g.fill();
      }
    }
  }, [2, 2]);

/** Wall panels: tinted tiles with bright seams and rivets, on a transparent background. */
export const wallPatternTex = () =>
  paint('wall-pattern', 512, 256, (g, w, h) => {
    for (let x = 0; x < w; x += 128) {
      for (let y = 0; y < h; y += 128) {
        g.fillStyle = ((x + y) / 128) % 2 ? 'rgba(8,28,48,0.30)' : 'rgba(255,255,255,0.07)';
        g.fillRect(x + 4, y + 4, 120, 120);
      }
    }
    g.strokeStyle = 'rgba(190,240,232,0.85)';
    g.lineWidth = 6;
    for (let x = 0; x <= w; x += 128) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y <= h; y += 128) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.fillStyle = 'rgba(230,255,250,0.9)';
    for (let x = 16; x < w; x += 128) {
      for (let y = 16; y < h; y += 128) {
        g.beginPath();
        g.arc(x, y, 6, 0, Math.PI * 2);
        g.fill();
      }
    }
  });

/** A floor grate: dark diagonal bars, transparent between them. */
export const gratePatternTex = () =>
  paint('grate', 256, 256, (g, w, h) => {
    g.strokeStyle = 'rgba(20,40,50,0.55)';
    g.lineWidth = 8;
    for (let k = -h; k < w + h; k += 48) {
      g.beginPath();
      g.moveTo(k, 0);
      g.lineTo(k + h, h);
      g.stroke();
    }
  }, [2, 2]);

/** A painted floor zone: a solid colour with a white border and dashes. */
export const floorZoneTex = (c: string) =>
  paint('zone-' + c, 256, 256, (g, w, h) => {
    g.fillStyle = c;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 14;
    g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#ffffff';
    for (let x = 30; x < w - 20; x += 56) g.fillRect(x, 110, 28, 36);
  });

/** Wooden wall panels: tan planks with dark seams. */
export const woodPanelTex = () =>
  paint('wood-panel', 512, 512, (g, w, h) => {
    const cols = ['#c9a27e', '#b98e68', '#d6b392', '#c29a72'];
    for (let i = 0; i < 8; i++) {
      g.fillStyle = cols[i % cols.length];
      g.fillRect(0, i * 64, w, 64);
    }
    g.strokeStyle = '#7a5a3e';
    g.lineWidth = 3;
    for (let i = 0; i <= 8; i++) {
      g.beginPath();
      g.moveTo(0, i * 64);
      g.lineTo(w, i * 64);
      g.stroke();
    }
    for (let x = 128; x < w; x += 128) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
  }, [3, 1]);

// ---------- meshes ----------

/** A box with a colour, or a texture. */
export const Bx: React.FC<{p: V3; s: V3; c?: string; map?: THREE.Texture; r?: number}> = ({p, s, c = '#999999', map, r = 0}) => (
  <mesh position={p} rotation={[0, r, 0]}>
    <boxGeometry args={s} />
    {map ? <meshLambertMaterial map={map} /> : <meshLambertMaterial color={c} />}
  </mesh>
);

/** A cylinder. */
export const Cy: React.FC<{p: V3; r: number; h: number; c: string; rot?: V3; seg?: number}> = ({p, r, h, c, rot = [0, 0, 0], seg = 14}) => (
  <mesh position={p} rotation={rot}>
    <cylinderGeometry args={[r, r, h, seg]} />
    <meshLambertMaterial color={c} />
  </mesh>
);

/** A small unlit sphere, so it reads as a light or a button. */
export const Glow: React.FC<{p: V3; r: number; c: string}> = ({p, r, c}) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 10, 8]} />
    <meshBasicMaterial color={c} toneMapped={false} />
  </mesh>
);

/** A lit sphere. */
export const Sp: React.FC<{p: V3; r: number; c: string}> = ({p, r, c}) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 14, 10]} />
    <meshLambertMaterial color={c} />
  </mesh>
);

/** A flat picture: unlit for screens and posters (lit=false), lit for walls and floors. */
export const Pl: React.FC<{p: V3; s: [number, number]; tex: THREE.Texture; ry?: number; rx?: number; lit?: boolean; cut?: boolean}> = ({
  p, s, tex, ry = 0, rx = 0, lit = false, cut = false,
}) => (
  <mesh position={p} rotation={[rx, ry, 0]}>
    <planeGeometry args={s} />
    {lit ? (
      <meshLambertMaterial map={tex} side={THREE.DoubleSide} transparent={cut} alphaTest={cut ? 0.05 : 0} />
    ) : (
      <meshBasicMaterial map={tex} side={THREE.DoubleSide} transparent={cut} alphaTest={cut ? 0.05 : 0} toneMapped={false} />
    )}
  </mesh>
);

/** A thin cable from a to b. */
export const Cable: React.FC<{a: V3; b: V3; c: string; r?: number}> = ({a, b, c, r = 0.025}) => {
  const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, len, 6]} />
      <meshLambertMaterial color={c} />
    </mesh>
  );
};

/** An office chair: a coloured seat, a back and a stem. */
export const Chair: React.FC<{p: V3; c: string; ry?: number}> = ({p, c, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Bx p={[0, 0.45, 0]} s={[0.5, 0.1, 0.5]} c={c} />
    <Bx p={[0, 0.8, -0.22]} s={[0.5, 0.6, 0.08]} c={c} />
    <Cy p={[0, 0.2, 0]} r={0.04} h={0.4} c="#3a4656" seg={8} />
  </group>
);

/** A keyboard lying on a desk top (the desk top is at the group's height). */
export const Keyboard: React.FC<{p: V3}> = ({p}) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[0.5, 0.18]} />
    <meshLambertMaterial map={keyboardTex()} />
  </mesh>
);

/** A cactus in a pot. */
export const Cactus: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <Cy p={[0, 0.08, 0]} r={0.07} h={0.16} c="#b5523b" />
    <Cy p={[0, 0.28, 0]} r={0.06} h={0.3} c="#2a9d5c" seg={10} />
    <Cy p={[0.08, 0.3, 0]} r={0.03} h={0.14} c="#2a9d5c" seg={8} />
  </group>
);

/** A flowerpot with a pink bloom. */
export const FlowerPot: React.FC<{p: V3; c?: string}> = ({p, c = '#ff6b9a'}) => (
  <group position={p}>
    <Cy p={[0, 0.07, 0]} r={0.08} h={0.14} c="#8d5524" />
    <Sp p={[0, 0.2, 0]} r={0.1} c={c} />
    <Sp p={[0.07, 0.25, 0.03]} r={0.06} c="#ffd166" />
  </group>
);

/** A rocket figurine. */
export const RocketFig: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <Cy p={[0, 0.1, 0]} r={0.03} h={0.2} c="#f5f5f5" seg={10} />
    <mesh position={[0, 0.24, 0]}>
      <coneGeometry args={[0.035, 0.08, 10]} />
      <meshLambertMaterial color="#e63946" />
    </mesh>
    <Bx p={[0.035, 0.03, 0]} s={[0.03, 0.05, 0.01]} c="#e63946" />
    <Bx p={[-0.035, 0.03, 0]} s={[0.03, 0.05, 0.01]} c="#e63946" />
  </group>
);

/** A bag of crisps: yellow with a red band. */
export const ChipsBag: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <Bx p={[0, 0.1, 0]} s={[0.12, 0.2, 0.04]} c="#ffd166" />
    <Bx p={[0, 0.1, 0.021]} s={[0.122, 0.04, 0.005]} c="#e63946" />
  </group>
);

/** A desk lamp: a stem and a warm glowing head. */
export const DeskLamp: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <Cy p={[0, 0.02, 0]} r={0.06} h={0.04} c="#3a4656" />
    <Cy p={[0, 0.18, 0]} r={0.012} h={0.32} c="#3a4656" seg={6} />
    <Glow p={[0.04, 0.36, 0]} r={0.07} c="#ffe8a3" />
  </group>
);

/** A round tree: a brown trunk and three green crowns. */
export const Tree: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => (
  <group position={p}>
    <Cy p={[0, 0.6 * s, 0]} r={0.12 * s} h={1.2 * s} c="#7a4a2a" seg={8} />
    <Sp p={[0, 1.6 * s, 0]} r={0.75 * s} c="#2a9d5c" />
    <Sp p={[0.35 * s, 1.95 * s, 0.1 * s]} r={0.5 * s} c="#3cb371" />
    <Sp p={[-0.3 * s, 2.0 * s, -0.1 * s]} r={0.45 * s} c="#1f7a4a" />
  </group>
);

/** A flowerbed: a brown bed with coloured blooms. */
export const FlowerBed: React.FC<{p: V3; w?: number}> = ({p, w = 2.4}) => {
  const cols = ['#ff6b6b', '#ffd166', '#ff9ecd', '#c77dff', '#ffffff'];
  const r = rng(Math.round(w * 100));
  const dots: V3[] = [];
  for (let i = 0; i < 16; i++) dots.push([(r() - 0.5) * w * 0.9, 0.42, (r() - 0.5) * 0.7]);
  return (
    <group position={p}>
      <Bx p={[0, 0.2, 0]} s={[w, 0.4, 0.9]} c="#8d5524" />
      {dots.map((d, i) => (
        <Sp key={i} p={d} r={0.09} c={cols[i % cols.length]} />
      ))}
    </group>
  );
};

/** A parked hatchback in a bright colour. */
export const Car: React.FC<{p: V3; c: string; ry?: number}> = ({p, c, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Bx p={[0, 0.9, 0]} s={[2.0, 0.9, 3.6]} c={c} />
    <Bx p={[0, 1.6, -0.2]} s={[1.8, 0.8, 2.2]} c="#8fc6e8" />
    {([[-0.9, 1.2], [0.9, 1.2], [-0.9, -1.2], [0.9, -1.2]] as [number, number][]).map(([x, z], i) => (
      <Cy key={i} p={[x, 0.4, z]} r={0.4} h={0.3} c="#1d1f24" rot={[0, 0, Math.PI / 2]} seg={14} />
    ))}
  </group>
);

/** An orange traffic cone. */
export const TrafficCone: React.FC<{p: V3}> = ({p}) => (
  <mesh position={p}>
    <coneGeometry args={[0.2, 0.6, 12]} />
    <meshLambertMaterial color="#ff7a1a" />
  </mesh>
);

/** A round bin with a lid. */
export const Bin: React.FC<{p: V3; c: string}> = ({p, c}) => (
  <group position={p}>
    <Cy p={[0, 0.4, 0]} r={0.25} h={0.8} c={c} />
    <Cy p={[0, 0.84, 0]} r={0.27} h={0.06} c="#3a4656" />
  </group>
);

/** A flag on a pole: a coloured panel (no national flags). */
export const Flag: React.FC<{p: V3; h: number; c: string}> = ({p, h, c}) => (
  <group position={p}>
    <Cy p={[0, h / 2, 0]} r={0.03} h={h} c="#c9cdd6" seg={6} />
    <mesh position={[0.3, h - 0.3, 0]}>
      <planeGeometry args={[0.6, 0.4]} />
      <meshLambertMaterial color={c} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** A bookshelf against a wall: a wooden frame and a shelf front with coloured books. */
export const BookShelf: React.FC<{p: V3; s: V3; ry?: number}> = ({p, s, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Bx p={[0, 0, 0]} s={s} c="#6b4a2e" />
    <Pl p={[0, 0, s[2] / 2 + 0.01]} s={[s[0] * 0.92, s[1] * 0.92]} tex={bookshelfTex()} lit />
  </group>
);

/** A globe on a stand. */
export const Globe: React.FC<{p: V3; r: number}> = ({p, r}) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 24, 16]} />
      <meshLambertMaterial map={worldMapTex()} />
    </mesh>
    <Cy p={[0, -r - 0.2, 0]} r={0.05} h={0.4} c="#c9cdd6" />
  </group>
);

/** A fridge with coloured magnets. */
export const Fridge: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <Bx p={[0, 0.9, 0]} s={[0.8, 1.8, 0.8]} c="#f4f4f0" />
    <Bx p={[-0.2, 1.2, 0.41]} s={[0.1, 0.12, 0.02]} c="#ff6b6b" />
    <Bx p={[0.15, 0.9, 0.41]} s={[0.1, 0.12, 0.02]} c="#2ec4b6" />
    <Bx p={[-0.1, 0.6, 0.41]} s={[0.1, 0.12, 0.02]} c="#ffd166" />
  </group>
);

/** A row of glowing buttons on a panel face (the panel faces +z). */
export const Buttons: React.FC<{p: V3; n: number; cols: string[]}> = ({p, n, cols}) => (
  <group position={p}>
    {Array.from({length: n}, (_, i) => (
      <Glow key={i} p={[(i % 6) * 0.09 - 0.22, Math.floor(i / 6) * 0.09 - 0.05, 0.02]} r={0.028} c={cols[i % cols.length]} />
    ))}
  </group>
);

/** A puddle on the floor (a flat transparent pool). */
export const Puddle: React.FC<{p: V3; s: [number, number]}> = ({p, s}) => (
  <Pl p={p} s={s} tex={puddleTex()} rx={-Math.PI / 2} cut />
);
