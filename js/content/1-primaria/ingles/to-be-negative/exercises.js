import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';
import { PRONOUNS, otherBes, tokens, sentence } from '../lib/be-forms.js';
import { compsFor } from '../lib/be-comps.js';

const setup = () => { const p = pick(PRONOUNS); return { p, comp: pick(compsFor(p)) }; };
const negForm = (p) => (p.w === 'I' ? 'am not' : p.be === 'is' ? "isn't" : "aren't");
const NEG_OPTIONS = ['am not', "isn't", "aren't"];

const chooseNeg = () => {
  const { p, comp } = setup();
  const text = sentence('neg', p, comp);
  return { ...choiceQ(`Negativo: ${p.w} ___ ${comp.join(' ')}.`, negForm(p), NEG_OPTIONS.filter((o) => o !== negForm(p)), text), say: text };
};
const buildNeg = () => {
  const { p, comp } = setup();
  const text = sentence('neg', p, comp);
  const extra = p.w === 'I' ? ["isn't"] : [p.be === 'is' ? "aren't" : "isn't"];
  return { ...wordsQ('Forma la frase negativa', tokens('neg', p, comp), extra, text), say: text };
};
const buildQuestion = () => {
  const { p, comp } = setup();
  const text = sentence('q', p, comp);
  const wrong = ['Am', 'Is', 'Are'].find((x) => x !== p.q);
  return { ...wordsQ('Forma la pregunta', tokens('q', p, comp), [wrong], text), say: text };
};
const toNegative = () => {
  const { p, comp } = setup();
  const pos = sentence('pos', p, comp);
  const neg = sentence('neg', p, comp);
  const full = `${p.w === 'I' ? 'I am not' : `${p.w} ${p.be} not`} ${comp.join(' ')}.`;
  const short = p.w === 'I' ? `I'm not ${comp.join(' ')}.` : `${p.w}'${p.be === 'is' ? 's' : 're'} not ${comp.join(' ')}.`;
  return { ...textQ(`Escríbela en negativo: ${pos}`, [neg, full, short], `${pos} → ${neg}`), say: neg };
};
const toQuestion = () => {
  const { p, comp } = setup();
  const pos = sentence('pos', p, comp);
  const q = sentence('q', p, comp);
  return { ...textQ(`Escríbela como pregunta: ${pos}`, [q], `${pos} → ${q}`), say: q };
};
const SHORT = [
  { q: 'Is he', who: 'he', nouns: ['a pilot', 'a doctor', 'a teacher', 'tall'] },
  { q: 'Is she', who: 'she', nouns: ['a pilot', 'a doctor', 'a teacher', 'Spanish'] },
  { q: 'Is it', who: 'it', nouns: ['a book', 'a clock', 'red', 'big'] },
  { q: 'Are they', who: 'they', nouns: ['doctors', 'students', 'Spanish', 'happy'] },
];
const shortAnswer = () => {
  const x = pick(SHORT);
  const yes = Math.random() < 0.5;
  const verb = x.who === 'they' ? 'are' : 'is';
  const neg = x.who === 'they' ? "aren't" : "isn't";
  const question = `${x.q} ${pick(x.nouns)}?`;
  const right = yes ? `Yes, ${x.who} ${verb}.` : `No, ${x.who} ${neg}.`;
  const wrong = [yes ? `Yes, ${x.who} ${neg}.` : `No, ${x.who} ${verb}.`, yes ? `No, ${x.who} ${verb}.` : `Yes, ${x.who} ${neg}.`];
  const bad = x.who === 'they' ? `Yes, they is.` : `Yes, ${x.who} are.`;
  return { ...choiceQ(`${question} Responde que ${yes ? 'SÍ' : 'NO'}.`, right, [...new Set(wrong.filter((w) => w !== right)), bad].slice(0, 3), `${question} → ${right}`), say: question };
};

// Ejercicio 10 de su cuaderno.
const book = (prompt, tokensArr, extra, say) => wordsQ(prompt, tokensArr, extra, say);
const BOOK = [
  { id: 'b10-1', q: book('it / a notebook (negativo)', ['It', "isn't", 'a', 'notebook.'], ['aren\'t'], "It isn't a notebook."), say: "It isn't a notebook." },
  { id: 'b10-2', q: book('they / tables (negativo)', ['They', "aren't", 'tables.'], ["isn't"], "They aren't tables."), say: "They aren't tables." },
  { id: 'b10-3', q: book('he / a teacher (afirmativo)', ['He', 'is', 'a', 'teacher.'], ['are'], 'He is a teacher.'), say: 'He is a teacher.' },
  { id: 'b10-4', q: book('she / French (negativo)', ['She', "isn't", 'French.'], ["aren't"], "She isn't French."), say: "She isn't French." },
  { id: 'b10-5', q: book('it / a clock (afirmativo)', ['It', 'is', 'a', 'clock.'], ['are'], "It's a clock."), say: "It is a clock." },
  { id: 'b10-6', q: book('they / Spanish (negativo)', ['They', "aren't", 'Spanish.'], ["isn't"], "They aren't Spanish."), say: "They aren't Spanish." },
].map(({ id, q, say }) => ({ id, ...q, say }));

export const exercises = [
  { id: 'choose-neg', generate: chooseNeg, weight: 2 },
  { id: 'build-neg', generate: buildNeg, weight: 2 },
  { id: 'build-question', generate: buildQuestion },
  { id: 'to-negative', generate: toNegative },
  { id: 'to-question', generate: toQuestion },
  { id: 'short-answer', generate: shortAnswer, weight: 2 },
  ...BOOK,
];
