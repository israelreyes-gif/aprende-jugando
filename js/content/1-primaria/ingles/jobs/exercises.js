import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { jobs } from '../lib/vocab/jobs.js';
import { vocabGens } from '../lib/vocab-gens.js';
import { withArticle } from '../../../4-primaria/ingles/lib/vocab/article.js';
import { PEOPLE } from '../lib/people.js';
import { wrongs } from '../lib/wrongs.js';

const WITH_ART = jobs.map((j) => withArticle(j.en));

const imA = () => {
  const j = pick(jobs);
  const right = `I am ${withArticle(j.en)}.`;
  return { ...choiceQ(`Soy ${j.es}. ¿Cómo se dice?`, right, wrongs(jobs.map((x) => `I am ${withArticle(x.en)}.`), right), `${j.es} = ${j.en}`), say: right };
};
const writeIm = () => {
  const j = pick(jobs);
  const art = withArticle(j.en);
  return { ...textQ(`Escribe en inglés: Soy ${j.es}.`, [`I am ${art}`, `I'm ${art}`], `Soy ${j.es} = I am ${art}.`), say: `I am ${art}.` };
};
const article = () => {
  const j = pick(jobs);
  const right = /^[aeiou]/i.test(j.en) ? 'an' : 'a';
  return { ...choiceQ(`Completa: He is ___ ${j.en}.`, right, [right === 'a' ? 'an' : 'a'], `He is ${withArticle(j.en)}.`), say: `He is ${withArticle(j.en)}.` };
};
const whoIs = () => {
  const j = pick(jobs);
  const p = pick(PEOPLE);
  const right = `${p.name} is ${withArticle(j.en)}.`;
  return { ...choiceQ(`${p.name} es ${j.es}. ¿Cómo se dice?`, right, wrongs(jobs.map((x) => `${p.name} is ${withArticle(x.en)}.`), right), `${j.es} = ${j.en}`), say: right };
};

export const exercises = [
  ...vocabGens(jobs, 'job'),
  { id: 'im-a', generate: imA },
  { id: 'write-im', generate: writeIm },
  { id: 'article', generate: article },
  { id: 'who-is', generate: whoIs },
];
