import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { family } from '../lib/vocab/family.js';
import { vocabGens } from '../lib/vocab-gens.js';

// Relaciones: "Tom es el hermano de Anna. Anna es la ___ de Tom."
const mirror = () => {
  const pairs = [
    ['father', 'son', 'Tom es el padre de Leo. Leo es el ___ de Tom.'],
    ['mother', 'daughter', 'Eva es la madre de Mia. Mia es la ___ de Eva.'],
    ['husband', 'wife', 'Jack es el marido de Kate. Kate es la ___ de Jack.'],
    ['grandfather', 'grandson', 'Sam es el abuelo de Ryan. Ryan es el ___ de Sam.'],
    ['grandmother', 'granddaughter', 'Lisa es la abuela de Emma. Emma es la ___ de Lisa.'],
    ['uncle', 'niece', ''],
  ].filter((p) => p[2]);
  const [, right, text] = pick(pairs);
  const pool = ['son', 'daughter', 'wife', 'grandson', 'granddaughter', 'brother', 'sister', 'husband', 'father', 'mother'];
  const wrong = pool.filter((x) => x !== right).sort(() => Math.random() - 0.5).slice(0, 3);
  return { ...choiceQ(`${text}`, right, wrong, `${text.replace('___', right)}`), say: right };
};
const parentsOf = () => {
  const items = [
    { q: 'Tu padre y tu madre, juntos, son tus…', a: 'parents', w: ['children', 'grandparents', 'brothers'] },
    { q: 'El padre de tu padre es tu…', a: 'grandfather', w: ['uncle', 'father', 'grandson'] },
    { q: 'La madre de tu madre es tu…', a: 'grandmother', w: ['aunt', 'mother', 'granddaughter'] },
    { q: 'El hermano de tu madre es tu…', a: 'uncle', w: ['brother', 'grandfather', 'son'] },
    { q: 'La hermana de tu padre es tu…', a: 'aunt', w: ['sister', 'grandmother', 'daughter'] },
    { q: 'Tus abuelos tienen un nieto: tú. Para ellos, tú eres su…', a: 'grandchild', w: ['parent', 'brother', 'uncle'] },
  ];
  const x = pick(items);
  return choiceQ(x.q, x.a, x.w, `${x.q} ${x.a}`, { say: x.a });
};

export const exercises = [
  ...vocabGens(family, 'family'),
  { id: 'mirror', generate: mirror },
  { id: 'relations', generate: parentsOf },
];
