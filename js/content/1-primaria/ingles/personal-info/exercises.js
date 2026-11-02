import { pick, shuffle } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';
import { countries, countryName } from '../lib/vocab/countries.js';
import { days } from '../../../4-primaria/ingles/lib/vocab/days.js';
import { months } from '../../../4-primaria/ingles/lib/vocab/months.js';
import { PEOPLE } from '../lib/people.js';
import { withArticle } from '../../../4-primaria/ingles/lib/vocab/article.js';

// Fichas del libro (sin teléfonos ni correos).
const CARDS = [
  { first: 'Hugo', last: 'Bernard', country: 'France', city: 'Nantes', nat: 'French', job: 'police officer', he: true },
  { first: 'Lena', last: 'Nowak', country: 'Poland', city: 'Warsaw', nat: 'Polish', job: 'secretary', he: false },
  { first: 'Dev', last: 'Kamala', country: 'India', city: 'Mumbai', nat: 'Indian', job: 'engineer', he: true },
  { first: 'Martina', last: 'Hernandez', country: 'Mexico', city: 'Acapulco', nat: 'Mexican', job: 'tour guide', he: false },
];
const FIELDS = {
  last: 'el apellido',
  country: 'el país',
  city: 'la ciudad',
  nat: 'la nacionalidad',
  job: 'el trabajo',
};

const fact = () => {
  const c = pick(CARDS);
  const f = pick(Object.keys(FIELDS));
  const others = CARDS.filter((x) => x !== c).map((x) => x[f]);
  const phrase = f === 'last' ? `¿Cuál es el apellido de ${c.first}?` : f === 'city' ? `¿En qué ciudad vive ${c.first}?` : `¿Cuál es ${FIELDS[f]} de ${c.first}?`;
  return { ...choiceQ(`${phrase} (ficha: ${c.first} ${c.last})`, c[f], others, `${c.first} ${c.last}: ${c.country}, ${c.city}, ${c.nat}, ${c.job}`), say: c[f] };
};
const buildNat = () => {
  const c = pick(CARDS);
  const text = `${c.first} is ${c.nat}.`;
  return { ...wordsQ('Forma la frase', [c.first, 'is', `${c.nat}.`], ['are'], text), say: text };
};
const buildFrom = () => {
  const c = pick(CARDS);
  const text = `${c.first} is from ${c.country}.`;
  return { ...wordsQ('Forma la frase', [c.first, 'is', 'from', `${c.country}.`], ['are'], text), say: text };
};
const buildJob = () => {
  const c = pick(CARDS);
  const text = `${c.first} is ${withArticle(c.job)}.`;
  return { ...wordsQ('Forma la frase', [c.first, 'is', ...withArticle(c.job).split(' ').map((t, i, a) => (i === a.length - 1 ? `${t}.` : t))], [c.he ? 'she' : 'he'], text), say: text };
};
const myCard = () => {
  const c = pick(CARDS);
  const f = pick(['country', 'nat', 'job']);
  const text = f === 'country' ? `I am from ${c.country}.` : f === 'nat' ? `I am ${c.nat}.` : `I am ${withArticle(c.job)}.`;
  const label = f === 'country' ? 'de dónde eres' : f === 'nat' ? 'tu nacionalidad' : 'tu trabajo';
  return { ...textQ(`Eres ${c.first} (${c.country}, ${c.nat}, ${c.job}). Escribe ${label} (I am …):`, [text, text.replace('I am', "I'm")], text), say: text };
};

// Mayúsculas: la correcta frente a versiones mal escritas.
function capQ(correct, key) {
  const lowerKey = correct.replace(key, key.toLowerCase());
  const lowerAll = correct.toLowerCase();
  const firstOnly = correct.charAt(0) + correct.slice(1).toLowerCase();
  const capAll = correct.replace(/\b([a-z])/g, (m) => m.toUpperCase());
  const wrongs = [...new Set([lowerKey, firstOnly, lowerAll, capAll])].filter((x) => x !== correct).slice(0, 3);
  return { ...choiceQ('¿Qué frase está bien escrita?', correct, wrongs, `${correct} (mayúsculas en nombres, países, nacionalidades, días y meses)`), say: correct };
}
const capGen = () => {
  const kind = pick(['nat', 'from', 'month', 'day']);
  if (kind === 'nat') { const c = pick(countries); const p = pick(PEOPLE); return capQ(`${p.name} is ${c.nat}.`, c.nat); }
  if (kind === 'from') { const c = pick(countries); return capQ(`I'm from ${countryName(c)}.`, countryName(c)); }
  if (kind === 'month') { const m = pick(months); return capQ(`My birthday is in ${m.en}.`, m.en); }
  const d = pick(days);
  return capQ(`We have English on ${d.en}.`, d.en);
};
const CAP_BOOK = ['Lisa is American.', 'John is from Montreal.', 'Jessie and I are tour guides.', "I'm from Germany.", 'My name is Helen Clark.']
  .map((s, i) => ({ id: `cap-book-${i + 1}`, ...capQ(s, s.split(' ').find((w, j) => j > 0 && /^[A-Z]/.test(w) && w !== 'I') || s.split(' ')[0]) }));

export const exercises = [
  { id: 'fact', generate: fact, weight: 2 },
  { id: 'build-nat', generate: buildNat },
  { id: 'build-from', generate: buildFrom },
  { id: 'build-job', generate: buildJob },
  { id: 'my-card', generate: myCard },
  { id: 'caps', generate: capGen, weight: 2 },
  ...CAP_BOOK,
];
