import { pick } from '../../../../../core/random.js';
import { objects } from '../../lib/vocab/objects.js';
import { places } from '../../lib/vocab/places.js';

// "Where is your book? It is in the bag."
export const where = [
  () => ({ wh: 'Where', q: `Where is your ${pick(objects).en}?`, a: `It is in the ${pick(places).en}.` }),
];
