import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {COL, W} from '../lib/theme';
import {clamp, hash, mixHex, rng, safeId} from '../lib/math';
import {Layer} from '../scene/Camera';
import {Vines} from '../scene/Environment';

/** Closed or open carved eye. `open` 0..1 blends from stone-closed to glowing green. */
const CarvedEye: React.FC<{x: number; y: number; w: number; open: number; id: string}> = ({x, y, w, open, id}) => {
  const g = clamp(open);
  const h = w * 0.42;
  const almond = `M ${-w / 2} 0 Q 0 ${-h} ${w / 2} 0 Q 0 ${h} ${-w / 2} 0 Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      {g > 0.01 && (
        <ellipse rx={w * 0.9} ry={h * 1.6} fill={COL.glowGreen} opacity={0.35 * g} filter={`url(#eglow${id})`} />
      )}
      {/* closed lid line with lashes */}
      <path d={`M ${-w / 2} 0 Q 0 ${h * 0.9} ${w / 2} 0`} stroke={COL.stoneDark} strokeWidth={Math.max(3, w * 0.09)} fill="none" strokeLinecap="round" opacity={1 - g} />
      <g opacity={1 - g}>
        {[-0.35, 0, 0.35].map((k) => (
          <line key={k} x1={w * k} y1={h * 0.9} x2={w * k * 1.2} y2={h * 1.5} stroke={COL.stoneDark} strokeWidth={Math.max(2, w * 0.05)} strokeLinecap="round" />
        ))}
      </g>
      {/* open almond with green iris */}
      <g opacity={g}>
        <path d={almond} fill={mixHex('#2b3b2e', '#9dffc4', g)} stroke={COL.stoneDark} strokeWidth={Math.max(2, w * 0.05)} />
        <circle r={w * 0.16} fill={mixHex('#1a2a1d', '#eaffea', g)} />
        <circle r={w * 0.07} fill="#042010" />
      </g>
    </g>
  );
};

/** Carved stone face with eyes; eyes open when `open` > 0. Used on walls and on the facade. */
const StoneFace: React.FC<{x: number; y: number; s: number; open: number; id: string}> = ({x, y, s, open, id}) => {
  const f = useCurrentFrame();
  const glow = clamp(open);
  const pulse = 0.85 + 0.15 * Math.sin(f * 0.08);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow > 0.01 && (
        <ellipse cx={0} cy={0} rx={270} ry={320} fill={COL.glowGreen} opacity={0.16 * glow * pulse} filter={`url(#eglow${id})`} />
      )}
      <ellipse cx={0} cy={0} rx={200} ry={236} fill={COL.stone} />
      <ellipse cx={0} cy={0} rx={200} ry={236} fill="none" stroke={COL.stoneDark} strokeWidth={8} opacity={0.6} />
      <ellipse cx={80} cy={20} rx={120} ry={200} fill={COL.stoneDark} opacity={0.22} />
      {/* brow ridge */}
      <path d="M -150 -80 Q -90 -126 -20 -86 M 20 -86 Q 90 -126 150 -80" stroke={COL.stoneDark} strokeWidth={22} fill="none" strokeLinecap="round" />
      <CarvedEye x={-82} y={-30} w={86} open={open} id={id} />
      <CarvedEye x={82} y={-30} w={86} open={open} id={id} />
      <path d="M 0 -6 L -22 70 Q 0 88 22 70" stroke={COL.stoneDark} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M -96 150 Q 0 204 96 150 Q 0 170 -96 150 Z" fill={COL.stoneDark} />
      <path d="M -60 176 Q 0 196 60 176" stroke={COL.stoneLight} strokeWidth={3} fill="none" opacity={0.5} />
      {/* headdress points */}
      <path d="M -180 -190 L -120 -240 L -90 -170 Z M 180 -190 L 120 -240 L 90 -170 Z" fill={COL.stoneDark} />
      <circle cx={-190} cy={40} r={20} fill="none" stroke={COL.stoneDark} strokeWidth={9} />
      <circle cx={190} cy={40} r={20} fill="none" stroke={COL.stoneDark} strokeWidth={9} />
    </g>
  );
};

/** Ancient temple front: block wall, huge carved face above the entrance, vines swallowing it. */
export const TempleFacade: React.FC<{awake: number; cx?: number; cy?: number; s?: number; vines?: boolean}> = ({
  awake,
  cx = 540,
  cy = 760,
  s = 1,
  vines = true,
}) => {
  const id = safeId(useId());
  const r = rng(41);
  const courses = Array.from({length: 12}, (_, i) => ({
    y: cy - 420 + i * 92,
    off: r() * 80,
  }));
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
      <defs>
        <filter id={`eglow${id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
      </defs>
      {/* stone wall */}
      <rect x={cx - 460} y={cy - 440} width={920} height={1180} fill={COL.stoneDark} />
      {courses.map((c, i) => (
        <g key={i}>
          <line x1={cx - 460} y1={c.y} x2={cx + 460} y2={c.y} stroke="#2e2d27" strokeWidth={4} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <line
              key={k}
              x1={cx - 460 + ((k * 170 + c.off) % 920)}
              y1={c.y}
              x2={cx - 460 + ((k * 170 + c.off) % 920)}
              y2={c.y + 92}
              stroke="#2e2d27"
              strokeWidth={4}
            />
          ))}
        </g>
      ))}
      {/* steps */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={cx - 300 - i * 30} y={cy + 430 + i * 36} width={600 + i * 60} height={34} fill={COL.stone} opacity={0.9 - i * 0.1} />
      ))}
      {/* doorway, dark */}
      <path d={`M ${cx - 150} ${cy + 430} L ${cx - 150} ${cy + 240} Q ${cx} ${cy + 120} ${cx + 150} ${cy + 240} L ${cx + 150} ${cy + 430} Z`} fill="#0b130e" />
      <path d={`M ${cx - 150} ${cy + 430} L ${cx - 150} ${cy + 240} Q ${cx} ${cy + 120} ${cx + 150} ${cy + 240} L ${cx + 150} ${cy + 430}`} fill="none" stroke={COL.stoneLight} strokeWidth={10} opacity={0.5} />
      {/* the face */}
      <g transform={`translate(${cx} ${cy - 110})`}>
        <StoneFace x={0} y={0} s={1.05} open={awake} id={id} />
      </g>
      {vines && (
        <g>
          <Layer depth={1}>
            <Vines seed={51} count={9} xMin={cx - 460} xMax={cx + 460} len={520} y0={cy - 440} sway={16} color={COL.mossDark} leafColor={COL.moss} width={9} />
          </Layer>
        </g>
      )}
    </g>
  );
};

/** One-point corridor with carved faces along both walls and a far wall face. Vanishing point (540, 960). */
export const Corridor: React.FC<{opens?: number[]; farOpen?: number; depthFaces?: number[]; id?: string; dim?: number}> = ({
  opens = [0, 0, 0],
  farOpen = 0,
  depthFaces = [0.32, 0.58, 0.84],
  dim = 1,
}) => {
  const uid = safeId(useId());
  const f = useCurrentFrame();
  const courses = [1, 2, 3, 4, 5, 6, 7].map((k) => k / 8);
  return (
    <g style={{filter: dim < 1 ? `brightness(${dim})` : undefined}}>
      <defs>
        <filter id={`eglow${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <linearGradient id={`fl${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1410" />
          <stop offset="100%" stopColor="#1f2d24" />
        </linearGradient>
      </defs>
      {/* far wall */}
      <rect x={360} y={420} width={360} height={1080} fill={COL.stoneDark} />
      {/* ceiling and floor */}
      <polygon points="0,0 1080,0 720,420 360,420" fill="#24302a" />
      <polygon points="0,1920 1080,1920 720,1500 360,1500" fill={`url(#fl${uid})`} />
      {/* side walls */}
      <polygon points="0,0 360,420 360,1500 0,1920" fill={COL.stone} />
      <polygon points="1080,0 720,420 720,1500 1080,1920" fill={COL.stone} />
      {/* courses converge to the vanishing point */}
      {courses.map((h, i) => (
        <g key={i} stroke="#3b3a33" strokeWidth={5}>
          <line x1={0} y1={1920 * h} x2={360} y2={420 + 1080 * h} />
          <line x1={1080} y1={1920 * h} x2={720} y2={420 + 1080 * h} />
        </g>
      ))}
      {/* carved faces on walls */}
      {depthFaces.map((t, i) => {
        const sc = 0.95 * (1 - t) + 0.2;
        return (
          <g key={i}>
            <g transform={`translate(${0} 0)`}>
              <StoneFace x={360 * t * 0.9 + 40} y={960} s={sc * 0.45} open={opens[i] ?? 0} id={uid} />
            </g>
            <g transform={`translate(${0} 0)`}>
              <StoneFace x={1080 - (360 * t * 0.9 + 40)} y={960} s={sc * 0.45} open={opens[i] ?? 0} id={uid} />
            </g>
          </g>
        );
      })}
      {/* far wall face */}
      <StoneFace x={540} y={960} s={0.62} open={farOpen} id={uid} />
      {/* faint dust in the air */}
      {Array.from({length: 14}, (_, i) => (
        <circle key={i} cx={hash(i) * 1080} cy={hash(i + 3) * 1920 - ((f * 0.8 * (i % 3 + 1)) % 200)} r={2} fill="#fff" opacity={0.25} />
      ))}
    </g>
  );
};

/** Carved frieze on a wall band: riders, explorers with maps and phone-holding people, following a glowing arrow when `alive` rises. */
export const Frieze: React.FC<{alive: number; y?: number}> = ({alive, y = 1040}) => {
  const f = useCurrentFrame();
  const a = clamp(alive);
  const glow = mixHex('#6b6453', '#7dffb0', a);
  const figs: Array<{kind: 'rider' | 'explorer' | 'phone'; x: number}> = [
    {kind: 'rider', x: 120},
    {kind: 'explorer', x: 300},
    {kind: 'phone', x: 430},
    {kind: 'rider', x: 600},
    {kind: 'explorer', x: 760},
    {kind: 'phone', x: 900},
  ];
  const arrowX = (f * 6) % 1200 - 60;
  return (
    <g>
      <rect x={0} y={y - 12} width={W} height={300} fill="#2c2b24" />
      <rect x={0} y={y - 12} width={W} height={6} fill="#4b4a40" />
      {figs.map((fg, i) => {
        const dx = a * (Math.sin(f * 0.05 + i) * 6);
        return (
          <g key={i} transform={`translate(${fg.x + dx} ${y + 130})`}>
            {fg.kind === 'rider' && (
              <g fill={glow}>
                <ellipse cx={0} cy={0} rx={70} ry={34} />
                <rect x={-60} y={24} width={12} height={60} />
                <rect x={40} y={24} width={12} height={60} />
                <path d="M 60 -10 L 96 -40 L 104 -28 L 70 6 Z" />
                <circle cx={-10} cy={-58} r={18} />
                <rect x={-26} y={-44} width={30} height={46} rx={8} />
                <path d="M -10 -46 L 40 -90" stroke={glow} strokeWidth={8} />
              </g>
            )}
            {fg.kind === 'explorer' && (
              <g fill={glow}>
                <circle cx={0} cy={-82} r={18} />
                <rect x={-30} y={-62} width={8} height={28} transform="rotate(-18 -26 -62)" />
                <rect x={-28} y={-62} width={56} height={6} />
                <rect x={-22} y={-58} width={44} height={70} rx={8} />
                <rect x={-10} y={0} width={10} height={64} />
                <rect x={6} y={0} width={10} height={64} />
                <rect x={18} y={-34} width={40} height={26} rx={3} fill="#c9b27a" opacity={0.7 + 0.3 * a} />
              </g>
            )}
            {fg.kind === 'phone' && (
              <g fill={glow}>
                <circle cx={0} cy={-82} r={18} />
                <rect x={-22} y={-62} width={44} height={70} rx={8} />
                <rect x={-10} y={0} width={10} height={64} />
                <rect x={6} y={0} width={10} height={64} />
                <rect x={18} y={-54} width={18} height={30} rx={3} fill={a > 0.5 ? '#9dffc4' : '#2f3a33'} />
              </g>
            )}
          </g>
        );
      })}
      {/* the glowing arrow that the figures follow */}
      <g opacity={a} transform={`translate(${arrowX} ${y + 60})`}>
        <polygon points="0,-18 60,0 0,18 14,0" fill={COL.glowGreen} />
        <rect x={-260} y={-4} width={260} height={8} fill={COL.glowGreen} opacity={0.6} />
      </g>
    </g>
  );
};

/** Hall wall eyes that open one by one. `opens` holds 0..1 per eye. */
export const WallEyes: React.FC<{opens: number[]; xs: number[]; y: number; w?: number}> = ({opens, xs, y, w = 90}) => {
  const uid = safeId(useId());
  return (
    <g>
      <defs>
        <filter id={`eglow${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      {xs.map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={w * 0.8} ry={w * 0.4} fill={COL.glowGreen} opacity={0.4 * clamp(opens[i] ?? 0)} filter={`url(#eglow${uid})`} />
          <CarvedEye x={x} y={y} w={w} open={opens[i] ?? 0} id={uid} />
        </g>
      ))}
    </g>
  );
};

