import { pick } from '../../../../../core/random.js';
import { objects } from '../../lib/vocab/objects.js';
import { names } from '../../lib/vocab/people.js';

// Whose + object. These sentences are NOT from the notebook: to be validated.
export const whose = [
  () => ({ wh: 'Whose', q: `Whose ${pick(objects).en} is this?`, a: `It is ${pick(names)}'s.` }),
];
