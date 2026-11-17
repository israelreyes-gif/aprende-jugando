import { choiceQ } from '../../../../exercises/make/choice.js';
import { orderQ } from '../../../../exercises/make/order.js';
import { textQ } from '../../../../exercises/make/text.js';

export const exercises = [
  { id: 'nutrition-is', ...choiceQ('What does nutrition provide to your body?', 'nutrients and energy', ['sounds and colours', 'only water', 'bones and muscles'], 'Nutrition provides your body with all the nutrients and energy that are necessary for life.') },
  { id: 'nutrition-systems', ...choiceQ('How many body systems are involved in nutrition?', 'four', ['two', 'three', 'five'], 'The digestive, respiratory, circulatory and excretory systems.') },
  { id: 'nutrition-not', ...choiceQ('Which system is NOT involved in human nutrition?', 'the locomotor system', ['the digestive system', 'the circulatory system', 'the excretory system'], 'The four systems are digestive, respiratory, circulatory and excretory.') },
  { id: 'dig-job', ...choiceQ('What does the digestive system do?', 'It breaks food down into nutrients', ['It pumps blood', 'It makes us breathe', 'It moves our bones'], 'The digestive system breaks food down into small particles called nutrients.') },
  { id: 'dig-nutrients', ...choiceQ('What do nutrients give us?', 'energy, and they help us grow', ['sounds', 'colours', 'waste'], 'Nutrients give us energy and help us grow.') },
  { id: 'dig-order', ...orderQ('Put the parts of the digestive system in order:', ['mouth', 'oesophagus', 'stomach', 'small intestine', 'large intestine', 'rectum', 'anus'], 'mouth → oesophagus → stomach → small intestine → large intestine → rectum → anus.') },
  { id: 'dig-first', ...choiceQ('Where does digestion start?', 'in the mouth', ['in the stomach', 'in the anus', 'in the rectum'], 'Digestion starts in the mouth.') },
  { id: 'dig-last', ...choiceQ('Which is the last part of the digestive system?', 'the anus', ['the rectum', 'the stomach', 'the oesophagus'], 'The anus is the end of the large intestine.') },
  { id: 'mouth-teeth', ...choiceQ('What breaks the food up in the mouth?', 'the teeth', ['the tongue', 'the liver', 'the stomach'], 'The teeth break the food up.') },
  { id: 'mouth-tongue', ...choiceQ('What mixes the food with saliva in the mouth?', 'the tongue', ['the teeth', 'the pancreas', 'the rectum'], 'The tongue mixes the food with saliva.') },
  { id: 'bolus', ...choiceQ('What is the mix of chewed food and saliva called?', 'alimentary bolus', ['chyme', 'faeces', 'plasma'], 'In the mouth the food becomes the alimentary bolus.') },
  { id: 'oeso', ...choiceQ('Which tube takes the bolus to the stomach?', 'the oesophagus', ['the anus', 'the trachea', 'the rectum'], 'The bolus goes down the oesophagus to the stomach.') },
  { id: 'stomach-acid', ...choiceQ('Which organ produces acids and enzymes that break down food?', 'the stomach', ['the mouth', 'the rectum', 'the oesophagus'], 'The stomach contracts and produces acids and enzymes.') },
  { id: 'chyme', ...choiceQ('What is the thick liquid formed in the stomach called?', 'chyme', ['bolus', 'faeces', 'saliva'], 'In the stomach, food mixed with gastric juices forms chyme.') },
  { id: 'chyme-text', ...textQ('Write the word: the thick liquid formed in the stomach is called ______.', ['chyme'], 'Chyme is the thick liquid formed in the stomach.') },
  { id: 'small-nutrients', ...choiceQ('Where do the nutrients pass into the blood?', 'in the small intestine', ['in the stomach', 'in the mouth', 'in the rectum'], 'The nutrients pass through the walls of the small intestine and go to the blood.') },
  { id: 'small-juices', ...choiceQ('Which organs produce digestive juices for the small intestine?', 'the liver and the pancreas', ['the heart and the lungs', 'the teeth and the tongue', 'the rectum and the anus'], 'Digestive juices are produced by the liver, the pancreas and the intestine.') },
  { id: 'small-long', ...choiceQ('How long is the small intestine?', 'around six metres', ['around six centimetres', 'around one metre', 'around fifty metres'], 'The small intestine is around six metres long.') },
  { id: 'small-main', ...choiceQ('Where does digestion take place mainly?', 'in the small intestine', ['in the mouth', 'in the stomach', 'in the anus'], 'Digestion takes place mainly in the small intestine.') },
  { id: 'large-faeces', ...choiceQ('Where do bacteria transform waste substances into faeces?', 'in the large intestine', ['in the stomach', 'in the mouth', 'in the oesophagus'], 'In the large intestine bacteria transform waste into faeces, from liquid to solid.') },
  { id: 'rectum', ...choiceQ('Where are faeces stored until they leave the body?', 'in the rectum', ['in the stomach', 'in the small intestine', 'in the mouth'], 'The rectum is where faeces are stored.') },
  { id: 'anus', ...choiceQ('Which is the part where the large intestine opens to the outside?', 'the anus', ['the rectum', 'the stomach', 'the pharynx'], 'The anus lets the faeces come out.') },
  { id: 'text-stomach', ...textQ('Write the word: the food arrives to the ______ after the oesophagus.', ['stomach'], 'After the oesophagus, the food arrives to the stomach.') },
  { id: 'text-intestine', ...textQ('Write the word: the ______ intestine is around six metres long.', ['small'], 'The small intestine is around six metres long.') },
  { id: 'es-stomach', ...choiceQ('¿Qué significa "stomach"?', 'estómago', ['esófago', 'intestino', 'hígado'], 'Stomach = estómago.') },
  { id: 'es-oesophagus', ...choiceQ('¿Qué significa "oesophagus"?', 'esófago', ['estómago', 'faringe', 'recto'], 'Oesophagus = esófago.') },
  { id: 'es-intestine', ...choiceQ('¿Qué significa "small intestine"?', 'intestino delgado', ['intestino grueso', 'estómago', 'recto'], 'Small intestine = intestino delgado.') },
  { id: 'es-large', ...choiceQ('¿Qué significa "large intestine"?', 'intestino grueso', ['intestino delgado', 'estómago', 'esófago'], 'Large intestine = intestino grueso.') },
];
