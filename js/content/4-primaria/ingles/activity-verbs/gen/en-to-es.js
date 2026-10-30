import { choiceQ } from '../../../../../exercises/make/choice.js';
import { randomActivity, otherActivities } from '../lib/pick-activities.js';

/** English verb → choose the Spanish translation. */
export function enToEs() {
  const a = randomActivity();
  return choiceQ(`What does "${a.en}" mean?`, a.es, otherActivities(a, 3).map((o) => o.es), `${a.en} = ${a.es}`);
}
