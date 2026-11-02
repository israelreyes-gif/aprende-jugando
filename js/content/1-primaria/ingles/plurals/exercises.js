import { pick, rnd } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { plurals } from '../lib/vocab/plurals.js';
import { numbers0to20 } from '../lib/vocab/numbers.js';
import { withArticle } from '../../../4-primaria/ingles/lib/vocab/article.js';
import { wrongs } from '../lib/wrongs.js';

const ALL_MANY = plurals.map((p) => p.many);
const ALL_ONE = plurals.map((p) => p.one);

// Plurales mal formados típicos, para las opciones.
function badPlurals(p) {
  const bad = new Set([`${p.one}s`, `${p.one}es`, p.one.replace(/y$/, 's'), p.one.replace(/(f|fe)$/, 's'), `${p.one}ies`, p.many.replace(/ies$/, 'ys'), p.many.replace(/ves$/, 'fs')]);
  bad.delete(p.many);
  return [...bad];
}

const toPlural = () => {
  const p = pick(plurals);
  const bad = badPlurals(p).filter((x) => x !== p.one);
  const opts = bad.length >= 3 ? bad.sort(() => Math.random() - 0.5).slice(0, 3) : [...bad, ...wrongs(ALL_MANY, p.many)].slice(0, 3);
  return { ...choiceQ(`Plural de "${p.one}"`, p.many, opts, `${p.one} → ${p.many} (${p.rule})`), say: p.many };
};
const toSingular = () => {
  const p = pick(plurals);
  return { ...choiceQ(`Singular de "${p.many}"`, p.one, wrongs(ALL_ONE, p.one), `${p.many} → ${p.one}`), say: p.one };
};
const writePlural = () => {
  const p = pick(plurals);
  return { ...textQ(`Escribe el plural de "${p.one}"`, [p.many], `${p.one} → ${p.many} (${p.rule})`), say: p.many };
};
const rule = () => {
  const p = pick(plurals.filter((x) => x.rule !== '+s'));
  const rules = ['+s', '-y → -ies', '-f → -ves', '-s → -es', 'irregular'];
  return choiceQ(`¿Qué regla sigue el plural de "${p.one}"?`, p.rule, rules.filter((r) => r !== p.rule), `${p.one} → ${p.many}`, { say: p.many });
};
const countNoun = () => {
  const p = pick(plurals);
  const n = pick(numbers0to20.filter((x) => x.n >= 1 && x.n <= 10));
  const right = n.n === 1 ? `${n.en} ${p.one}` : `${n.en} ${p.many}`;
  const wrong = n.n === 1 ? `${n.en} ${p.many}` : `${n.en} ${p.one}`;
  const extra = badPlurals(p).filter((x) => x !== p.one)[0] || `${p.one}s`;
  return { ...choiceQ(`¿Cuál está bien?`, right, [wrong, `${n.en} ${extra}`].filter((x) => x !== right), right, { say: right }) };
};
const aAn = () => {
  const p = pick(plurals);
  const right = withArticle(p.one).split(' ')[0];
  return { ...choiceQ(`Completa: ___ ${p.one}`, right, [right === 'a' ? 'an' : 'a'], withArticle(p.one), { say: withArticle(p.one) }) };
};
const AN = ['apple', 'orange', 'egg', 'umbrella', 'elephant', 'English book', 'old man', 'uncle', 'aunt', 'artist', 'engineer', 'ice cream'];
const A = ['dog', 'cat', 'house', 'pen', 'sister', 'doctor', 'teacher', 'big dog', 'young woman', 'chair'];
const aAnMore = () => {
  const useAn = Math.random() < 0.5;
  const w = pick(useAn ? AN : A);
  return { ...choiceQ(`Completa: ___ ${w}`, useAn ? 'an' : 'a', [useAn ? 'a' : 'an'], `${useAn ? 'an' : 'a'} ${w}`, { say: `${useAn ? 'an' : 'a'} ${w}` }) };
};
const ISPL = () => {
  const p = pick(plurals);
  const one = Math.random() < 0.5;
  return { ...choiceQ(`¿"${one ? p.one : p.many}" es singular o plural?`, one ? 'singular' : 'plural', [one ? 'plural' : 'singular'], `${p.one} / ${p.many}`, { say: one ? p.one : p.many }) };
};

export const exercises = [
  { id: 'to-plural', generate: toPlural, weight: 2 },
  { id: 'to-singular', generate: toSingular },
  { id: 'write-plural', generate: writePlural, weight: 2 },
  { id: 'rule', generate: rule },
  { id: 'count-noun', generate: countNoun },
  { id: 'a-an', generate: aAn },
  { id: 'a-an-more', generate: aAnMore },
  { id: 'is-plural', generate: ISPL },
];
