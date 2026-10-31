import { sections } from './sections.js';

// One collapsible block per section, built from the shared vocabulary ("en → es").
export const study = sections.map(({ title, words }) => ({ fold: title, list: words.map((w) => `${w.en} → ${w.es}`) }));
