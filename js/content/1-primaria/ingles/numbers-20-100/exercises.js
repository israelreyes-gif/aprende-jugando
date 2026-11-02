import { pick, rnd } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { words99, writeVariants, TENS } from '../lib/vocab/numbers.js';
import { wrongs } from '../lib/wrongs.js';

const num = () => (Math.random() < 0.35 ? pick([20, 30, 40, 50, 60, 70, 80, 90]) : rnd(21, 99));
const wrongNums = (n) => {
  const set = new Set();
  const near = [n + 1, n - 1, n + 10, n - 10, +String(n).split('').reverse().join('')];
  for (const x of near) if (x !== n && x >= 20 && x <= 99) set.add(x);
  while (set.size < 3) { const x = rnd(20, 99); if (x !== n) set.add(x); }
  return [...set].slice(0, 3).map(String);
};
const wrongWords = (n) => {
  const right = words99(n);
  const pool = new Set([words99(n + 1 > 99 ? n - 1 : n + 1), words99(n - 1 < 20 ? n + 2 : n - 1), words99(n + 10 > 99 ? n - 10 : n + 10), words99(rnd(20, 99))]);
  pool.delete(right);
  return [...pool].slice(0, 3);
};
const numToWord = () => { const n = num(); return { ...choiceQ(`¿Cómo se escribe ${n}?`, words99(n), wrongWords(n), `${n} = ${words99(n)}`), say: words99(n) }; };
const wordToNum = () => { const n = num(); return { ...choiceQ(`¿Qué número es "${words99(n)}"?`, String(n), wrongNums(n), `${words99(n)} = ${n}`), say: words99(n) }; };
const write = () => { const n = num(); return { ...textQ(`Escribe en inglés el número ${n}`, writeVariants(words99(n)), `${n} = ${words99(n)}`), say: words99(n) }; };
const tenOnly = () => {
  const t = pick([30, 40, 50, 60, 70, 80, 90]);
  const x = TENS[t];
  const pool = Object.values(TENS);
  return { ...choiceQ(`¿Cómo se escribe ${t}?`, x, wrongs(pool, x), `${t} = ${x}`), say: x };
};
const big = () => {
  const items = [
    { q: '100', a: ['one hundred', 'a hundred'], s: 'one hundred' },
    { q: '1000', a: ['one thousand', 'a thousand'], s: 'one thousand' },
    { q: '1324', a: ['one thousand three hundred twenty four', 'one thousand three hundred twenty-four'], s: 'one thousand three hundred twenty-four' },
  ];
  const x = pick(items);
  return { ...textQ(`Escribe en inglés: ${x.q}`, x.a, `${x.q} = ${x.s}`), say: x.s };
};
const years = () => {
  const a = rnd(10, 20), b = rnd(10, 99);
  const year = a * 100 + b;
  const text = `${words99(a)} ${words99(b)}`;
  return { ...textQ(`Escribe cómo se dice el año ${year}`, writeVariants(text), `${year} → ${text}`), say: text };
};
const seq = () => {
  const t = pick([20, 30, 40, 50]);
  const a = [t, t + 10, t + 20].map((x) => TENS[x]);
  const right = TENS[t + 30];
  return { ...choiceQ(`${a.join(', ')}, ___`, right, wrongs(Object.values(TENS), right), 'Sigue la serie de decenas'), say: a.join(', ') };
};

export const exercises = [
  { id: 'num-to-word', generate: numToWord, weight: 2 },
  { id: 'word-to-num', generate: wordToNum, weight: 2 },
  { id: 'write', generate: write, weight: 2 },
  { id: 'tens', generate: tenOnly },
  { id: 'big', generate: big },
  { id: 'years', generate: years },
  { id: 'seq', generate: seq },
];
