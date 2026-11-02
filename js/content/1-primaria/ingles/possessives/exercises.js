import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { PEOPLE } from '../lib/people.js';

const ALL = ['my', 'your', 'his', 'her', 'its', 'our', 'their'];
const NOUNS = ['mother', 'brother', 'sister', 'father', 'dog', 'bag', 'book', 'friend'];
const ES = { my: 'mi', your: 'tu / vuestro', his: 'su (de él)', her: 'su (de ella)', its: 'su (de ello)', our: 'nuestro', their: 'su (de ellos)' };
const SUBJ = [['I', 'my'], ['you', 'your'], ['he', 'his'], ['she', 'her'], ['it', 'its'], ['we', 'our'], ['they', 'their']];

const others = (right) => ALL.filter((x) => x !== right);

const fromPronoun = () => {
  const [s, right] = pick(SUBJ);
  return { ...choiceQ(`${s === 'I' ? 'I' : s} → ¿cuál es su adjetivo posesivo?`, right, others(right).slice(0, 3).sort(() => Math.random() - 0.5), `${s} → ${right}`), say: right };
};
const fillName = () => {
  const p = pick(PEOPLE);
  const noun = pick(NOUNS);
  const right = p.he ? 'his' : 'her';
  const text = `This is ${p.name}. ${right[0].toUpperCase() + right.slice(1)} ${noun} is nice.`;
  return { ...choiceQ(`This is ${p.name}. ___ ${noun} is nice.`, right[0].toUpperCase() + right.slice(1), others(right).filter((x) => !['its'].includes(x)).slice(0, 3).map((x) => x[0].toUpperCase() + x.slice(1)), text), say: text };
};
const fillGroup = () => {
  const items = [
    { s: 'I am Anna.', rest: 'name is Anna.', right: 'My' },
    { s: 'You are Sam.', rest: 'name is Sam.', right: 'Your' },
    { s: 'We are sisters.', rest: 'names are Ann and Eva.', right: 'Our' },
    { s: 'They are from China.', rest: 'friends are Spanish.', right: 'Their' },
    { s: 'We are brothers.', rest: 'mother is Kate.', right: 'Our' },
    { s: 'I am Tom.', rest: 'sister is Mia.', right: 'My' },
    { s: 'They are students.', rest: 'teacher is Anna.', right: 'Their' },
  ];
  const x = pick(items);
  return { ...choiceQ(`${x.s} ___ ${x.rest}`, x.right, others(x.right.toLowerCase()).map((y) => y[0].toUpperCase() + y.slice(1)).slice(0, 3), `${x.s} ${x.right} ${x.rest}`), say: `${x.s} ${x.right} ${x.rest}` };
};
const toEs = () => {
  const w = pick(ALL);
  const pool = Object.values(ES);
  return { ...choiceQ(`¿Qué significa "${w}"?`, ES[w], pool.filter((x) => x !== ES[w]).slice(0, 3), `${w} = ${ES[w]}`), say: w };
};
const write = () => {
  const [s, right] = pick(SUBJ);
  return { ...textQ(`Escribe el posesivo de "${s}"`, [right], `${s} → ${right}`), say: right };
};
const BOOK = [
  { id: 'b-anil', q: choiceQ('Hi! ___ name is Anil.', 'My', ['Your', 'His', 'Their'], 'Hi! My name is Anil.', { say: 'Hi! My name is Anil.' }) },
  { id: 'b-her', q: choiceQ('This is ___ mother. (ella)', 'her', ['his', 'our', 'their'], 'This is her mother.', { say: 'This is her mother.' }) },
  { id: 'b-your', q: choiceQ('Are you Anna\'s brother? What\'s ___ name?', 'your', ['my', 'her', 'their'], 'What\'s your name?', { say: "Are you Anna's brother? What's your name?" }) },
  { id: 'b-their', q: choiceQ('These students are from China. ___ friends are Spanish.', 'Their', ['Our', 'His', 'My'], 'Their friends are Spanish.', { say: 'These students are from China. Their friends are Spanish.' }) },
  { id: 'b-our', q: choiceQ('We are sisters. ___ names are Ann and Eva.', 'Our', ['Their', 'Her', 'My'], 'Our names are Ann and Eva.', { say: 'We are sisters. Our names are Ann and Eva.' }) },
  { id: 'b-his', q: choiceQ('This is Jack. ___ wife is American.', 'His', ['Her', 'Their', 'Our'], 'His wife is American.', { say: 'This is Jack. His wife is American.' }) },
].map(({ id, q }) => ({ id, ...q }));

export const exercises = [
  { id: 'from-pronoun', generate: fromPronoun },
  { id: 'fill-name', generate: fillName, weight: 2 },
  { id: 'fill-group', generate: fillGroup, weight: 2 },
  { id: 'to-es', generate: toEs },
  { id: 'write', generate: write },
  ...BOOK,
];
