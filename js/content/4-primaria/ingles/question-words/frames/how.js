import { pick, rnd } from '../../../../../core/random.js';

// How + ... These sentences are NOT from the notebook: to be validated.
export const how = [
  () => ({ wh: 'How', q: 'How are you?', a: pick(['I am fine, thank you.', 'I am OK.', 'I am very well.']) }),
  () => ({ wh: 'How', q: 'How old are you?', a: `I am ${rnd(8, 12)} years old.` }),
  () => ({ wh: 'How', q: 'How do you go to school?', a: `I go by ${pick(['bus', 'car', 'bike', 'train'])}.` }),
];
