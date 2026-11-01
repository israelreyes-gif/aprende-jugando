import { choiceQ } from '../../../../exercises/make/choice.js';
import { orderQ } from '../../../../exercises/make/order.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';

const fill = (id, sentence, right, wrongs) => {
  const full = sentence.replace('___', right);
  return { id, ...choiceQ(sentence, right, wrongs, full, { say: full }) };
};
const sentence = (id, words, extra, text) => ({ id, ...wordsQ('Build the sentence', words, extra, text), say: text });

export const exercises = [
  fill('book-went', 'When we finished lunch we ___ to the funfair.', 'went', ['go', 'going', 'goes']),
  fill('book-got', 'When the bus arrived we all ___ on it.', 'got', ['get', 'getting', 'gets']),
  fill('book-came', 'We were sad when the bus ___ to take us home.', 'came', ['come', 'coming', 'comes']),
  fill('arrived', 'When I ___ home, I had dinner.', 'arrived', ['arrive', 'arriving', 'arrives']),
  fill('saw', 'When she ___ the dog, she smiled.', 'saw', ['see', 'seeing', 'sees']),
  fill('finished', 'When he ___ his homework, he played.', 'finished', ['finish', 'finishing', 'finishes']),
  { id: 'meaning-when', ...choiceQ('¿Qué significa "when"?', 'cuando', ['donde', 'quien', 'porque'], 'when = cuando', { say: 'when' }) },
  { id: 'write-when', ...textQ('Write the missing word.  ___ we finished lunch, we went out.  (cuando)', ['when'], 'When we finished lunch, we went out.', { say: 'When we finished lunch, we went out.' }) },
  { id: 'write-went', ...textQ('Write the past of "go"', ['went'], 'go → went', { say: 'went' }) },
  sentence('build-funfair', ['When', 'we', 'finished', 'lunch', 'we', 'went', 'to', 'the', 'funfair.'], ['go'], 'When we finished lunch we went to the funfair.'),
  sentence('build-bus', ['When', 'the', 'bus', 'arrived', 'we', 'all', 'got', 'on', 'it.'], ['arrive'], 'When the bus arrived we all got on it.'),
  sentence('build-sad', ['We', 'were', 'sad', 'when', 'the', 'bus', 'came.'], ['was'], 'We were sad when the bus came.'),
  { id: 'order-day', ...orderQ('Put the sentences in order.', ['We finished lunch.', 'We went to the funfair.', 'The bus arrived.', 'We got on the bus.'], 'First we finished lunch. Then we went to the funfair. Then the bus arrived and we got on it.') },
];
