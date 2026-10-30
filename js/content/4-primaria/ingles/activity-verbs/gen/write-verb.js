import { textQ } from '../../../../../exercises/make/text.js';
import { randomActivity } from '../lib/pick-activities.js';

/** Spanish → write the English verb or phrase. */
export function writeVerb() {
  const a = randomActivity();
  return textQ(`Write it in English: ${a.es}`, [a.en], `${a.es} = ${a.en}`);
}
