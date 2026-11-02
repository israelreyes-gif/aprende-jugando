import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { countries, countryName } from '../lib/vocab/countries.js';
import { PEOPLE } from '../lib/people.js';
import { wrongs } from '../lib/wrongs.js';

const NATS = countries.map((c) => c.nat);
const NAMES = countries.map((c) => c.country);
const ES = countries.map((c) => c.es);
const mid = (c) => c.country.replace(/^The /, 'the ');
const GROUPS = ['-ish', '-ian', '-an', '-ese', 'irregular'];

const countryToNat = () => {
  const c = pick(countries);
  return { ...choiceQ(`¿Cuál es la nacionalidad de ${c.country}?`, c.nat, wrongs(NATS, c.nat), `${c.country} → ${c.nat}`), say: c.nat };
};
const natToCountry = () => {
  const c = pick(countries);
  return { ...choiceQ(`¿De qué país es "${c.nat}"?`, c.country, wrongs(NAMES, c.country), `${c.nat} → ${c.country}`), say: c.country };
};
const writeNat = () => {
  const c = pick(countries);
  return { ...textQ(`Escribe la nacionalidad: ${c.country}`, [c.nat], `${c.country} → ${c.nat}`), say: c.nat };
};
const sentence = () => {
  const c = pick(countries);
  const p = pick(PEOPLE);
  const text = `${p.name} is from ${mid(c)}. ${p.he ? 'He' : 'She'} is ${c.nat}.`;
  return { ...choiceQ(`${p.name} is from ${mid(c)}. ${p.he ? 'He' : 'She'} is ___.`, c.nat, wrongs(NATS, c.nat), text), say: text };
};
const writeSentence = () => {
  const c = pick(countries);
  const text = `I'm ${c.nat}.`;
  return { ...textQ(`Soy de ${c.es}. Escribe: I'm ___.`, [c.nat, text, `I am ${c.nat}`], `${c.es} → ${c.country} → ${c.nat}`), say: text };
};
const esToCountry = () => {
  const c = pick(countries);
  return { ...choiceQ(`¿Cómo se dice "${c.es}" en inglés?`, c.country, wrongs(NAMES, c.country), `${c.es} = ${c.country}`), say: c.country };
};
const countryToEs = () => {
  const c = pick(countries);
  return { ...choiceQ(`¿Qué país es "${c.country}"?`, c.es, wrongs(ES, c.es), `${c.country} = ${c.es}`), say: c.country };
};
const ending = () => {
  const c = pick(countries);
  return choiceQ(`¿Qué terminación usa la nacionalidad de ${c.country}? (${c.nat})`, c.group, GROUPS.filter((g) => g !== c.group), `${c.country} → ${c.nat} (${c.group})`, { say: c.nat });
};

export const exercises = [
  { id: 'country-nat', generate: countryToNat, weight: 2 },
  { id: 'nat-country', generate: natToCountry },
  { id: 'write-nat', generate: writeNat, weight: 2 },
  { id: 'sentence', generate: sentence, weight: 2 },
  { id: 'write-sentence', generate: writeSentence },
  { id: 'es-country', generate: esToCountry },
  { id: 'country-es', generate: countryToEs },
  { id: 'ending', generate: ending },
];
