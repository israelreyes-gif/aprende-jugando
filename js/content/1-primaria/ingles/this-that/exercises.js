import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';

const ES = { this: 'este / esta / esto (cerca)', that: 'ese / esa / eso, aquel… (lejos)', these: 'estos / estas (cerca)', those: 'esos / esas, aquellos… (lejos)' };
const WORDS = ['this', 'that', 'these', 'those'];
const SING = [['pen', 'pens'], ['book', 'books'], ['bag', 'bags'], ['chair', 'chairs'], ['table', 'tables'], ['dictionary', 'dictionaries'], ['notebook', 'notebooks'], ['computer', 'computers']];
const PEOPLE = [['student', 'students'], ['actor', 'actors'], ['teacher', 'teachers'], ['doctor', 'doctors']];
const cap = (x) => x[0].toUpperCase() + x.slice(1);

const choose = () => {
  const near = Math.random() < 0.5;
  const pl = Math.random() < 0.5;
  const [s, p] = pick(SING);
  const right = near ? (pl ? 'These' : 'This') : (pl ? 'Those' : 'That');
  const text = pl ? `${right} are my ${p}.` : `${right} is my ${s}.`;
  const cue = near ? 'cerca' : 'lejos';
  const prompt = `(${cue}) ___ ${pl ? 'are' : 'is'} my ${pl ? p : s}.`;
  return { ...choiceQ(prompt, right, WORDS.map(cap).filter((x) => x !== right), text), say: text };
};
const toPlural = () => {
  const [s, p] = pick(SING);
  const near = Math.random() < 0.5;
  const a = near ? 'This' : 'That', b = near ? 'These' : 'Those';
  const q = `${a} is my ${s}.`;
  const right = `${b} are my ${p}.`;
  return { ...textQ(`Pásalo al plural: ${q}`, [right], `${q} → ${right}`), say: right };
};
const toSingular = () => {
  const [s, p] = pick(SING);
  const near = Math.random() < 0.5;
  const a = near ? 'This' : 'That', b = near ? 'These' : 'Those';
  const q = `${b} are my ${p}.`;
  const right = `${a} is my ${s}.`;
  return { ...textQ(`Pásalo al singular: ${q}`, [right], `${q} → ${right}`), say: right };
};
const peoplePl = () => {
  const [s, p] = pick(PEOPLE);
  const near = Math.random() < 0.5;
  const a = near ? 'This' : 'That', b = near ? 'These' : 'Those';
  const q = `${a} ${s} is Chinese.`;
  const right = `${b} ${p} are Chinese.`;
  return { ...textQ(`Pásalo al plural: ${q}`, [right], `${q} → ${right}`), say: right };
};
const build = () => {
  const [s, p] = pick(SING);
  const near = Math.random() < 0.5;
  const pl = Math.random() < 0.5;
  const w = near ? (pl ? 'These' : 'This') : (pl ? 'Those' : 'That');
  const toks = pl ? [w, 'are', 'my', `${p}.`] : [w, 'is', 'my', `${s}.`];
  const extra = [near ? (pl ? 'This' : 'These') : (pl ? 'That' : 'Those')];
  return { ...wordsQ(`Forma la frase (${near ? 'cerca' : 'lejos'})`, toks, extra, toks.join(' ')), say: toks.join(' ') };
};
const meaning = () => {
  const w = pick(WORDS);
  return { ...choiceQ(`¿Qué significa "${w}"?`, ES[w], WORDS.filter((x) => x !== w).map((x) => ES[x]), `${w} = ${ES[w]}`), say: w };
};
const toEn = () => {
  const w = pick(WORDS);
  return { ...choiceQ(`¿Cómo se dice "${ES[w]}"?`, w, WORDS.filter((x) => x !== w), `${ES[w]} = ${w}`), say: w };
};

export const exercises = [
  { id: 'choose', generate: choose, weight: 3 },
  { id: 'to-plural', generate: toPlural, weight: 2 },
  { id: 'to-singular', generate: toSingular },
  { id: 'people-plural', generate: peoplePl },
  { id: 'build', generate: build, weight: 2 },
  { id: 'meaning', generate: meaning },
  { id: 'to-en', generate: toEn },
];
