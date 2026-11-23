import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAPTION_FONT} from '../lib/fonts';
import {Forest} from '../forest/Forest';
import {Rain} from '../rain/Rain';
import {GpsUnit} from '../gps/GpsUnit';
import {Stage} from '../ui/Stage';

const TYPE = `${CAPTION_FONT}, Arial Black, sans-serif`;

/**
 * Cover (1080x1920): "PART N" and the series title in the centre safe zone, the part's name under them,
 * the navigator in the rain below.
 */
export const CoverPart: React.FC<{n: number; name: string; seed?: number}> = ({n, name, seed = 3}) => (
  <AbsoluteFill>
    <Stage>
      <Forest seed={seed} dark={0.35} />
      <Rain strength={1} wind={0.3} />
      <GpsUnit x={540} y={1490} s={1} mode="route" instruction="300 ft · Turn left" />
    </Stage>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 62%)'}} />
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: TYPE,
        fontWeight: 800,
        textTransform: 'uppercase',
      }}
    >
      <div
        style={{
          color: '#FFD60A',
          fontSize: 64,
          letterSpacing: 10,
          WebkitTextStroke: '9px #000',
          paintOrder: 'stroke fill',
          marginBottom: 30,
        }}
      >
        PART {n}
      </div>
      <div
        style={{
          color: '#FFFFFF',
          fontSize: 104,
          lineHeight: 1.04,
          WebkitTextStroke: '14px #000',
          paintOrder: 'stroke fill',
          textShadow: '0 10px 30px rgba(0,0,0,0.8)',
        }}
      >
        HIS GPS KNEW
        <br />
        HIS NAME
      </div>
      <div
        style={{
          color: '#FFD60A',
          fontSize: 56,
          letterSpacing: 4,
          marginTop: 40,
          WebkitTextStroke: '10px #000',
          paintOrder: 'stroke fill',
        }}
      >
        {name}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
