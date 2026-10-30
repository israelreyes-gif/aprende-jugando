import { pick } from '../../../../../core/random.js';
import { objects } from '../../lib/vocab/objects.js';
import { colors } from '../../lib/vocab/colors.js';

// "Which is your apple? The green one."
export const which = [
  () => ({ wh: 'Which', q: `Which is your ${pick(objects).en}?`, a: `The ${pick(colors).en} one.` }),
];
