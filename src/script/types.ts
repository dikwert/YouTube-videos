/** A subtitle card: 2-4 words, shown from `s` to `e` seconds from the start of the part. */
export type Card = {s: number; e: number; text: string; keys?: string[]};

/** One spoken line, placed at `s` (seconds). `dur` is the processed clip's length. */
export type AudioLine = {id: string; who: string; s: number; dur: number; file: string};

/** A sound effect or a bed: `file` is relative to public/, `s` the start in seconds. */
export type AudioFx = {file: string; s: number; vol: number; loop?: boolean};

export type AudioPlanData = {lines: AudioLine[]; sfx: AudioFx[]; beds: AudioFx[]};
