import { pick } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

const CASES = [
  ['It is 12:00 in the day. What is it?', "It's midday.", ["It's midnight.", "It's half past twelve."]],
  ['It is 12:00 at night. What is it?', "It's midnight.", ["It's midday.", "It's quarter past twelve."]],
  ['Which word means 12:00 at night?', 'midnight', ['midday', 'half past']],
  ['Which word means 12:00 in the day?', 'midday', ['midnight', "o'clock"]],
];

/** Midday and midnight. */
export function midday() {
  const [prompt, right, wrongs] = pick(CASES);
  return choiceQ(prompt, right, wrongs, `${right.replace(/^It's /, '')}`);
}
