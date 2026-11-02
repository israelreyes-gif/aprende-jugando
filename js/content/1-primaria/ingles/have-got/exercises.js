import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';
import { setup, verb, neg } from '../lib/have-forms.js';

const posText = (s, obj) => `${s.w} ${verb(s)} got ${obj.join(' ')}.`;
const negText = (s, obj) => `${s.w} ${neg(s)} got ${obj.join(' ')}.`;
const posTokens = (s, obj) => [s.w, verb(s), 'got', ...obj.map((t, i) => (i === obj.length - 1 ? `${t}.` : t))];
const negTokens = (s, obj) => [s.w, neg(s), 'got', ...obj.map((t, i) => (i === obj.length - 1 ? `${t}.` : t))];

const choosePos = () => {
  const { s, obj } = setup();
  return { ...choiceQ(`${s.w} ___ got ${obj.join(' ')}.`, verb(s), [s.has ? 'have' : 'has'], posText(s, obj)), say: posText(s, obj) };
};
const chooseNeg = () => {
  const { s, obj } = setup();
  return { ...choiceQ(`Negativo: ${s.w} ___ got ${obj.join(' ')}.`, neg(s), [s.has ? "haven't" : "hasn't"], negText(s, obj)), say: negText(s, obj) };
};
const buildPos = () => {
  const { s, obj } = setup();
  return { ...wordsQ('Forma la frase', posTokens(s, obj), [s.has ? 'have' : 'has'], posText(s, obj)), say: posText(s, obj) };
};
const buildNeg = () => {
  const { s, obj } = setup();
  return { ...wordsQ('Forma la frase negativa', negTokens(s, obj), [s.has ? "haven't" : "hasn't"], negText(s, obj)), say: negText(s, obj) };
};
const toNeg = () => {
  const { s, obj } = setup();
  const full = `${s.w} ${s.has ? 'has' : 'have'} not got ${obj.join(' ')}.`;
  return { ...textQ(`Escríbela en negativo: ${posText(s, obj)}`, [negText(s, obj), full], `${posText(s, obj)} → ${negText(s, obj)}`), say: negText(s, obj) };
};
const writeVerb = () => {
  const { s, obj } = setup();
  return { ...textQ(`Escribe have o has: ${s.w} ___ got ${obj.join(' ')}.`, [verb(s)], posText(s, obj)), say: posText(s, obj) };
};
const shortForm = () => {
  const x = pick([['I', "I've"], ['You', "You've"], ['We', "We've"], ['They', "They've"], ['He', "He's"], ['She', "She's"]]);
  const has = ['He', 'She'].includes(x[0]);
  return { ...textQ(`Forma corta: ${x[0]} ${has ? 'has' : 'have'} got`, [`${x[1]} got`], `${x[0]} ${has ? 'has' : 'have'} got = ${x[1]} got`), say: `${x[1]} got` };
};

const book = (id, text, tokens, extra) => ({ id, ...wordsQ('Forma la frase', tokens, extra, text), say: text });
const BOOK = [
  book('b11-1', 'I have got two brothers.', ['I', 'have', 'got', 'two', 'brothers.'], ['has']),
  book('b11-2', 'Luke and Victoria have got a son.', ['Luke', 'and', 'Victoria', 'have', 'got', 'a', 'son.'], ['has']),
  book('b11-3', 'You have got grandchildren.', ['You', 'have', 'got', 'grandchildren.'], ['has']),
  book('b11-4', 'Lisa has got an uncle and an aunt.', ['Lisa', 'has', 'got', 'an', 'uncle', 'and', 'an', 'aunt.'], ['have']),
  book('b11-5', 'My parents have got three children.', ['My', 'parents', 'have', 'got', 'three', 'children.'], ['has']),
  book('b11-6', 'Mark has got one sister.', ['Mark', 'has', 'got', 'one', 'sister.'], ['have']),
];

export const exercises = [
  { id: 'choose-pos', generate: choosePos, weight: 2 },
  { id: 'choose-neg', generate: chooseNeg, weight: 2 },
  { id: 'build-pos', generate: buildPos, weight: 2 },
  { id: 'build-neg', generate: buildNeg, weight: 2 },
  { id: 'to-neg', generate: toNeg },
  { id: 'write-verb', generate: writeVerb },
  { id: 'short-form', generate: shortForm },
  ...BOOK,
];
