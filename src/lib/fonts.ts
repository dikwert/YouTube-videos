import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

/** Captions and titles use Montserrat ExtraBold (800). loadFont holds the render until the file is ready. */
export const CAPTION_FONT = 'Montserrat';

loadFont({
  family: CAPTION_FONT,
  url: staticFile('fonts/Montserrat-ExtraBold.woff2'),
  weight: '800',
  display: 'block',
}).catch((err) => {
  console.error('Montserrat failed to load, using fallback font', err);
});
