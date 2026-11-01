import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';

const meaning = (id, en, es, wrongs) => ({ id, ...choiceQ(`¿Qué significa "${en}"?`, es, wrongs, `${en} = ${es}`, { say: en }) });
const write = (id, es, en) => ({ id, ...textQ(`Escribe en inglés: ${es}`, [en], `${es} = ${en}`, { say: en }) });
const container = (id, noun, right, wrongs) => ({ id, ...choiceQ(`a ___ of ${noun}`, right, wrongs, `a ${right} of ${noun}`, { say: `a ${right} of ${noun}` }) });

export const exercises = [
  meaning('m-noodles', 'noodles', 'fideos', ['fresas', 'arroz', 'sopa']),
  meaning('m-strawberries', 'strawberries', 'fresas', ['fideos', 'cereales', 'salsa']),
  meaning('m-milkshake', 'milkshake', 'batido', ['limonada', 'leche', 'té']),
  meaning('m-pancake', 'pancake', 'tortita', ['ensalada', 'pasta', 'yogur']),
  meaning('m-cereal', 'cereal', 'cereales', ['café', 'sopa', 'salsa']),
  meaning('m-yoghurt', 'yoghurt', 'yogur', ['leche', 'arroz', 'batido']),
  write('w-tea', 'té', 'tea'),
  write('w-soup', 'sopa', 'soup'),
  write('w-rice', 'arroz', 'rice'),
  write('w-salad', 'ensalada', 'salad'),
  write('w-coffee', 'café', 'coffee'),
  write('w-lemonade', 'limonada', 'lemonade'),
  container('c-milk', 'milk', 'glass', ['bowl', 'bottle', 'cup']),
  container('c-tea', 'tea', 'cup', ['bowl', 'bottle', 'glass']),
  container('c-water', 'water', 'bottle', ['bowl', 'cup', 'plate']),
  container('c-soup', 'soup', 'bowl', ['bottle', 'glass', 'cup']),
  { id: 'would-you-like', ...choiceQ('Would you like a glass of milk?', 'Yes, please.', ['Yes, I am.', 'No, I would.', 'Yes, it is.'], 'Se responde: Yes, please. (Sí, por favor).', { say: 'Would you like a glass of milk? Yes, please.' }) },
  { id: 'build-would-you-like', ...wordsQ('Build the sentence', ['Would', 'you', 'like', 'a', 'cup', 'of', 'tea?'], ['bottle'], 'Would you like a cup of tea?'), say: 'Would you like a cup of tea?' },
];
