import { pick, shuffle } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';
import { PRONOUNS, BES, otherBes, tokens, sentence, withContraction } from '../lib/be-forms.js';
import { COMPS, compsFor } from '../lib/be-comps.js';
import { wrongs } from '../lib/wrongs.js';
import { numbers0to20 } from '../lib/vocab/numbers.js';

const PRON_ES = [
  { en: 'I am', es: 'yo soy' }, { en: 'You are', es: 'tú eres / vosotros sois' }, { en: 'He is', es: 'él es' },
  { en: 'She is', es: 'ella es' }, { en: 'It is', es: 'ello es' }, { en: 'We are', es: 'nosotros somos' }, { en: 'They are', es: 'ellos son' },
];

function setup() {
  const p = pick(PRONOUNS);
  return { p, comp: pick(compsFor(p)) };
}

const chooseBe = () => {
  const { p, comp } = setup();
  const text = sentence('pos', p, comp);
  return { ...choiceQ(`Completa: ${p.w} ___ ${comp.join(' ')}.`, p.be, otherBes(p.be), text), say: text };
};
const writeBe = () => {
  const { p, comp } = setup();
  const text = sentence('pos', p, comp);
  return { ...textQ(`Escribe el verbo to be: ${p.w} ___ ${comp.join(' ')}.`, [p.be], text), say: text };
};
const build = () => {
  const { p, comp } = setup();
  const text = sentence('pos', p, comp);
  const wrong = otherBes(p.be)[0];
  return { ...wordsQ('Forma la frase', tokens('pos', p, comp), [wrong], text), say: text };
};
const enEs = () => {
  const x = pick(PRON_ES);
  return { ...choiceQ(`¿Qué significa "${x.en}"?`, x.es, wrongs(PRON_ES.map((y) => y.es), x.es), `${x.en} = ${x.es}`), say: x.en };
};
const esEn = () => {
  const x = pick(PRON_ES);
  return { ...choiceQ(`¿Cómo se dice "${x.es}"?`, x.en, wrongs(PRON_ES.map((y) => y.en), x.en), `${x.es} = ${x.en}`), say: x.en };
};
const contraction = () => {
  const { p, comp } = setup();
  const full = sentence('pos', p, comp);
  const short = withContraction(p, comp);
  return { ...textQ(`Escribe con la forma corta: ${full}`, [short], `${full} → ${short}`), say: short };
};
const age = () => {
  const n = pick(numbers0to20.filter((x) => x.n >= 5 && x.n <= 14));
  return choiceQ(
    `Tienes ${n.n} años. ¿Cómo se dice en inglés?`,
    `I am ${n.en} years old.`,
    [`I have ${n.en} years old.`, `I has ${n.en} years old.`, `I do ${n.en} years old.`],
    `La edad en inglés usa to be: I am ${n.en} years old.`,
    { say: `I am ${n.en} years old.` },
  );
};
const who = () => {
  const items = [['Who', 'quién'], ['What', 'qué / cuál']];
  const [en, es] = pick(items);
  return choiceQ(`¿Qué significa "${en}"?`, es, [items.find((i) => i[0] !== en)[1], 'dónde', 'cuándo'], `${en} = ${es}`, { say: en });
};

export const exercises = [
  { id: 'choose-be', generate: chooseBe, weight: 2 },
  { id: 'write-be', generate: writeBe },
  { id: 'build', generate: build, weight: 2 },
  { id: 'en-es', generate: enEs },
  { id: 'es-en', generate: esEn },
  { id: 'contraction', generate: contraction },
  { id: 'age', generate: age },
  { id: 'who-what', generate: who },
];
