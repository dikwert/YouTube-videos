import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {ShotArrest} from './shots';
import {FONT} from './lib';

// Обложка 1080x1920: Уолтер в шоке в дверях, рука полицейского на плече, часы 9:00 за спиной.
// Текст — в центральной безопасной зоне (Shorts обрезает около половины кадра).
export const LateCover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', inset: 0}}>
      <ShotArrest t={0.9} />
    </div>
    <div style={{position: 'absolute', left: '6%', width: '88%', top: '34%', textAlign: 'center', fontFamily: FONT, fontWeight: 800,
      fontSize: 118, lineHeight: 1.02, color: '#FFD60A', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill' as any,
      textShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>
      ARRESTED FOR BEING ON TIME
    </div>
  </AbsoluteFill>
);
