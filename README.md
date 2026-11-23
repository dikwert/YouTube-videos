# HIS GPS KNEW HIS NAME

A 5-part vertical mystery series for YouTube Shorts, built with [Remotion](https://www.remotion.dev).
Every part is 1080x1920, 30 fps, 55-65 seconds, with burned-in subtitles.

The series was restarted: the earlier scenes, voices and subtitles were removed in `b0788e0` and remain in git history.

| Part | Status | Composition | Output |
|------|--------|-------------|--------|
| 1 | visuals done, voice pending | `Part1` | `out/part1.mp4` |
| 2-5 | not started | - | - |

Cover: `Cover1` (1080x1920 still) renders to `out/part1_cover.png`.

## Part 1: "Ethan never told it his name."

Ethan Cole (28, travel vlogger) rents a jeep in Borneo. His GPS knows his name.

| Seconds | Scene |
|---------|-------|
| 0-3 | Hook: the navigator in close-up, glitching drops |
| 3-6 | Chapter card: "6 HOURS EARLIER" |
| 6-15 | Daylight drive; Ethan talks to his camera |
| 15-25 | Signal lost, "Recalculating.", rain and lightning |
| 25-35 | Narrow road, branches; "Please continue, Ethan." |
| 35-48 | Abandoned jeep: same model, same plate, same camera, under vines |
| 48-58 | Flashlight into the cabin; "Welcome back, Ethan." |
| 58-60 | A figure in the rain, sudden silence, 0.5 s black |

The spoken lines are in `src/script/part1.ts`. Subtitle cards are cut from them (2-4 words each), and the red keywords are listed there too.

## Setup

```bash
npm install
npm start           # Remotion Studio
npm run typecheck
```

## Render

```bash
node scripts/preview.mjs Part1 <dir> <frame...>   # PNG stills to check, e.g. for a contact sheet
node scripts/render-all.mjs covers 1              # out/part1_cover.png
node scripts/render-all.mjs parts 1               # out/part1.mp4 (the voice mix is added before this)
```

## Voice (ElevenLabs)

- The API key is a network secret for `api.elevenlabs.io`. It is never written into the code.
- Model `eleven_v3` (fallback `eleven_multilingual_v2`). Settings per role are in `voice/cast.json`.
- Candidate takes are in `voice-tests/`: three voices per role, two takes each, listed in `candidates.json`. `scripts/voice-test.mjs` makes them.
- After the choice, the final lines are generated with the `/with-timestamps` endpoint, and the subtitles are re-timed from those timestamps.

## Text deliverables

- `out/part1_voiceover.txt`: the voiceover text, 3-4 words per line, in spoken order.

## Layout

```
src/
  Root.tsx              compositions (Part1) and the cover (Cover1)
  lib/theme.ts          size, fps, palette, subtitle height (68% of the frame)
  lib/camera.tsx        camera rig: keyed zoom, pan, rotation, shake; parallax layers
  lib/math.ts           seeded randomness, keyframes, colour helpers
  lib/fonts.ts          Montserrat ExtraBold, loaded before frames render
  forest/Forest.tsx     leaves, trunks, vines and puddles in seven depth layers
  rain/Rain.tsx         three rain layers, ground splashes, lightning
  gps/GpsUnit.tsx       the navigator: route, no signal, recalculating, welcome
  jeep/Jeep.tsx         the jeep (side view) and the cockpit frame
  ethan/Ethan.tsx       Ethan: proportions, face, mouth for lip-sync, expressions
  ui/Stage.tsx          SVG stage with background and vignette
  ui/Subtitles.tsx      one subtitle size, yellow, red keywords
  ui/Title.tsx          chapter card
  script/part1.ts       spoken lines; subtitle cards are cut from them
  parts/Part1.tsx       scenes and timeline
  thumbs/Cover1.tsx     cover
scripts/
  preview.mjs           PNG stills at chosen frames
  render-all.mjs        renders parts and covers
  voice-test.mjs        candidate voice takes
```
