import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';
import { OBJECTS, IT_OBJECTS } from '../lib/have-forms.js';

const QS = [
  { w: 'I', has: false, ans: 'you', lead: 'Have', low: 'I' },
  { w: 'You', has: false, ans: 'I', lead: 'Have', low: 'you' },
  { w: 'We', has: false, ans: 'we', lead: 'Have', low: 'we' },
  { w: 'They', has: false, ans: 'they', lead: 'Have', low: 'they' },
  { w: 'He', has: true, ans: 'he', lead: 'Has', low: 'he' },
  { w: 'She', has: true, ans: 'she', lead: 'Has', low: 'she' },
  { w: 'It', has: true, ans: 'it', lead: 'Has', low: 'it', it: true },
];
const setup = () => { const s = pick(QS); return { s, obj: pick(s.it ? IT_OBJECTS : OBJECTS) }; };
const stmt = (s, obj) => `${s.w} ${s.has ? 'has' : 'have'} got ${obj.join(' ')}.`;
const qText = (s, obj) => `${s.lead} ${s.low} got ${obj.join(' ')}?`;
const qTokens = (s, obj) => [s.lead, s.low, 'got', ...obj.map((t, i) => (i === obj.length - 1 ? `${t}?` : t))];

const chooseLead = () => {
  const { s, obj } = setup();
  return { ...choiceQ(`___ ${s.low} got ${obj.join(' ')}?`, s.lead, [s.lead === 'Has' ? 'Have' : 'Has'], qText(s, obj)), say: qText(s, obj) };
};
const build = () => {
  const { s, obj } = setup();
  return { ...wordsQ('Forma la pregunta', qTokens(s, obj), [s.lead === 'Has' ? 'Have' : 'Has'], qText(s, obj)), say: qText(s, obj) };
};
const toQuestion = () => {
  const { s, obj } = setup();
  return { ...textQ(`Escríbela como pregunta: ${stmt(s, obj)}`, [qText(s, obj)], `${stmt(s, obj)} → ${qText(s, obj)}`), say: qText(s, obj) };
};
const shortAnswer = () => {
  const { s, obj } = setup();
  const yes = Math.random() < 0.5;
  const aux = s.has ? 'has' : 'have';
  const auxNeg = s.has ? "hasn't" : "haven't";
  const right = yes ? `Yes, ${s.ans} ${aux}.` : `No, ${s.ans} ${auxNeg}.`;
  const wrong = [yes ? `Yes, ${s.ans} ${auxNeg}.` : `No, ${s.ans} ${aux}.`, yes ? `No, ${s.ans} ${aux}.` : `Yes, ${s.ans} ${auxNeg}.`, yes ? `Yes, ${s.ans} ${aux} got.` : `No, ${s.ans} ${auxNeg} got.`];
  const q = qText(s, obj);
  return { ...choiceQ(`${q} Responde que ${yes ? 'SÍ' : 'NO'}.`, right, wrong.filter((x) => x !== right), `${q} → ${right}`), say: q };
};
const writeShort = () => {
  const { s, obj } = setup();
  const yes = Math.random() < 0.5;
  const aux = s.has ? 'has' : 'have';
  const auxNeg = s.has ? "hasn't" : "haven't";
  const right = yes ? `Yes, ${s.ans} ${aux}` : `No, ${s.ans} ${auxNeg}`;
  const alt = yes ? [] : [`No, ${s.ans} ${aux} not`];
  const q = qText(s, obj);
  return { ...textQ(`${q} Responde que ${yes ? 'SÍ' : 'NO'} (respuesta corta):`, [right, ...alt], `${q} → ${right}.`), say: q };
};
const book = (id, text, tokens, extra) => ({ id, ...wordsQ('Forma la pregunta', tokens, extra, text), say: text });
const BOOK = [
  book('b13-1', 'Have you got a big brother?', ['Have', 'you', 'got', 'a', 'big', 'brother?'], ['Has']),
];

export const exercises = [
  { id: 'choose-lead', generate: chooseLead, weight: 2 },
  { id: 'build', generate: build, weight: 2 },
  { id: 'to-question', generate: toQuestion },
  { id: 'short-answer', generate: shortAnswer, weight: 2 },
  { id: 'write-short', generate: writeShort },
  ...BOOK,
];
