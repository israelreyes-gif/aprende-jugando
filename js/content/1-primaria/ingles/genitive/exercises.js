import { pick, shuffle } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';

const NAMES = ['Tom', 'Anna', 'Leo', 'Mia', 'Sam', 'Kate', 'Ryan', 'Eva', 'Jack', 'Lisa'];
const NOUNS = ['dog', 'bag', 'bike', 'book', 'mother', 'brother', 'cat', 'house', 'sister', 'father'];

const choose = () => {
  const n = pick(NAMES), o = pick(NOUNS);
  const right = `${n}'s`;
  return { ...choiceQ(`This is ___ ${o}. (de ${n})`, right, [`${n}s`, `${n}s'`, `${n}'`], `${n}'s ${o}`), say: `${n}'s ${o}` };
};
const write = () => {
  const n = pick(NAMES), o = pick(NOUNS);
  return { ...textQ(`Escribe con 's: the ${o} of ${n}`, [`${n}'s ${o}`], `the ${o} of ${n} → ${n}'s ${o}`), say: `${n}'s ${o}` };
};
const OWNERS = [['boy', 'boys'], ['girl', 'girls'], ['student', 'students'], ['teacher', 'teachers']];
const THINGS = [['notebook', 'notebooks'], ['bag', 'bags'], ['pen', 'pens'], ['book', 'books']];
const regularPlural = () => {
  const [, ow] = pick(OWNERS);
  const [, th] = pick(THINGS);
  const right = `the ${ow}' ${th}`;
  const o1 = ow.replace(/s$/, '');
  return { ...choiceQ(`Los ${th === 'notebooks' ? 'cuadernos' : th === 'bags' ? 'bolsos' : th === 'pens' ? 'bolígrafos' : 'libros'} de varios ${ow === 'boys' ? 'chicos' : ow === 'girls' ? 'chicas' : ow === 'students' ? 'alumnos' : 'profesores'}`,
    right, [`the ${o1}'s ${th}`, `the ${ow}'s ${th}`, `the ${ow} ${th}`], right), say: right };
};
const IRR = [['men', 'hombres'], ['women', 'mujeres'], ['children', 'niños']];
const irregular = () => {
  const [w, es] = pick(IRR);
  const [, th] = pick(THINGS);
  const right = `the ${w}'s ${th}`;
  return { ...choiceQ(`Las cosas de los/las ${es}: ¿cómo se escribe?`, right, [`the ${w}' ${th}`, `the ${w}s' ${th}`, `the ${w}s ${th}`], right), say: right };
};
const twoOwners = () => {
  const [a, b] = shuffle(NAMES).slice(0, 2);
  const o = pick(['grandparents', 'house', 'parents', 'dog']);
  const right = `${a} and ${b}'s ${o}`;
  return { ...choiceQ(`Los mismos ${o} son de ${a} y de ${b} (los comparten). ¿Cómo se dice?`, right, [`${a}'s and ${b}'s ${o}`, `${a} and ${b}s' ${o}`, `${a}s and ${b}s ${o}`], right), say: right };
};
const endsInS = () => {
  const n = pick(['James', 'Chris', 'Carlos']);
  const o = pick(['mother', 'dog', 'bag', 'brother']);
  return { ...textQ(`Escribe con ': the ${o} of ${n}`, [`${n}' ${o}`, `${n}'s ${o}`], `${n}' ${o} / ${n}'s ${o}`), say: `${n}'s ${o}` };
};
const OF = [['name', 'street'], ['door', 'house'], ['top', 'mountain'], ['end', 'film']];
const ofThings = () => {
  const [a, b] = pick(OF);
  const right = `the ${a} of the ${b}`;
  return { ...textQ(`Para cosas usamos "of". Completa: the ${a} ___ the ${b}`, ['of'], right), say: right };
};
const build = () => {
  const n = pick(NAMES), o = pick(NOUNS);
  const toks = ['This', 'is', `${n}'s`, `${o}.`];
  return { ...wordsQ('Forma la frase', toks, [`${n}s`], toks.join(' ')), say: toks.join(' ') };
};
const book = (id, text, extra = []) => ({ id, ...wordsQ('Forma la frase', text.split(' '), extra, text), say: text });
const BOOK = [
  book('b8-1', "James is Kate's husband.", ["Kates'"]),
  book('b8-2', "Megan is Mia and Ryan's aunt.", ["Mia's"]),
  book('b8-3', "Ann is George's wife.", ['Georges']),
  book('b8-4', "Megan is Thomas' sister.", []),
  book('b8-5', "Thomas is Leo and Susan's son.", ["Leo's"]),
  book('b8-6', "George and Ann are Megan and Thomas' grandparents.", ["Megan's"]),
  { id: 'cat', ...choiceQ('Las patas del gato: ¿cómo se dice?', "the cat's legs", ['the cats legs', "the cats' legs", 'the cat legs'], "the cat's legs"), say: "the cat's legs" },
  { id: 'france', ...choiceQ('La comida de Francia: ¿cómo se dice?', "France's food", ['Frances food', "Frances' food", 'France food'], "France's food"), say: "France's food" },
  { id: 'street', ...textQ('Escribe en inglés: el nombre de la calle', ['the name of the street'], 'the name of the street'), say: 'the name of the street' },
];

export const exercises = [
  { id: 'choose', generate: choose, weight: 2 },
  { id: 'write', generate: write, weight: 2 },
  { id: 'build', generate: build },
  { id: 'regular-plural', generate: regularPlural },
  { id: 'irregular', generate: irregular },
  { id: 'two-owners', generate: twoOwners },
  { id: 'ends-in-s', generate: endsInS },
  { id: 'of-things', generate: ofThings },
  ...BOOK,
];
