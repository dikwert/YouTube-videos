import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {Harold, Margaret, Paper} from './art';
import {FONT, INK} from './theme';

// Обложка 1080x1920: Гарольд с книгой, квитанция «$1,200,000» за спиной, Маргарет справа; текст в центральной зоне.
export const HaroldCover: React.FC = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f = new FontFace(FONT, `url(${staticFile('harold/Montserrat-ExtraBold-latin.woff2')})`, {weight: '800'});
    f.load()
      .then((ff) => {
        document.fonts.add(ff);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
  const line = (y: number, text: string) => (
    <text x={540} y={y} fontFamily={FONT} fontWeight={800} fontSize={100} fill="#FFD60A" stroke={INK} strokeWidth={14} paintOrder="stroke" textAnchor="middle">{text}</text>
  );
  return (
    <AbsoluteFill style={{background: '#f2a46a'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id="cover-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2a46a" />
            <stop offset="1" stopColor="#6b3d5a" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#cover-sky)" />
        <Paper x={90} y={200} w={900} h={380} rot={-5} lines={['$1,200,000', 'LIBRARY FINE']} size={100} tone="#f4ecd8" />
        <Harold x={440} y={1840} s={1.25} t={0} pose="hold" seed={1} />
        <Margaret x={900} y={1840} s={0.6} t={0} mood="wide" seed={3} />
        {line(1080, 'HE OWED $1.2M')}
        {line(1200, 'FOR A LIBRARY')}
        {line(1320, 'BOOK')}
      </svg>
    </AbsoluteFill>
  );
};
