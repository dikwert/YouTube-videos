# THE PILOT WENT TO THE BATHROOM — script and sources

Narrator: Kevin (first person). English only. Target 60–68 s. Current text: 185 words.

## Real facts (checked; sources below)

**Fact 1: meals.** Many airlines make pilots eat different meals, so one bad meal is less likely to take out both pilots.
- Changed from "pilots never eat the same meal" (too absolute): the practice is recommended and common, not universal.
- The rule is set by each airline, not by a government mandate. Some airlines apply it "wherever possible".
- Caveat from the same sources: a shared meal before duty can undercut the safeguard.
- Sources:
  - SKYbrary, "Food Poisoning" (recommends different dishes for both operating pilots): https://skybrary.aero/index.php/Food_Poisoning
  - Yahoo News, "Why pilots eat different meals from you – and different meals from one another": https://sg.news.yahoo.com/why-pilots-eat-different-meals-133510292.html
  - The Star (QuickCheck), "Do pilots and co-pilots consume different meals on flights?" (2023): https://thestar.com.my/news/true-or-not/2023/06/09/quickcheck-do-pilots-and-co-pilots-consume-different-meals-on-flights

**Fact 2: cockpit doors.** Since 2003, cockpit doors on US airliners must resist bullets (and forced entry).
- Changed from "since 2001, cockpit doors are bulletproof": the law was passed in November 2001, but the compliance deadline was 9 April 2003. "Bulletproof" was also too strong; the standard is bullet resistance.
- Sources:
  - Federal Register, 21 Nov 2001 (Aviation and Transportation Security Act, FAA tasked with hardening flight-deck doors): https://www.govinfo.gov/content/pkg/FR-2001-11-21/pdf/01-29280.pdf
  - Federal Register, 26 Apr 2005 (flight-deck security considerations for transport aircraft): https://www.govinfo.gov/content/pkg/FR-2005-04-26/pdf/05-8259.pdf
  - Business Travel News, "FAA Pushes For Bulletproof Cockpit Door Deadline": https://www.businesstravelnews.com/More-News/FAA-Pushes-For-Bulletproof-Cockpit-Door-Deadline
  - Fox News, "Government Steps Up Pressure to Meet Cockpit-Door Deadline": https://www.foxnews.com/story/government-steps-up-pressure-to-meet-cockpit-door-deadline
  - Boeing release, 9 Apr 2003 (deadline met): https://www.globalsecurity.org/security/library/news/2003/04/sec-030409-boeing01.htm
- Sources disagree on the number of affected aircraft (about 6,000 vs 7,000). The script does not use a number.
- Verification note: these were checked from search summaries. The Federal Register pages are the primary sources; open them before publishing.

## Full script (as written, with the two fact fixes)

The pilot went to the bathroom. Now I'm flying this plane.

Flight 312. Thirty-four thousand feet. I'm Kevin. Middle seat.

Fun fact: many airlines make pilots eat different meals. So food poisoning is less likely to get both. Our co-pilot ate the fish anyway.

He passed out. Right on the controls. The captain ran to the bathroom... and the lock jammed.

Gloria, our flight attendant, asked: "Does anyone here know how to fly?" I raised my hand. I'd played a flight simulator. Twice.

Since 2003, cockpit doors must resist bullets. So the captain shouted instructions through the bathroom door. Passengers passed them down the aisle.

"Pull up" became "pull up your socks." "Watch your speed" became "Grandma, watch your knitting." A kid in row nine yelled: "Do a barrel roll!" I did not do a barrel roll.

Then the clouds opened. No runway. Just a highway. Luckily... the highway was empty. Unluckily... it was the drive-thru lane.

We stopped. Right at the speaker. "Welcome! Can I take your order?"

The airline made a new rule: pilots now pee with the door open. And me? Free flights for life. Middle seat.

## Fiction
Flight 312, SKYPAL, Kevin, Captain Rick, Co-pilot Dave, Gloria, Grandma Edna, Tommy and the drive-thru cashier are invented. Burger shop, sign and livery carry no real brands.

## Voice
- Mike - Animation, Explainers & Gaming (ElevenLabs shared voice cBTYF7NiJbR8Bvmdeuse) could NOT be used: the API key lacks voices_write (add to account fails with 401) and free-plan API use of library voices returns 402 paid_plan_required.
- Fallback used until that is fixed: Will (premade, American, relaxed), eleven_v3, stability 0.35, similarity 0.80, style 0.35.

## Production notes (final)
- **Video:** `out/pilot_short.mp4`, 1440x2560, 30 fps, 2028 frames, 67.6 s, H.264 (crf 16) and AAC 48 kHz. Render: `node scripts/render-pilot.mjs video` (about 16 minutes on 4 cores with software WebGL).
- **Cover:** `out/pilot_cover.png`, 1080x1920, the hook frame at 1.0 s with the title below Kevin's face. Render: `node scripts/render-pilot.mjs cover 30`.
- **Voiceover text:** `out/pilot_voiceover.txt`, 190 words in 3–4 word lines, with the start time of each paragraph. Generator: `python3 scripts/pilot-voiceover-text.py`.
- **QA:** `python3 scripts/pilot-qa.py out/pilot_short.mp4` writes `out/pilot_qa.txt`. Result: PASS. Format, audio, and no black, white or frozen frames outside the hook flash.
- **Loudness:** −15.7 LUFS integrated, true peak −4.2 dBFS. The −14 LUFS target is not reached: raising the level would push the peaks past −1 dBFS.
- **Voice:** Will (premade, eleven_v3). The Mike voice is not available (see Voice above).
- **Visual checks:** contact sheets every 2 s, reviewed by an Opus max verifier over six rounds, then the frames of the final MP4.
- **Known limits:** flat unlit shading, no ink outlines on the sets (the characters and the airliner have plum outlines), and no depth of field. The drive-thru has no text sign: the rules forbid labels in the video, and the subtitle already says the words.
- **Subtitles:** a phrase sampled exactly on its first frame is at 50% opacity by design (a 100 ms fade).
