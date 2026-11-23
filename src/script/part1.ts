/**
 * PART 1 - "ETHAN NEVER TOLD IT HIS NAME". Times are seconds from the start of the part.
 *
 * The voice lines are the script. Each line lists its own subtitle cards (2-4 words each); the cards
 * share the line's time window in proportion to their word count. Once a voice is chosen, the windows
 * are replaced by the timestamps from ElevenLabs.
 */
export type Card = {s: number; e: number; text: string; keys?: string[]};
export type VoiceLine = {
  s: number;
  e: number;
  who: 'narrator' | 'ethan' | 'gps';
  /** Exactly what the voice says. */
  text: string;
  /** The same words, cut into subtitle cards of 2-4 words. */
  cards: string[];
  /** Red keywords in this line (plain colour, no effects). */
  keys?: string[];
};

export const VOICE: VoiceLine[] = [
  {s: 0.4, e: 2.9, who: 'narrator', text: 'Ethan never told it his name.', cards: ['ETHAN NEVER TOLD IT', 'HIS NAME.'], keys: ['NAME']},
  {s: 6.2, e: 8.8, who: 'ethan', text: "Okay, guys, we're officially off the map.", cards: ["OKAY, GUYS, WE'RE", 'OFFICIALLY OFF THE MAP.']},
  {s: 9.0, e: 11.6, who: 'ethan', text: 'Two hours of mud. Zero regrets.', cards: ['TWO HOURS OF MUD.', 'ZERO REGRETS.']},
  {s: 12.0, e: 14.6, who: 'narrator', text: 'Ethan Cole rented a jeep in Borneo.', cards: ['ETHAN COLE,', 'RENTED A JEEP', 'IN BORNEO.']},
  {s: 16.0, e: 18.2, who: 'gps', text: 'Signal lost. Recalculating.', cards: ['SIGNAL LOST. RECALCULATING.']},
  {s: 19.4, e: 21.8, who: 'ethan', text: 'Wait... where are you taking me?', cards: ['WAIT... WHERE ARE YOU', 'TAKING ME?']},
  {s: 26.0, e: 27.8, who: 'ethan', text: 'Nope. Turning around.', cards: ['NOPE. TURNING AROUND.']},
  {s: 29.6, e: 31.4, who: 'gps', text: 'Please continue, Ethan.', cards: ['PLEASE CONTINUE, ETHAN.'], keys: ['ETHAN']},
  {s: 32.6, e: 34.8, who: 'narrator', text: 'He never typed in his name.', cards: ['HE NEVER TYPED', 'IN HIS NAME.']},
  {s: 37.0, e: 39.4, who: 'narrator', text: 'Same jeep. Same plate. Same camera.', cards: ['SAME JEEP. SAME PLATE.', 'SAME CAMERA.']},
  {s: 40.4, e: 42.2, who: 'ethan', text: "That's my jeep.", cards: ["THAT'S MY JEEP."]},
  {s: 43.0, e: 46.0, who: 'narrator', text: 'Except this one had been here for years.', cards: ['EXCEPT THIS ONE', 'HAD BEEN HERE', 'FOR YEARS.']},
  {s: 48.6, e: 51.2, who: 'narrator', text: 'Inside, an old GPS was still on.', cards: ['INSIDE, AN OLD GPS', 'WAS STILL ON.']},
  {s: 52.4, e: 55.0, who: 'gps', text: 'Welcome back, Ethan.', cards: ['WELCOME BACK, ETHAN.'], keys: ['WELCOME BACK']},
];

const words = (t: string) => t.split(' ').length;

/** Subtitle cards cut from VOICE: each line's cards share its window in proportion to their word count. */
export const SUBTITLES: Card[] = VOICE.flatMap((line) => {
  const total = line.cards.reduce((n, c) => n + words(c), 0);
  let t = line.s;
  return line.cards.map((text) => {
    const dur = ((line.e - line.s) * words(text)) / total;
    const card: Card = {s: t, e: t + dur, text, keys: line.keys};
    t += dur;
    return card;
  });
});

/** The chapter card: on screen only, not spoken. */
export const CHAPTER_CARD = {s: 3.6, e: 5.4, text: '6 HOURS EARLIER'};

/** Lightning flashes, in seconds from the start of the part. */
export const LIGHTNING = [18.2, 47.6];
