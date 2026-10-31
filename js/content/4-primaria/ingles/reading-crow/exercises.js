import { choiceQ } from '../../../../exercises/make/choice.js';
import { orderQ } from '../../../../exercises/make/order.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';

// Fixed questions about the story (no generators): every answer is in the text.
export const exercises = [
  { id: 'how-was-crow', ...choiceQ('How was the crow?', 'Thirsty.', ['Hungry.', 'Sleepy.', 'Cold.'], 'The crow was very, very thirsty.', { say: 'The crow was very, very thirsty.' }) },
  { id: 'what-saw', ...choiceQ('What did the crow see?', 'A pitcher.', ['A river.', 'A tree.', 'A cat.'], 'At last, the crow saw a pitcher.', { say: 'At last, the crow saw a pitcher.' }) },
  { id: 'lot-of-water', ...choiceQ('There was a lot of water in the pitcher.', 'False', ['True'], 'There was a little water at the bottom.', { say: 'There was a little water at the bottom.' }) },
  { id: 'why-no-drink', ...choiceQ("Why couldn't the crow drink?", "It couldn't reach the water.", ['It was not thirsty.', 'The pitcher was red.', 'It was sleeping.'], "The crow couldn't reach the water. The pitcher was too tall.", { say: "The crow couldn't reach the water." }) },
  { id: 'what-put', ...choiceQ('What did the crow put in the pitcher?', 'Stones.', ['Apples.', 'Leaves.', 'Sand.'], 'The crow dropped stone after stone in the pitcher.', { say: 'It took a small stone and dropped it in the pitcher.' }) },
  { id: 'could-at-end', ...choiceQ('At the end, could the crow reach the water?', 'Yes, it could.', ["No, it couldn't.", 'Yes, it did.', 'No, it was.'], 'Little by little, the water went up. Now the crow could reach the water.', { say: 'Now the crow could reach the water.' }) },
  { id: 'was-sad', ...choiceQ('The crow was sad when it could not drink.', 'True', ['False'], "The crow tried and tried, but it couldn't drink. It was sad.", { say: "The crow tried and tried, but it couldn't drink. It was sad." }) },
  { id: 'order-events', ...orderQ('Put the story in order.', ['The crow was thirsty.', 'The crow saw a pitcher.', 'The crow dropped stones in the pitcher.', 'The crow drank the water.'], 'First the crow was thirsty. Then it saw a pitcher. Then it dropped stones. At the end it drank.') },
  { id: 'write-couldnt', ...textQ("Write the missing word.  The crow ___ reach the water at first.  (no pudo)", ["couldn't", 'could not'], "The crow couldn't reach the water.", { say: "The crow couldn't reach the water." }) },
  { id: 'build-happy', ...wordsQ('Build the sentence', ['The', 'crow', 'was', 'happy.'], ['were'], 'The crow was happy.'), say: 'The crow was happy.' },
  { id: 'moral', ...choiceQ('What is the moral of the story?', 'Little by little does the trick.', ['Run very fast.', 'Never drink water.', 'Birds can not fly.'], 'Little by little we can do it.', { say: 'Little by little does the trick.' }) },
];
