import { choiceQ } from '../../../../exercises/make/choice.js';
import { orderQ } from '../../../../exercises/make/order.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';

// Fixed questions about the story (no generators): every answer is in the text.
export const exercises = [
  { id: 'who-laughed', ...choiceQ('Who laughed at the tortoise?', 'The hare.', ['The crow.', 'The dog.', 'The cat.'], 'A hare liked to laugh at a tortoise.', { say: 'A hare liked to laugh at a tortoise.' }) },
  { id: 'tortoise-said', ...choiceQ('What did the tortoise say?', "Let's have a race.", ["Let's sleep.", "Let's eat.", "Let's go home."], 'The tortoise said, "Let\'s have a race."', { say: "The tortoise said, Let's have a race." }) },
  { id: 'who-fast', ...choiceQ('Who ran very fast?', 'The hare.', ['The tortoise.', 'The tree.', 'The bus.'], 'The hare ran very fast.', { say: 'The hare ran very fast.' }) },
  { id: 'tortoise-slow', ...choiceQ('The tortoise walked slowly.', 'True', ['False'], 'The tortoise walked slowly, step by step.', { say: 'The tortoise walked slowly, step by step.' }) },
  { id: 'where-sleep', ...choiceQ('Where did the hare sleep?', 'Under a tree.', ['In a house.', 'In a car.', 'On a bus.'], 'He lay down under a tree and fell asleep.', { say: 'He lay down under a tree and fell asleep.' }) },
  { id: 'tortoise-stop', ...choiceQ('The tortoise stopped.', 'False', ['True'], 'The tortoise did not stop. He walked and walked.', { say: 'The tortoise did not stop. He walked and walked.' }) },
  { id: 'who-won', ...choiceQ('Who won the race?', 'The tortoise.', ['The hare.', 'The crow.', 'Nobody.'], 'The tortoise won the race.', { say: 'The tortoise won the race.' }) },
  { id: 'when-woke', ...choiceQ('When the hare woke up, where was the tortoise?', 'Near the finish line.', ['At home.', 'Under the tree.', 'Far behind.'], 'When the hare woke up, the tortoise was near the finish line!', { say: 'When the hare woke up, the tortoise was near the finish line!' }) },
  { id: 'order-events', ...orderQ('Put the story in order.', ['The tortoise said, "Let\'s have a race."', 'The hare ran fast.', 'The hare fell asleep.', 'The tortoise won the race.'], 'First they had a race. The hare ran fast and fell asleep. The tortoise won.') },
  { id: 'write-won', ...textQ('Write the missing word.  The tortoise ___ the race.  (ganó)', ['won'], 'The tortoise won the race.', { say: 'The tortoise won the race.' }) },
  { id: 'build-slow', ...wordsQ('Build the sentence', ['The', 'tortoise', 'walked', 'slowly.'], ['fast'], 'The tortoise walked slowly.'), say: 'The tortoise walked slowly.' },
  { id: 'moral', ...choiceQ('What is the moral of the story?', 'Slow and steady wins the race.', ['Always sleep under a tree.', 'Run very fast.', 'Never have a race.'], 'Slow and steady wins the race.', { say: 'Slow and steady wins the race.' }) },
];
