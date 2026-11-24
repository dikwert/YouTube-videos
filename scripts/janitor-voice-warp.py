#!/usr/bin/env python3
"""Puts the new narration takes back on the picture's timeline.

The picture (shot cuts, reactions, subtitles) and the sound events were timed to the old narration. Its word times
are frozen in janitor-short/voice/words_v1.json, and the picture keeps them.

The new voice says the same words about 4% slower, but with pauses between words up to about 4 times longer. So each take is
first rebuilt with the old gaps between its words (a word keeps its own length). The result is then fitted onto the
old timeline piece by piece: the anchors (paragraph starts, the word nearest each shot cut and sound event, and the
sentence starts) keep their old onsets, and the speech between two anchors is stretched by one tempo, pitch kept,
within MIN_T..MAX_T. Word ends come from the audio (refine_ends), since the alignment often runs a word's end
on into the silence after it.

  python3 scripts/janitor-voice-warp.py --test   writes out/voice_warp_test.wav and prints the fit report
  python3 scripts/janitor-voice-warp.py          writes public/audio/janitor/voice.wav and voice/words.json,
                                                 only when every paragraph has a take and the gates pass

Takes: janitor-short/voice/takes/p{i}_t0.json (from scripts/janitor-voice2.mjs).
"""
import base64
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
VOICE = ROOT / 'janitor-short' / 'voice'
REF = VOICE / 'words_v1.json'  # frozen old timeline: the picture is timed to it
SCRIPT = VOICE / 'script.txt'
SHOTS = ROOT / 'src' / 'janitor' / 'shots.tsx'
MIX = ROOT / 'scripts' / 'janitor-mix.py'
OUT_WAV = ROOT / 'public' / 'audio' / 'janitor' / 'voice.wav'
OUT_WORDS = VOICE / 'words.json'
TEST_WAV = ROOT / 'out' / 'voice_warp_test.wav'
TOTAL = 66.0
PAD = 0.02        # silence kept before an anchor onset (s)
EDGE = 0.01       # audio kept before a word's onset (s)
TAIL = 0.02       # audio kept after a word inside a paragraph (s)
TAIL_END = 0.05   # audio kept after the last word of a paragraph (s)
MIN_GAP = 0.035   # the shortest gap between two words (s)
MIN_T, MAX_T = 0.85, 1.4  # tempo limits for one stretch (pitch kept); the last 1.25 to 1.4 is for two beats
MIN_SPAN = 0.6    # anchors closer than this on the old timeline: the less important one is dropped (s)
NEAR = 0.3        # a shot cut or sound event anchors the nearest word within this distance (s)
FADE = int(0.010 * SR)
VERBOSE = '--verbose' in sys.argv
_take = sys.argv[sys.argv.index('--take') + 1] if '--take' in sys.argv else '0'
TAKE = _take if _take == 'auto' else int(_take)  # a take number, or auto: the closest to each paragraph's old span
GATE_CUT = 0.02   # s of speech that may be cut in total
SENT_END = re.compile(r'[.!?…]["”\')\]]*$')


CLAUSE_END = re.compile(r'[,;:\u2014]["\u201d\')\]]*$')


def ffmpeg(args, data):
    return subprocess.run(['ffmpeg', '-loglevel', 'error', *args], input=data, capture_output=True, check=True).stdout


def decode(mp3):
    raw = ffmpeg(['-i', 'pipe:0', '-af', 'aresample=resampler=soxr', '-f', 'f32le', '-ac', '1', '-ar', str(SR),
                  'pipe:1'], mp3)
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def stretch(x, tempo):
    """Plays x tempo times faster (tempo > 1 shortens it); the pitch is kept."""
    raw = ffmpeg(['-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0',
                  '-af', f'atempo={tempo:.6f}', '-f', 'f32le', '-ar', str(SR), '-ac', '1', 'pipe:1'],
                 x.astype('<f4').tobytes())
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def paragraphs():
    text = SCRIPT.read_text(encoding='utf-8').strip()
    return [p.split() for p in re.split(r'\n\s*\n', text) if p.strip()]


def take(i, t):
    """Words of paragraph i in take t (onset and end in take time) and its decoded audio, or None if not generated."""
    path = VOICE / 'takes' / f'p{i}_t{t}.json'
    if not path.exists():
        return None
    d = json.loads(path.read_text(encoding='utf-8'))
    al = d['alignment']
    words, cur = [], None
    for ch, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if cur is not None:
                words.append(cur)
                cur = None
        else:
            if cur is None:
                cur = {'s': s, 'e': e}
            cur['e'] = e
    if cur is not None:
        words.append(cur)
    audio = decode(base64.b64decode(d['audio_base64']))
    refine_ends(words, audio)
    return words, audio


def refine_ends(words, audio):
    """The alignment can run a word's end on into the silence after it (the last word of a take often does).
    The end is taken from the audio instead: the last sample above 2% of the word's peak, looked for up to the
    next word's onset, or 0.3 s past the last word."""
    for j, w in enumerate(words):
        bound = words[j + 1]['s'] - 0.005 if j + 1 < len(words) else w['e'] + 0.3
        a, b = int(w['s'] * SR), int(min(bound, len(audio) / SR) * SR)
        seg = np.abs(audio[a:b])
        if seg.size == 0 or seg.max() <= 0:
            continue
        hot = np.nonzero(seg > 0.02 * seg.max())[0]
        if hot.size:
            w['e'] = min(w['s'] + (hot[-1] + 1) / SR, w['e'] + 0.1)


def relay(words, audio, gaps):
    """Rebuilds one take with the given gap (s) after each word but the last. Returns the audio and the onset and
    end of each word in the rebuilt audio."""
    n = len(words)
    lead = [min(EDGE, w['s']) for w in words]
    R = [0.0] * n
    R[0] = lead[0]
    for j in range(n - 1):
        R[j + 1] = R[j] + (words[j]['e'] - words[j]['s']) + gaps[j]
    RE = [R[j] + words[j]['e'] - words[j]['s'] for j in range(n)]
    ra = np.zeros(int(round((RE[-1] + TAIL_END) * SR)) + 1)
    for j, w in enumerate(words):
        if j + 1 < n:
            room = max(0.0, words[j + 1]['s'] - w['e'] - 0.005)
            tail = min(TAIL, gaps[j] / 2, room)
        else:
            tail = TAIL_END
        seg = audio[int(round((w['s'] - lead[j]) * SR)):int(round((w['e'] + tail) * SR))]
        s0 = int(round((R[j] - lead[j]) * SR))
        L = min(len(seg), len(ra) - s0)
        ra[s0:s0 + L] += seg[:L]
    return ra, np.array(R), np.array(RE)


def write_wav(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(x, -1.0, 1.0) * 32767).astype('<i2').tobytes())


def cut_times():
    return [float(x) for x in re.findall(r'\b[ab]: (\d+(?:\.\d+)?)', SHOTS.read_text(encoding='utf-8'))]


def event_times():
    text = MIX.read_text(encoding='utf-8')
    block = text[text.index('EVENTS = ['):]
    block = block[:block.index('\n]')]
    return [float(x) for x in re.findall(r'\(\s*(\d+\.\d+),\s*lambda', block)]


def candidates(counts, flat, OS):
    """Candidate anchors by importance: -1 paragraph start, 0 shot cut or sound event, 1 sentence start,
    2 clause end (a comma, semicolon or colon)."""
    cand = {int(g): -1 for g in np.cumsum([0] + counts[:-1])}
    for t in cut_times() + event_times():
        k = int(np.argmin(np.abs(OS - t)))
        if abs(OS[k] - t) <= NEAR:
            cand[k] = min(cand.get(k, 9), 0)
    for k in range(1, len(flat)):
        if SENT_END.search(flat[k - 1]):
            cand.setdefault(k, 1)
        elif CLAUSE_END.search(flat[k - 1]):
            cand.setdefault(k, 2)
    return cand


def select(cand, OS):
    """Keeps the most important anchors that are at least MIN_SPAN apart on the old timeline."""
    keep = []
    for k in sorted(cand, key=lambda k: OS[k]):
        while keep and OS[k] - OS[keep[-1]] < MIN_SPAN and cand[k] < cand[keep[-1]]:
            keep.pop()
        if not keep or OS[k] - OS[keep[-1]] >= MIN_SPAN:
            keep.append(k)
    return keep


def main(test):
    paras = paragraphs()
    counts = [len(p) for p in paras]
    flat = [w for p in paras for w in p]
    N = len(flat)
    ref = json.loads(REF.read_text(encoding='utf-8'))
    ref = ref if isinstance(ref, list) else ref['words']
    assert len(ref) == N == sum(counts), (len(ref), N)
    OS = np.array([w['s'] for w in ref], dtype=float)
    OE = np.array([w['e'] for w in ref], dtype=float)
    starts = [int(x) for x in np.cumsum([0] + counts)]
    cand = candidates(counts, flat, OS)
    keep = set(select(cand, OS))

    def paragraph_pieces(i, ra, R, RE, anchors):
        """The speech between two anchors of paragraph i: its place in the rebuilt take and on the old timeline."""
        g0, g1 = starts[i], starts[i + 1]
        found = []
        ks = sorted(k for k in anchors if g0 <= k < g1)
        for j, a in enumerate(ks):
            b = ks[j + 1] if j + 1 < len(ks) else g1
            p_a = min(PAD, R[a - g0], OS[a])
            in0, out0 = R[a - g0] - p_a, OS[a] - p_a
            if b < g1:
                p_b = min(PAD, R[b - g0], OS[b])
                in1, out1 = R[b - g0] - p_b, OS[b] - p_b
            else:
                in1 = len(ra) / SR
                out1 = (OS[g1] - PAD) if g1 < N else TOTAL
            if in1 <= in0 or out1 <= out0:
                raise SystemExit(f'paragraph {i}, anchor word {a}: empty piece')
            found.append({'i': i, 'a': a, 'b': b, 'in0': in0, 'in1': in1, 'out0': out0, 'out1': out1,
                          'tr': (in1 - in0) / (out1 - out0)})
        return found

    def pieces(anchors):
        found = []
        for i, (ra, R, RE) in rebuilt.items():
            found += paragraph_pieces(i, ra, R, RE, anchors)
        return found

    rebuilt, chosen, missing = {}, {}, []
    for i in range(len(paras)):
        g0, g1 = starts[i], starts[i + 1]
        gaps = [max(MIN_GAP, OS[g + 1] - OE[g]) for g in range(g0, g1 - 1)]
        best = None
        for t in ([0, 1, 2] if TAKE == 'auto' else [TAKE]):
            got = take(i, t)
            if got is None:
                continue
            words, audio = got
            if len(words) != counts[i]:
                raise SystemExit(f'paragraph {i} take {t}: {len(words)} words, the script has {counts[i]}')
            ra, R, RE = relay(words, audio, gaps)
            # a take costs its pieces' distance from natural speed, weighted by their length on the old timeline;
            # a piece above MAX_T also pays heavily, because its speech would be cut
            score = sum((abs(np.log(pc['tr'])) + 20 * max(0.0, pc['tr'] - MAX_T)) * (pc['out1'] - pc['out0'])
                        for pc in paragraph_pieces(i, ra, R, RE, keep))
            if best is None or score < best[0]:
                best = (score, t, ra, R, RE)
        if best is None:
            missing.append(i)
            continue
        chosen[i] = best[1]
        rebuilt[i] = best[2:]

    # a piece that would need more than MAX_T is split at the word nearest its middle, so no speech gets cut;
    # a split keeps MIN_SPAN on both sides, so no piece is left with a sliver of the old timeline
    for _ in range(3):
        bad = [pc for pc in pieces(keep) if pc['tr'] > MAX_T and pc['b'] - pc['a'] >= 2]
        if not bad:
            break
        for pc in bad:
            end = OS[pc['b']] if pc['b'] < N else TOTAL
            mid = 0.5 * (OS[pc['a']] + end)
            inner = [k for k in range(pc['a'] + 1, pc['b'])
                     if OS[k] - OS[pc['a']] >= MIN_SPAN and end - OS[k] >= MIN_SPAN]
            if inner:
                keep.add(min(inner, key=lambda k: abs(OS[k] - mid)))

    if not rebuilt:
        raise SystemExit('no takes found in janitor-short/voice/takes')
    out = np.zeros(int(round(TOTAL * SR)))
    pred_on, pred_end, raw, cut = {}, {}, [], 0.0
    for pc in pieces(keep):
        ra, R, RE = rebuilt[pc['i']]
        g0 = starts[pc['i']]
        tr = pc['tr']
        tu = min(max(tr, MIN_T), MAX_T)
        n_out = int(round((pc['out1'] - pc['out0']) * SR))
        x = ra[int(round(pc['in0'] * SR)):int(round(pc['in1'] * SR))]
        y = x if abs(tu - 1.0) < 0.004 else stretch(x, tu)
        trimmed = max(0.0, (len(y) - n_out) / SR)
        if trimmed > 0:
            y = y[:n_out]
        # the piece ends in PAD seconds of silence before the next anchor; only trimming beyond that cuts speech
        cut += max(0.0, trimmed - PAD)
        if len(y) < n_out:
            y = np.pad(y, (0, n_out - len(y)))
        y[:FADE] *= np.linspace(0.0, 1.0, FADE)
        y[n_out - FADE:] *= np.linspace(1.0, 0.0, FADE)
        s0 = int(round(pc['out0'] * SR))
        L = min(n_out, len(out) - s0)
        out[s0:s0 + L] = y[:L]
        raw.append(tr)
        for jj in range(pc['a'] - g0, pc['b'] - g0):
            pred_on[g0 + jj] = pc['out0'] + (R[jj] - pc['in0']) / tu
            pred_end[g0 + jj] = pc['out0'] + (RE[jj] - pc['in0']) / tu
        if VERBOSE:
            print(f"p{pc['i']} anchor {pc['a']} ({flat[pc['a']]}) to {pc['b']}: old {pc['out0']:.3f}-{pc['out1']:.3f} "
                  f"recon {pc['in0']:.3f}-{pc['in1']:.3f} tempo {tr:.3f} trimmed {trimmed * 1000:.1f} ms")

    tp = np.array(raw)
    fitted = sorted(pred_on)
    err = np.array([pred_on[g] - OS[g] for g in fitted if g not in keep])
    anc = np.array([pred_on[g] - OS[g] for g in fitted if g in keep])
    a_err = np.abs(err)
    held = int(np.sum((tp < MIN_T) | (tp > MAX_T)))
    print(f'takes: paragraphs {sorted(rebuilt)}; missing {missing} ({sum(counts[i] for i in missing)} words)')
    print('take per paragraph:', chosen)
    print(f'anchors: {len(keep)} kept of {len(cand)} candidates (MIN_SPAN {MIN_SPAN} s)')
    print(f'pieces: {len(tp)}; tempo min {tp.min():.3f}, p10 {np.percentile(tp, 10):.3f}, '
          f'median {np.median(tp):.3f}, p90 {np.percentile(tp, 90):.3f}, max {tp.max():.3f}; held at a limit: {held}')
    print(f'speech cut: {cut * 1000:.0f} ms')
    print(f'words placed: {len(fitted)} of {N}; output peak {float(np.max(np.abs(out))):.3f}')
    print(f'onset error, {len(err)} words that are not anchors: median {np.median(a_err) * 1000:.0f} ms, '
          f'p95 {np.percentile(a_err, 95) * 1000:.0f} ms, max {a_err.max() * 1000:.0f} ms; '
          f'over 50 ms {int(np.sum(a_err > 0.05))}, over 100 ms {int(np.sum(a_err > 0.10))}')
    print(f'onset error, anchors: max {np.abs(anc).max() * 1000:.1f} ms')
    if test:
        write_wav(TEST_WAV, out)
        print('wrote', TEST_WAV)
        return
    if missing or cut > GATE_CUT:
        raise SystemExit('gates not met: nothing written')
    write_wav(OUT_WAV, out)
    new = [{'w': flat[g], 's': round(float(pred_on[g]), 3), 'e': round(float(pred_end[g]), 3)} for g in range(N)]
    OUT_WORDS.write_text(json.dumps(new, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('wrote', OUT_WAV, 'and', OUT_WORDS)


if __name__ == '__main__':
    main('--test' in sys.argv)
