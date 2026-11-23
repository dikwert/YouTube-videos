import {Line} from '../ui/Captions';

/**
 * Burned-in captions per part, in seconds from the start of that part.
 * These are DRAFT lines written to match the scene beats. No voiceover files were present when this was built,
 * so timings are estimates. If your ElevenLabs takes differ, edit the `s`/`e` values here or paste the
 * transcript and the lines will be re-timed.
 */
export const CAPTIONS: Record<number, Line[]> = {
  1: [
    {s: 0.9, e: 3.4, t: 'Okay, this jungle road looks legit.', who: 'mason'},
    {s: 4.2, e: 7.2, t: "Hey, it's Mason. Shortcut time!", who: 'mason'},
    {s: 8.1, e: 9.9, t: 'Turn left', who: 'gps'},
    {s: 11.2, e: 13.2, t: 'Huh. Smaller road.', who: 'mason'},
    {s: 13.8, e: 15.8, t: 'Whoa! Branches everywhere!', who: 'mason'},
    {s: 16.6, e: 18.4, t: 'Turn left', who: 'gps'},
    {s: 19.0, e: 21.0, t: 'Why is the map spiraling?', who: 'mason'},
    {s: 21.4, e: 22.6, t: 'No, no, no. Come on!', who: 'mason'},
    {s: 23.0, e: 25.4, t: 'You have arrived', who: 'gps'},
    {s: 26.0, e: 27.8, t: 'Arrived where, exactly?', who: 'mason'},
    {s: 28.6, e: 30.6, t: 'Turn it off. Turn it off.', who: 'mason'},
    {s: 34.0, e: 36.4, t: 'Welcome back, Mason', who: 'gps'},
  ],
  2: [
    {s: 1.2, e: 3.4, t: "Okay. Flashlight. Don't be dumb.", who: 'mason'},
    {s: 4.4, e: 6.6, t: 'Why is it so cold in a jungle?', who: 'mason'},
    {s: 9.4, e: 11.4, t: 'Wait. Is that...', who: 'mason'},
    {s: 12.2, e: 14.6, t: 'My jeep? In a temple?', who: 'mason'},
    {s: 16.5, e: 18.4, t: 'Rusted solid. Roots everywhere.', who: 'mason'},
    {s: 20.6, e: 22.4, t: "That's my jerrycan.", who: 'mason'},
    {s: 23.4, e: 25.0, t: 'Hold on... the GPS is on?', who: 'mason'},
    {s: 25.4, e: 26.8, t: 'Turn left', who: 'gps'},
    {s: 28.4, e: 30.4, t: 'My old action camera?', who: 'mason'},
    {s: 32.0, e: 34.4, t: 'I never left this here. Did I?', who: 'mason'},
    {s: 34.8, e: 37.6, t: "I don't remember any of this.", who: 'mason'},
  ],
  3: [
    {s: 1.2, e: 3.2, t: 'Okay. Play it.', who: 'mason'},
    {s: 5.4, e: 8.2, t: 'Is that... me?', who: 'mason'},
    {s: 12.4, e: 15.2, t: "Don't trust the GPS.", who: 'future'},
    {s: 15.6, e: 18.4, t: "Don't turn left.", who: 'future'},
    {s: 21.2, e: 23.8, t: "Tomorrow? That's tomorrow.", who: 'mason'},
    {s: 26.6, e: 29.8, t: 'Behind me... the eyes are opening.', who: 'future'},
    {s: 36.4, e: 38.4, t: 'Mason... turn left.', who: 'voice'},
  ],
  4: [
    {s: 1.2, e: 3.8, t: 'Run. Run, run, run.', who: 'mason'},
    {s: 6.2, e: 8.6, t: 'The walls are moving!', who: 'mason'},
    {s: 8.8, e: 11.2, t: "They're all following the arrow.", who: 'mason'},
    {s: 12.6, e: 15.2, t: 'Empty. Every single one.', who: 'mason'},
    {s: 18.6, e: 21.2, t: "They're watching me.", who: 'mason'},
    {s: 24.2, e: 26.6, t: 'Recalculating', who: 'gps'},
    {s: 28.6, e: 31.2, t: 'Left or right? Left or right?', who: 'mason'},
    {s: 34.4, e: 37.4, t: 'Turn left, Mason. You always do.', who: 'gps'},
  ],
  5: [
    {s: 1.2, e: 3.4, t: "Right. I'm going right.", who: 'mason'},
    {s: 5.8, e: 7.8, t: 'Get off! Get off me!', who: 'mason'},
    {s: 10.6, e: 12.4, t: 'Shut up! Shut UP!', who: 'mason'},
    {s: 15.6, e: 18.2, t: 'Mason... turn left.', who: 'voice'},
    {s: 18.6, e: 20.6, t: 'Not listening. Not listening.', who: 'mason'},
    {s: 21.8, e: 23.8, t: 'A road? Sunlight!', who: 'mason'},
    {s: 27.2, e: 29.2, t: 'Lost, buddy? Hop in.', who: 'truck'},
    {s: 30.0, e: 32.4, t: 'Oh, thank you. Thank you.', who: 'mason'},
    {s: 34.4, e: 36.8, t: 'Welcome back, Mason', who: 'gps'},
  ],
};

/** Seconds at which the music bed dips to near silence (scary beats). */
export const MUSIC_DIPS: Record<number, Array<[number, number]>> = {
  1: [
    [19.4, 22.8],
    [33.4, 37.0],
  ],
  2: [
    [10.0, 13.0],
    [22.8, 24.2],
    [34.6, 39.0],
  ],
  3: [
    [26.2, 31.4],
    [31.6, 36.0],
  ],
  4: [
    [18.0, 23.2],
    [33.0, 39.0],
  ],
  5: [[28.2, 29.0]],
};
