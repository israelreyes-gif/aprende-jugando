import { pick } from '../../../../../core/random.js';
import { objects } from '../../lib/vocab/objects.js';

// "Why are you late? Because I missed my bus."
export const why = [
  () => ({ wh: 'Why', q: 'Why are you late?', a: `Because I missed my ${pick(['bus', 'train'])}.` }),
  () => ({ wh: 'Why', q: 'Why are you tired?', a: 'Because I went to bed late.' }),
  () => ({ wh: 'Why', q: 'Why are you happy?', a: 'Because it is my birthday.' }),
  () => ({ wh: 'Why', q: 'Why are you sad?', a: `Because I lost my ${pick(objects).en}.` }),
  () => ({ wh: 'Why', q: 'Why are you hungry?', a: 'Because I did not have breakfast.' }),
];
