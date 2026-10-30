import { choiceQ } from '../../../../../exercises/make/choice.js';
import { randomActivity, otherActivities } from '../lib/pick-activities.js';

/** Spanish verb → choose the English one. */
export function esToEn() {
  const a = randomActivity();
  return choiceQ(`How do you say "${a.es}" in English?`, a.en, otherActivities(a, 3).map((o) => o.en), `${a.es} = ${a.en}`);
}
