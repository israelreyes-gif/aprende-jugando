import { choiceQ } from '../../../../exercises/make/choice.js';
import { wordsQ } from '../../../../exercises/make/words.js';

const ALL = ['who', 'which', 'where'];
const pick = (id, sentence, right, rule) => {
  const full = sentence.replace('___', right);
  return { id, ...choiceQ(sentence, right, ALL.filter((w) => w !== right), `${rule} → ${full}`, { say: full }) };
};

export const exercises = [
  pick('book-place', "It's the place ___ I studied.", 'where', 'where = lugar'),
  pick('book-woman', 'Can you see the woman ___ is cooking in the kitchen?', 'who', 'who = persona'),
  pick('book-mountains', "They're the mountains ___ I climbed with my father.", 'which', 'which = cosa'),
  pick('boy', 'He is the boy ___ plays football.', 'who', 'who = persona'),
  pick('book', 'This is the book ___ I read.', 'which', 'which = cosa'),
  pick('park', 'The park is the place ___ we play.', 'where', 'where = lugar'),
  pick('teacher', 'She is the teacher ___ teaches English.', 'who', 'who = persona'),
  pick('dog', 'I have a dog ___ likes bones.', 'which', 'which = animal'),
  pick('shop', 'Here is the shop ___ I buy milk.', 'where', 'where = lugar'),
  { id: 'build-woman', ...wordsQ('Build the sentence', ['Can', 'you', 'see', 'the', 'woman', 'who', 'is', 'cooking?'], ['which'], 'Can you see the woman who is cooking?'), say: 'Can you see the woman who is cooking?' },
  { id: 'build-mountains', ...wordsQ('Build the sentence', ['They', 'are', 'the', 'mountains', 'which', 'I', 'climbed.'], ['who'], 'They are the mountains which I climbed.'), say: 'They are the mountains which I climbed.' },
];
