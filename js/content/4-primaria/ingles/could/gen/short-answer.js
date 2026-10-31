import { pick } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { ages } from '../../lib/vocab/ages.js';
import { randomActivity } from '../lib/pick-activity.js';

/** "Could you ride a bike when you were three?"  Answer: yes / no → choose the short answer. */
export function shortAnswer() {
  const activity = randomActivity();
  const age = pick(ages);
  const yes = Math.random() < 0.5;
  const question = `Could you ${activity.en} when you were ${age}?`;
  const right = yes ? 'Yes, I could.' : "No, I couldn't.";
  const wrongs = yes
    ? ["Yes, I couldn't.", 'No, I could.', 'Yes, I did.']
    : ['No, I could.', "Yes, I couldn't.", 'No, I did.'];
  return choiceQ(`Choose the short answer (${yes ? 'yes' : 'no'}).  ${question}`, right, wrongs, `${question}  ${right}`);
}
