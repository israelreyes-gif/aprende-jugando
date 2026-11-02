import { pick, shuffle } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { adjectives, opposites } from '../lib/vocab/adjectives.js';
import { vocabGens } from '../lib/vocab-gens.js';
import { withArticle } from '../../../4-primaria/ingles/lib/vocab/article.js';
import { jobs } from '../lib/vocab/jobs.js';
import { family } from '../lib/vocab/family.js';
import { countries } from '../lib/vocab/countries.js';

const opposite = () => {
  const [a, b] = pick(opposites);
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
  const pool = adjectives.map((w) => w.en).filter((w) => w !== y && w !== x && w !== 'little' && w !== 'good-looking');
  const wrong = shuffle(pool).slice(0, 3);
  return { ...choiceQ(`El contrario de "${x}" es…`, y, wrong, `${x} ↔ ${y}`), say: `${x}, ${y}` };
};
const writeOpposite = () => {
  const [a, b] = pick(opposites);
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
  return { ...textQ(`Escribe el contrario de "${x}"`, [y], `${x} ↔ ${y}`), say: `${x}, ${y}` };
};
const NOUNS = ['man', 'woman', 'boy', 'girl'];
const ADJ_OK = ['tall', 'short', 'old', 'young', 'thin', 'friendly', 'funny', 'strong', 'beautiful', 'weak'];
const order = () => {
  const adj = pick(ADJ_OK), n = pick(NOUNS);
  const art = withArticle(adj).split(' ')[0];
  const right = `${art} ${adj} ${n}`;
  const text = right;
  return { ...choiceQ('¿Cuál está bien escrito?', right, [`${withArticle(n).split(' ')[0]} ${n} ${adj}`, `${art} ${n} ${adj}`, `${adj} ${art} ${n}`].filter((x, i, a) => x !== right && a.indexOf(x) === i), text), say: text };
};
const ODD = [
  { odd: 'family', cat: adjectives.map((a) => a.en).filter((x) => !x.includes('-') && x !== 'little'), oddPool: family.map((f) => f.en).filter((x) => !['grandchild', 'grandchildren'].includes(x)) },
  { odd: 'jobs', cat: adjectives.map((a) => a.en).filter((x) => !x.includes('-') && x !== 'little'), oddPool: jobs.map((j) => j.en) },
  { odd: 'countries', cat: adjectives.map((a) => a.en).filter((x) => !x.includes('-') && x !== 'little'), oddPool: countries.map((c) => c.country) },
  { odd: 'adjective-in-family', cat: family.map((f) => f.en), oddPool: adjectives.map((a) => a.en).filter((x) => !x.includes('-') && x !== 'little') },
  { odd: 'adjective-in-jobs', cat: jobs.map((j) => j.en), oddPool: adjectives.map((a) => a.en).filter((x) => !x.includes('-') && x !== 'little') },
];
const odd = () => {
  const x = pick(ODD);
  const three = shuffle(x.cat).slice(0, 3);
  const one = pick(x.oddPool);
  return { ...choiceQ(`¿Cuál es la que NO encaja? ${shuffle([...three, one]).join(' · ')}`, one, three, `${one} no encaja con ${three.join(', ')}`), say: one };
};

export const exercises = [
  ...vocabGens(adjectives, 'adj'),
  { id: 'opposite', generate: opposite, weight: 2 },
  { id: 'write-opposite', generate: writeOpposite },
  { id: 'order', generate: order },
  { id: 'odd', generate: odd },
];
