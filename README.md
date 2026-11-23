# HIS GPS KNEW HIS NAME

A 5-part vertical mystery series for YouTube Shorts, built with [Remotion](https://www.remotion.dev).
Every part is 1080x1920, 30 fps, 60 seconds, with a spoken voice and burned-in subtitles.

The series was restarted in `b0788e0`; the earlier scenes, voices and subtitles remain in git history.

| Part | Name | Composition | MP4 | Cover | Voiceover text |
|------|------|-------------|-----|-------|----------------|
| 1 | Ethan never told it his name | `Part1` | `out/part1.mp4` | `out/part1_cover.png` | `out/part1_voiceover.txt` |
| 2 | The other jeep | `Part2` | `out/part2.mp4` | `out/part2_cover.png` | `out/part2_voiceover.txt` |
| 3 | The temple | `Part3` | `out/part3.mp4` | `out/part3_cover.png` | `out/part3_voiceover.txt` |
| 4 | The driver | `Part4` | `out/part4.mp4` | `out/part4_cover.png` | `out/part4_voiceover.txt` |
| 5 | Recalculating | `Part5` | `out/part5.mp4` | `out/part5_cover.png` | `out/part5_voiceover.txt` |

MP4 files are not committed (they are large); render them with the commands below.

## The story

Ethan Cole (28, travel vlogger) rents an off-road jeep on Borneo. His navigator knows his name. An abandoned jeep of the same make, with the same plate and camera, leads him to a stone temple full of rusted navigators with names on their screens. The last screen is empty and types his name. An older, silent version of him is pulled into the dark. In the end, his own jeep starts, and the old camera is recording in the mirror.

## Setup

```bash
npm install
npm start           # Remotion Studio
npm run typecheck
```

## Voice

- The ElevenLabs key is a network secret for `api.elevenlabs.io`. It is never written into the code.
- `voice/cast.json`: the model (`eleven_v3`), the voice settings per role and the voice chosen for each role.
- `voice/partN.json`: the spoken lines of each part (text, speaker, start time, subtitle cards, red keywords), plus its sound effects and rain bed.
- `node scripts/voice-build.mjs voice/partN.json`: makes the voice with timestamps, processes the clips into `public/audio/partN/`, times the subtitles from the character timestamps, checks the rules (2-4 words per card, 2-4 red keywords 15 s apart, lines do not overlap) and writes `src/script/generated/partN.ts`. Responses are cached in `voice/takes/` (ignored by git), so a rebuild costs no new requests unless a line changes.
- `node scripts/voiceover-text.mjs voice/partN.json`: writes `out/partN_voiceover.txt`, 3-4 words per line.

## Render

```bash
node scripts/preview.mjs Part2 <dir> <frame...>   # PNG stills, e.g. for a contact sheet
node scripts/render-all.mjs covers 1 2 3 4 5      # out/partN_cover.png
node scripts/render-all.mjs parts 1 2 3 4 5       # out/partN.mp4 with voice and sound
node scripts/render-preview.mjs Part1 <out.mp4>   # silent MP4 for a quick look
```

## Layout

```
src/
  Root.tsx               compositions Part1-Part5 and the covers Cover1-Cover5
  lib/                   theme (size, fps, palette), camera rig, maths, fonts
  forest/Forest.tsx      leaves, trunks, vines and puddles in seven depth layers
  rain/Rain.tsx          three rain layers, ground splashes, lightning
  car/Suv.tsx            off-road SUV, side view (roof rack, jerrycan, snorkel, spare, winch, lights)
  car/Cabin.tsx          the cabin in three shots: A over the shoulder, B side profile, C navigator close-up
  car/Navigator.tsx      navigator on a suction-cup bracket, screen glow
  car/Props.tsx          handheld camera and its screen, boot prints, mud
  ethan/Ethan.tsx        Ethan standing or walking, with lip-sync mouth and expressions
  gps/GpsUnit.tsx        the navigator screen: route, no signal, recalculating, welcome, off
  temple/Temple.tsx      the temple facade, the wall device with its name
  audio/AudioPlan.tsx    places the voice lines, sound effects and bed on the timeline
  ui/Subtitles.tsx       subtitles: one size, yellow, red keywords
  ui/Title.tsx           chapter card
  ui/Stage.tsx           SVG stage with background and vignette
  parts/Part1-5.tsx      scenes and timelines
  script/generated/      subtitles and audio plan, written by voice-build (do not edit)
  thumbs/CoverPart.tsx   the cover template
voice/                   cast.json, partN.json (the spoken lines)
public/audio/partN/      processed voice clips and rain bed
scripts/                 voice-build, voiceover-text, preview, render-all, render-preview
docs/series-outline.md   the series outline
```
