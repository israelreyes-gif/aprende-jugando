import { pick, rnd } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { numbers0to20 as N } from '../lib/vocab/numbers.js';
import { wrongs } from '../lib/wrongs.js';

const wrongNums = (n) => {
  const set = new Set();
  while (set.size < 3) { const x = rnd(0, 20); if (x !== n) set.add(x); }
  return [...set].map(String);
};
const numToWord = () => {
  const x = pick(N);
  return { ...choiceQ(`¿Cómo se escribe ${x.n}?`, x.en, wrongs(N.map((y) => y.en), x.en), `${x.n} = ${x.en}`), say: x.en };
};
const wordToNum = () => {
  const x = pick(N);
  return { ...choiceQ(`¿Qué número es "${x.en}"?`, String(x.n), wrongNums(x.n), `${x.en} = ${x.n}`), say: x.en };
};
const write = () => {
  const x = pick(N);
  return { ...textQ(`Escribe en inglés el número ${x.n}`, x.n === 0 ? ['zero', 'nought'] : [x.en], `${x.n} = ${x.en}`), say: x.en };
};
const add = () => {
  const a = rnd(0, 10), b = rnd(0, 10);
  const r = N[a + b];
  return { ...textQ(`${N[a].en} + ${N[b].en} = ? (escríbelo en inglés)`, [r.en, ...(r.n === 0 ? ['nought'] : [])], `${a} + ${b} = ${a + b} → ${r.en}`), say: r.en };
};
const next = () => {
  const a = rnd(0, 16);
  const right = N[a + 3].en;
  return { ...choiceQ(`${N[a].en}, ${N[a + 1].en}, ${N[a + 2].en}, ___`, right, wrongs(N.map((y) => y.en), right), 'Sigue la serie'), say: `${N[a].en}, ${N[a + 1].en}, ${N[a + 2].en}` };
};
const teens = () => {
  const x = pick(N.filter((y) => y.n >= 13 && y.n <= 19));
  const base = N[x.n - 10].en;
  return { ...choiceQ(`¿Cómo se escribe ${x.n}? (cuidado con -teen)`, x.en, [`${base}ty`, `${base}-ten`, x.en.replace('teen', 'tin')].filter((w) => w !== x.en), `${x.n} = ${x.en}`), say: x.en };
};

export const exercises = [
  { id: 'num-to-word', generate: numToWord, weight: 2 },
  { id: 'word-to-num', generate: wordToNum, weight: 2 },
  { id: 'write', generate: write, weight: 2 },
  { id: 'add', generate: add },
  { id: 'next', generate: next },
  { id: 'teens', generate: teens },
];
