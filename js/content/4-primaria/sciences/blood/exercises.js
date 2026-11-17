import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';

export const exercises = [
  { id: 'sys-what', ...choiceQ('What does the circulatory system do?', 'It distributes nutrients and carries waste away from the organs', ['It helps us to see and hear', 'It breaks food down into small pieces', 'It moves our bones'], 'The circulatory system is the circuit that distributes nutrients and carries waste substances away from the organs.') },
  { id: 'sys-parts', ...choiceQ('Which is NOT a part of the circulatory system?', 'The stomach', ['Blood', 'The heart', 'Blood vessels'], 'The circulatory system is made of blood, the heart and blood vessels.') },
  { id: 'blood-is', ...choiceQ('What is blood?', 'the red liquid inside the circulatory system', ['a tube that carries air', 'a kind of muscle', 'the organ that pumps'], 'Blood is the red liquid inside the circulatory system.') },
  { id: 'blood-litres', ...choiceQ('How many litres of blood do adults have?', 'about 6 litres', ['about 1 litre', 'about 2 litres', 'about 20 litres'], 'Adults have around 6 litres of blood.') },
  { id: 'blood-litres-text', ...textQ('Write the number: adults have around ___ litres of blood.', ['6', 'six'], 'Adults have around 6 litres of blood.') },
  { id: 'blood-carries', ...choiceQ('What does blood carry to all the parts of your body?', 'nutrients and oxygen', ['only air', 'only water', 'only sounds'], 'Blood carries nutrients and oxygen to all the parts of your body.') },
  { id: 'blood-how-many', ...choiceQ('How many main components does blood have?', 'four', ['two', 'three', 'five'], 'Red blood cells, white blood cells, platelets and plasma.') },
  { id: 'red-job', ...choiceQ('Which component carries oxygen to the rest of the body?', 'red blood cells', ['white blood cells', 'platelets', 'plasma'], 'Red blood cells carry oxygen and nutrients.') },
  { id: 'red-colour', ...choiceQ('Which component makes your blood red?', 'red blood cells', ['white blood cells', 'platelets', 'plasma'], 'Red blood cells make your blood red.') },
  { id: 'white-job', ...choiceQ('Which component helps the body defend against diseases?', 'white blood cells', ['red blood cells', 'platelets', 'plasma'], 'White blood cells fight viruses and bacteria.') },
  { id: 'white-sick', ...choiceQ('When you get sick, your body makes more...', 'white blood cells', ['red blood cells', 'platelets', 'plasma'], 'When you get sick your body makes more white blood cells to fight against viruses and bacteria.') },
  { id: 'plat-job', ...choiceQ('Which component makes you stop bleeding if you cut yourself?', 'platelets', ['red blood cells', 'white blood cells', 'plasma'], 'Platelets make the blood around a wound sticky and hard.') },
  { id: 'plat-without', ...choiceQ('What would happen without platelets?', 'You would never stop bleeding', ['Your blood would be white', 'You could not breathe', 'Your heart would stop beating'], 'Without platelets, you would never stop bleeding!') },
  { id: 'plasma-is', ...choiceQ('Which component is the liquid in which the other components float?', 'plasma', ['platelets', 'red blood cells', 'white blood cells'], 'Plasma is the liquid in which red cells, white cells and platelets float.') },
  { id: 'plasma-water', ...choiceQ('Plasma is mostly...', 'water', ['air', 'bones', 'sugar'], 'Plasma carries mostly water, but also some nutrients and hormones.') },
  { id: 'text-platelets', ...textQ('Write the word: ______ help us stop bleeding.', ['platelets'], 'Platelets help us stop bleeding.') },
  { id: 'text-white', ...textQ('Write the word: ______ blood cells fight against viruses and bacteria.', ['white'], 'White blood cells fight viruses and bacteria.') },
  { id: 'text-red', ...textQ('Write the word: ______ blood cells carry oxygen.', ['red'], 'Red blood cells carry oxygen.') },
  { id: 'text-plasma', ...textQ('Write the word: the liquid part of blood is called ______.', ['plasma'], 'The liquid part of blood is plasma.') },
  { id: 'es-platelets', ...choiceQ('¿Qué significa "platelets"?', 'plaquetas', ['plasma', 'glóbulos rojos', 'glóbulos blancos'], 'Platelets = plaquetas.') },
  { id: 'es-plasma', ...choiceQ('¿Qué significa "plasma"?', 'plasma', ['plaquetas', 'glóbulos rojos', 'sangre'], 'Plasma = plasma.') },
  { id: 'es-red', ...choiceQ('¿Qué significa "red blood cells"?', 'glóbulos rojos', ['glóbulos blancos', 'plaquetas', 'plasma'], 'Red blood cells = glóbulos rojos.') },
];
