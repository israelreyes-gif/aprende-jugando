import { verbs } from './words.js';

export const study = [
  { h: 'Past simple: irregular verbs' },
  { p: 'Los verbos irregulares cambian en pasado. No se les añade -ed.' },
  { list: verbs.filter(([b, p]) => p !== `${b}ed`).map(([b, p, es]) => `${b} → ${p} (${es})`) },
  { tip: 'climb → climbed es regular: lleva -ed.', label: 'Careful' },
  { p: 'I saw a film. She wrote a letter. We had lunch.' },
];
