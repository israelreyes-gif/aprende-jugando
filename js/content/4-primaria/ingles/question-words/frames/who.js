import { pick } from '../../../../../core/random.js';
import { peopleGroups } from '../../lib/vocab/people.js';

// "Who is that boy? My brother Tom."
export const who = [
  () => {
    const g = pick(peopleGroups);
    return { wh: 'Who', q: `Who is that ${g.noun}?`, a: `My ${pick(g.people)} ${pick(g.names)}.` };
  },
];
