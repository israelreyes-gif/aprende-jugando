import { pick } from '../../../../../core/random.js';
import { objects } from '../../lib/vocab/objects.js';
import { surfaces } from '../../lib/vocab/places.js';
import { withArticle } from '../../lib/vocab/article.js';

// "What is on the table? There is a pencil."
export const what = [
  () => ({ wh: 'What', q: `What is on the ${pick(surfaces).en}?`, a: `There is ${withArticle(pick(objects).en)}.` }),
];
