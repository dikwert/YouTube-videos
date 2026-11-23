import dialogueJson from './dialogue.json';

export type Speaker = 'mason' | 'future' | 'gps' | 'truck' | 'voice';
export type HighlightKind = 'danger' | 'mystery';
export type Line = {s: number; e: number; t: string; who: Speaker};
export type Highlight = {word: string; kind: HighlightKind; at: number};
export type PartScript = {lines: Line[]; highlights: Highlight[]};

export const DIALOGUE = dialogueJson as unknown as Record<string, PartScript>;

/** Max highlighted words per part, and the minimum gap between highlight moments (seconds). */
export const MAX_HIGHLIGHTS = 4;
export const MIN_HIGHLIGHT_GAP = 15;

export const normWord = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '');

/** Split a line into chunks of 2-4 words. */
export const chunkSizes = (n: number): number[] => {
  const out: number[] = [];
  let left = n;
  while (left > 4) {
    out.push(3);
    left -= 3;
  }
  if (left > 0) out.push(left);
  return out;
};

export type Piece = {
  start: number;
  end: number;
  who: Speaker;
  words: Array<{w: string; hl?: HighlightKind}>;
};

/** Finds the line active at `at` and the index of the highlighted word inside it. */
export const locateHighlight = (script: PartScript, h: Highlight) => {
  const line = script.lines.find((l) => h.at >= l.s && h.at <= l.e);
  if (!line) return null;
  const words = line.t.split(/\s+/).filter(Boolean);
  const idx = words.findIndex((w) => normWord(w) === normWord(h.word));
  if (idx < 0) return null;
  return {line, idx};
};

/** Validates the highlight rules for one part. Returns a list of problems (empty = fine). */
export const validatePart = (script: PartScript): string[] => {
  const problems: string[] = [];
  if (script.highlights.length > MAX_HIGHLIGHTS) {
    problems.push(`${script.highlights.length} highlights (max ${MAX_HIGHLIGHTS})`);
  }
  const sorted = [...script.highlights].sort((a, b) => a.at - b.at);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].at - sorted[i - 1].at;
    if (gap < MIN_HIGHLIGHT_GAP) problems.push(`highlights at ${sorted[i - 1].at}s and ${sorted[i].at}s are ${gap.toFixed(1)}s apart (min ${MIN_HIGHLIGHT_GAP})`);
  }
  for (const h of script.highlights) {
    if (!locateHighlight(script, h)) problems.push(`highlight "${h.word}" at ${h.at}s is not inside a line`);
  }
  return problems;
};

/** Builds the 2-4 word caption pieces for a part, with timing spread across each line and highlights applied. */
export const buildPieces = (script: PartScript): Piece[] => {
  const hlAt = new Map<string, HighlightKind>();
  for (const h of script.highlights) {
    const loc = locateHighlight(script, h);
    if (loc) hlAt.set(`${script.lines.indexOf(loc.line)}:${loc.idx}`, h.kind);
  }
  const pieces: Piece[] = [];
  script.lines.forEach((line, li) => {
    const words = line.t.split(/\s+/).filter(Boolean);
    const total = line.e - line.s;
    let idx = 0;
    for (const size of chunkSizes(words.length)) {
      const start = line.s + (total * idx) / words.length;
      const end = line.s + (total * (idx + size)) / words.length;
      const chunk = words.slice(idx, idx + size).map((w, k) => ({w, hl: hlAt.get(`${li}:${idx + k}`)}));
      pieces.push({start, end, who: line.who, words: chunk});
      idx += size;
    }
  });
  return pieces;
};
