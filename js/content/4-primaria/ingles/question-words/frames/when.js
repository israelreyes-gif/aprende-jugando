import { pick, rnd } from '../../../../../core/random.js';
import { days } from '../../lib/vocab/days.js';
import { events } from '../../lib/vocab/events.js';

// "When is the party? On Friday at 2 o'clock."
export const when = [
  () => ({ wh: 'When', q: `When is the ${pick(events).en}?`, a: `On ${pick(days).en} at ${rnd(1, 12)} o'clock.` }),
  () => ({ wh: 'When', q: `When is the ${pick(events).en}?`, a: `On ${pick(days).en}.` }),
];
