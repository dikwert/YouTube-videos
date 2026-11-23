# HIS GPS KNEW HIS NAME

A 5-part vertical mystery series for YouTube Shorts, built with [Remotion](https://www.remotion.dev).
Every part is 1080x1920, 30 fps, 60 seconds, with burned-in captions (2-4 words at a time).

| Part | Title | Composition | Output |
|------|-------|-------------|--------|
| 1 | Turn Left | `Part1` | `out/part1.mp4` |
| 2 | The Jeep Inside | `Part2` | `out/part2.mp4` |
| 3 | The Recording | `Part3` | `out/part3.mp4` |
| 4 | Recalculating | `Part4` | `out/part4.mp4` |
| 5 | Turn Right | `Part5` | `out/part5.mp4` |

Thumbnails: `Cover1` ... `Cover5` (1080x1920 stills) render to `out/part1_cover.png` ... `out/part5_cover.png`.

## Setup

```bash
npm install
npm run audio      # generates public/sfx/*.wav, public/music.mp3 (only when missing) and src/assets.generated.ts
npm run start      # Remotion Studio, to preview any part
```

## Text deliverables

- `out/partN_voiceover.txt`: voiceover text, one phrase of 3-4 words per line (regenerate with `node scripts/export-voiceover.mjs`)
- `out/partN_description.txt`: intrigue lines, calls to action and hashtags for each part
- `node scripts/check-script.mjs` checks the caption rules: at most 4 highlighted words per part, at least 15 s between highlights

## Render

```bash
npm run render:all         # all five parts, then the five covers
node scripts/render-all.mjs parts 2 4     # only some parts
npm run covers             # the five cover stills
```

`remotion.config.ts` uses the sandbox Chromium when it is present and falls back to Remotion's own browser otherwise.

## Layout

```
src/
  Root.tsx                 compositions (Part1-5) and covers (Cover1-5)
  lib/                     timing, palettes (colour arc), seeded randomness, colour helpers
  scene/Camera.tsx         camera rig: pan, zoom, rotation, shake, parallax layers
  scene/Environment.tsx    sky, canopy, trunks, swaying leaves, fog, light rays, dust, vines, birds
  characters/Mason.tsx     MASON (and FUTURE MASON via the `future` prop), shared rig and proportions
  characters/Gps.tsx       THE GPS: blue navigator, glitch, green creepy mode, spiral map, cracked variant
  characters/Vehicles.tsx  THE JEEP (side, top-down, rusted), truck, driver, old cars and carts
  characters/Temple.tsx    TEMPLE facade, one-point corridor with carved faces, frieze, hall eyes
  characters/Props.tsx     flashlight and beam, recorder UI, falling flakes, shards, flashes
  parts/shared.tsx         the jeep cockpit scene and GPS close-up
  parts/Part1-5.tsx        the scene timelines for each part
  ui/Captions.tsx          word-by-word captions, current word in yellow
  ui/Cards.tsx             "PART X" title (first second) and "PART X+1 →" / "THE END?" (last second)
  ui/AudioMix.tsx          music bed with dips, voiceover hook, sound effects
  script/parts.ts          caption lines, music dips
  thumbs/Covers.tsx        the five thumbnail compositions
scripts/
  generate-audio.mjs       procedural SFX and music bed
  render-all.mjs           renders parts and covers
  preview.mjs              renders PNG stills at chosen frames (for checking)
```

## Things to know

- **Captions** are driven by `src/script/dialogue.json`. Timing is estimated from the scene beats until the real voiceover exists.
- **Voiceovers are not in the project yet.** `public/voiceover1.mp3` ... `voiceover5.mp3` were not present when this was built, so each part was timed from the script beats and estimated speaking pace. Drop the files into `public/`, run `npm run audio` (it refreshes `src/assets.generated.ts`), and the voice tracks are included automatically. If the ElevenLabs takes differ from the draft captions in `src/script/parts.ts`, edit the `s`/`e` seconds there.
- **Caption text is a draft.** It is written to match the scene beats. Replace the lines in `src/script/parts.ts` with the exact voiceover script if it differs.
- **Music and sound effects are placeholders.** No `public/music.mp3` or `public/sfx/` files existed, so `npm run audio` generated simple procedural versions. Any file you place in `public/music.mp3` or `public/sfx/<name>.wav` is used instead, because the generator only writes missing files.
- **Recording date.** The timestamp in Part 3 is set in `src/lib/theme.ts` (`TOMORROW_LABEL`, currently "NOV 24, 2026", the day after the series date).
- **Shorts safe area.** Text and key art stay inside `SAFE` in `src/lib/theme.ts`. Captions sit at about 70% of the frame height, clear of the right-side buttons and the bottom caption area.
