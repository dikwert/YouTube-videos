# I'M A JANITOR. I JUST WOKE UP IN ORBIT — script and sources

Narrator: Gary, 52, night janitor (first person). English only. Target 60–70 s.

## Real facts (checked; sources below)

**Fact 1: speed in orbit.** Script: "I was going seventeen thousand miles per hour."
- NASA gives about 17,500 mph for the ISS. The speed changes a little with altitude (roughly 17,100–17,500 mph), so "seventeen thousand" is a rounded, correct figure.
- Sources:
  - NASA, ISS lithograph (2023): https://www.nasa.gov/wp-content/uploads/2023/06/lg-2023-05-010-jsc-iss-litho-updates.pdf
  - NASA Goddard, HD Earth Views (about 17,500 mph, one orbit about every 90 minutes): https://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=10766

**Fact 2: height in orbit.** Script: "Astronauts grow up to two inches."
- NASA's estimate is up to about 3% of body height, about 2 inches for a 6-foot person.
- The gain is temporary: the spine lengthens in weightlessness, and height returns in the months after landing. The script does not say it is permanent.
- Sources:
  - Space.com, "Strange But True: Astronauts Get Taller in Space": https://www.space.com/19116-astronauts-taller-space-spines.html
  - Canadian Space Agency, "See why astronauts are taller in space": https://www.asc-csa.gc.ca/eng/activities/fun-experiments/astronauts-taller-in-space.asp

**Fact 3: drinking water from urine.** Script: "on the station, you drink recycled pee."
- NASA's water recovery system reclaims urine, sweat and condensed humidity into drinking water, with about 98% total water recovery.
- The water is distilled and filtered, not raw urine. The line is a joke with a real basis.
- Sources:
  - NASA, water recovery milestone: https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station
  - Space.com, "NASA just recycled 98% of all astronaut pee and sweat on the ISS": https://www.space.com/astronaut-pee-iss-water-recycling-98-percent-milestone

Verification note: the facts were checked against NASA pages and science news summaries. Open the NASA pages before publishing.

## Fiction and brands

Orbita Space Center, Halo Station, Gary, Linda, Mr. Pike, Major Whiskers (the cat) and the parking lot are invented. There are no NASA or SpaceX logos, no real flags, and the capsule and rockets are generic.

## Voice

- Mike - Animation, Explainers & Gaming (ElevenLabs voice cBTYF7NiJbR8Bvmdeuse) could NOT be used on this key and plan. Adding it to the account returns 401 (the key lacks voices_write), and synthesis returns 402 (the free plan cannot use library voices).
- Fallback used: Brian - Deep, Resonant and Comforting (premade, nPczCjzI2devNBz1zQrb), eleven_v3, stability 0.35, similarity 0.80, style 0.35.
- The "Long silence." line is narration, delivered deadpan, followed by 1 s of silence while the camera pushes in on the control room.

## Full script (as written)

I'm a janitor. I just woke up in orbit.

Gary. Fifty-two. Night shift at the space center. The capsule seat was the comfiest chair in the building.

So I took a nap. Ten minutes. Tops.

I woke up to a countdown. "Three... two... one..." It was an unmanned cargo launch. Well. It was.

Eight minutes later, I was going seventeen thousand miles per hour. My mop was floating. So was my sandwich.

Mission Control called on the radio. "Who is this?" "Gary. From cleaning." Long silence.

Fun fact: in space, your spine stretches. Astronauts grow up to two inches. For the first time in my life... I was six feet tall.

I docked at the station. Nobody was home. Just a cat. An experiment cat. He looked at me like I was the experiment.

Fun fact two: on the station, you drink recycled pee. The cat didn't. The cat was smarter.

Three days later, they brought me home. Luckily... the landing was perfect. Unluckily... it was the parking lot. On my car.

Now capsules lock at night. And janitors nap in the break room.

Then my boss called. "Gary... you missed a spot."

## Production notes

- **Voice.** The take is Brian (premade, eleven_v3, stability 0.35, similarity 0.80, style 0.35); Mike was not usable on this key and plan (see Voice above). `scripts/janitor-voice.mjs` writes `voice/raw_48k.wav` and `voice/words_raw.json`. `scripts/janitor-voice-fit.py` fits the take to about 66 s (pauses after "Long silence.", tempo 1.198 with pitch kept) and writes `public/audio/janitor/voice.wav` and `voice/words.json`.
- **Picture.** 28 shots in `src/janitor/shots.tsx`, timed to `voice/words.json`. Subtitle cards come from `scripts/janitor-timing.py`: 2 to 4 words, with the red keys ORBIT, RECYCLED PEE and MY CAR on their first card only. Stills every 2 s went through three Opus max review rounds; the last round found no blocker.
- **Sound.** An original score (G, E minor, C, D at 124 BPM) and synthesized effects, placed at word times by `scripts/janitor-mix.py`. Standard mix: music +3 dB, SFX -6 dB against the voice's speech level, and the voice unchanged in level. The score ducks under speech over 0.3 s and drops out for the countdown, "Long silence." and the impact.
- **Loudness.** The master is `loudnorm` with a -14 LUFS target and a -1.5 dBTP ceiling, as in PilotShort. The result is -16.0 LUFS. The voice's peaks sit about 20 dB above its average, so the ceiling binds before -14. Reaching -14 would need limiting that flattens the voice, which the mix standard excludes. The dynamic master pass does change the voice's envelope slightly.
- **Cover.** `out/janitor_cover.png`, 1080x1920, frame 45: the title in the centre, Gary floating with the mop, Earth through the window.
- **Limits.** The narrator is Brian, not Mike. The facts need a check against the NASA pages above before publishing. Shading is flat, with no depth of field. The score and effects are synthesized, not licensed. `templates/bridge/` is not in this repository, so the project follows the PilotShort pipeline.

## Status of this round

- **Voice: not yet replaced.** The paragraph-by-paragraph script (`scripts/janitor-voice2.mjs`, eleven_multilingual_v2, neighbours as context) is ready, but the ElevenLabs quota is almost used up (72 of 10,000 credits), and the library voice "Mike - Animation, Explainers & Gaming" returns 402 on the free plan. Output formats above mp3_44100_128 need a paid plan (pcm_44100 needs Pro; mp3_44100_192 needs Creator). Verification needs the Whisper weights from Hugging Face, which are not reachable from this sandbox; ElevenLabs speech-to-text works and can replace them. A local voice (Kokoro, `am_michael`) needs a permission rule for downloads from GitHub and PyPI.
- **Picture:** colour and detail in every location (control room, station, break room, office, parking lot, capsule, hangar, space). Shot timings are unchanged. Checked by the Opus max verifier over four rounds on the 10% rule; the last round found nothing over 10% that was not already borderline.
- **Mix:** the music ducks -6 dB under speech on an 80 ms attack and a 300 ms release; the sound effects duck -12 dB under speech. 18 of the 20 effects sit on words by design (the countdown numbers, "My mop", "Gary.") so that the picture reactions stay in sync; the mix script reports them.
- **Master:** still -14 LUFS with a -1.5 dBTP ceiling, which measures -16.2 LUFS because the voice's peaks set the ceiling. For the new voice the target is -16 LUFS for the voice with a -1 dBTP ceiling, as requested.
- **Preview:** `out/janitor_excerpt_15s.mp4`, 24 to 39 s at 1080x1920, with the current voice.
- **Voice fit (this round).** `scripts/janitor-voice-warp.py` puts each take back on the old timeline, frozen in `voice/words_v1.json`, which the picture is timed to. Anchors keep their old onsets: paragraph starts, the word nearest each shot cut and sound event, sentence starts and clause ends. Each take is first rebuilt with the old gaps between its words, because the new voice's pauses run up to about 4 times longer than the old ones, while its words run about 4% longer. The speech between two anchors is then stretched by one tempo, pitch kept, within 0.85 to 1.25; a piece that would need more is split at its middle word. On the six takes that exist (84 of 193 words) the anchors land within 4 ms, the tempo median is 0.99 (p10 0.82, p90 1.24), and 0.2 s of speech is still cut in one phrase where a single word runs about 1.6 times its old slot. The 150 ms pads from the brief do not fit this timeline (the old paragraphs join with about 50 ms), so the fit adds none. The final run writes nothing until every paragraph has a take and the cut is under 20 ms. `voice/words.json` is then regenerated from the fitted audio, so the subtitles follow the new voice.
- **Voice update.** All 12 paragraphs are now generated with Brian (eleven_multilingual_v2, stability 0.50, similarity 0.75, style 0, speaker boost on, mp3_44100_128) in `voice/takes/`. Mike is still not available: the key is on the free plan, which returns 402 for library voices, and mp3_44100_192 returns 403 (Creator tier and above). The fit (`scripts/janitor-voice-warp.py --test`) places all 193 words, with the anchors exact to 4 ms and a tempo median of 0.97. Five beats need 1.3 to 1.7 times speed to fit their old slots, which costs about 0.9 s of speech, mostly in "I was six feet tall": the six-feet beat is 1.15 s long and the line takes about 2 s. The final run therefore writes nothing. The choice is either a slightly longer scene for those beats (total +1 to 2 s, still inside 60 to 70 s) or a faster narration (generation speed about 1.2, which changes the voice's pace).
