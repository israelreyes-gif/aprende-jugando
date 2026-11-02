import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';

// Palabras de pregunta: "Who/What" de su cuaderno; el resto y las frases de ejemplo son de Claude (por validar).
const QW = [
  { en: 'Who', es: 'quién' }, { en: 'What', es: 'qué / cuál' }, { en: 'Where', es: 'dónde' }, { en: 'When', es: 'cuándo' },
  { en: 'Why', es: 'por qué' }, { en: 'Whose', es: 'de quién' }, { en: 'How', es: 'cómo' },
];
const SENT = [
  { w: 'What', rest: 'is your name?', es: '¿Cuál es tu nombre?' },
  { w: 'What', rest: 'is this?', es: '¿Qué es esto?' },
  { w: 'Who', rest: 'is she?', es: '¿Quién es ella?' },
  { w: 'Who', rest: 'are they?', es: '¿Quiénes son ellos?' },
  { w: 'Where', rest: 'are you from?', es: '¿De dónde eres?' },
  { w: 'Where', rest: 'is Mia?', es: '¿Dónde está Mia?' },
  { w: 'When', rest: 'is your birthday?', es: '¿Cuándo es tu cumpleaños?' },
  { w: 'Why', rest: 'are you sad?', es: '¿Por qué estás triste?' },
  { w: 'Whose', rest: 'bag is this?', es: '¿De quién es esta mochila?' },
  { w: 'Whose', rest: 'pen is this?', es: '¿De quién es este bolígrafo?' },
  { w: 'How', rest: 'are you?', es: '¿Cómo estás?' },
];
const enEs = () => {
  const x = pick(QW);
  return { ...choiceQ(`¿Qué significa "${x.en}"?`, x.es, QW.filter((y) => y !== x).map((y) => y.es).slice(0, 3).sort(() => Math.random() - 0.5), `${x.en} = ${x.es}`), say: x.en };
};
const esEn = () => {
  const x = pick(QW);
  return { ...choiceQ(`¿Cómo se dice "${x.es}"?`, x.en, QW.filter((y) => y !== x).map((y) => y.en).sort(() => Math.random() - 0.5).slice(0, 3), `${x.es} = ${x.en}`), say: x.en };
};
const fill = () => {
  const s = pick(SENT);
  const text = `${s.w} ${s.rest}`;
  const wrong = QW.map((q) => q.en).filter((q) => q !== s.w).sort(() => Math.random() - 0.5).slice(0, 3);
  return { ...choiceQ(`___ ${s.rest}  (${s.es})`, s.w, wrong, text), say: text };
};
const write = () => {
  const s = pick(SENT);
  const text = `${s.w} ${s.rest}`;
  return { ...textQ(`Escribe la palabra que falta: ___ ${s.rest}  (${s.es})`, [s.w], text), say: text };
};
const build = () => {
  const s = pick(SENT);
  const toks = `${s.w} ${s.rest}`.split(' ');
  const extra = [QW.map((q) => q.en).find((q) => q !== s.w && !toks.includes(q))];
  return { ...wordsQ(`Forma la pregunta: ${s.es}`, toks, extra, toks.join(' ')), say: toks.join(' ') };
};

export const exercises = [
  { id: 'en-es', generate: enEs },
  { id: 'es-en', generate: esEn },
  { id: 'fill', generate: fill, weight: 3 },
  { id: 'write', generate: write, weight: 2 },
  { id: 'build', generate: build, weight: 2 },
];
