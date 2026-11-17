import { choiceQ } from '../../../../exercises/make/choice.js';
import { orderQ } from '../../../../exercises/make/order.js';
import { textQ } from '../../../../exercises/make/text.js';

const levels = ['cells', 'tissues', 'organs', 'systems'];
const parts = [
  ['nucleus', 'the control centre of the cell', ['the outside layer of the cell', 'the part that pumps blood', 'the part that makes energy']],
  ['mitochondrion', 'the part of the cell that makes energy', ['the control centre of the cell', 'the outside layer of the cell', 'a group of similar cells']],
  ['cell membrane', 'the outside layer of the cell', ['the control centre of the cell', 'the part that makes energy', 'a group of organs']],
];
const tissues = ['muscle tissue', 'connective tissue', 'epithelial tissue', 'nervous tissue'];

export const exercises = [
  // Four levels
  { id: 'levels-smallest', ...choiceQ('Which is the smallest level of the human body?', 'cells', ['tissues', 'organs', 'systems'], 'Cells are the smallest living unit of the body.') },
  { id: 'levels-biggest', ...choiceQ('Which level is made of several organs working together?', 'a system', ['a cell', 'a tissue', 'a nucleus'], 'Organs working together make a system.') },
  { id: 'levels-order', ...orderQ('Put the levels in order, from the smallest to the biggest:', levels, 'cells → tissues → organs → systems.') },
  { id: 'levels-how-many', ...choiceQ('How many levels is the human body made of?', 'four', ['two', 'three', 'five'], 'Cells, tissues, organs and systems: four levels.') },
  { id: 'levels-tissue-is', ...choiceQ('Cells make...', 'tissues', ['systems', 'organs', 'bones'], 'Cells group together to make tissues.') },

  // Cells
  ...parts.map(([name, right, wrongs]) => ({ id: `part-${name.replace(/ /g, '-')}`, ...choiceQ(`What is the ${name}?`, right, wrongs, `The ${name} is ${right}.`) })),
  { id: 'cell-where-energy', ...choiceQ('Which part of the cell makes energy?', 'the mitochondrion', ['the nucleus', 'the cell membrane', 'the tissue'], 'The mitochondrion makes energy for the cell.') },
  { id: 'cell-control', ...choiceQ('Which part of the cell is its control centre?', 'the nucleus', ['the mitochondrion', 'the cell membrane', 'the organ'], 'The nucleus is the control centre of the cell.') },
  { id: 'cell-text-nucleus', ...textQ('Write the word: the control centre of the cell is the ______.', ['nucleus'], 'The control centre of the cell is the nucleus.') },
  { id: 'cell-text-membrane', ...textQ('Write the word: the outside layer of the cell is the cell ______.', ['membrane'], 'The outside layer of the cell is the cell membrane.') },
  { id: 'cell-stem', ...choiceQ('Which cell can turn into other kinds of cells?', 'stem cell', ['fat cell', 'muscle cell', 'blood cell'], 'A stem cell can become many kinds of cells.') },
  { id: 'cell-sex', ...choiceQ('Which of these is a kind of cell?', 'blood cell', ['blood organ', 'blood tissue', 'blood system'], 'Blood cell, muscle cell, fat cell, nervous cell... are kinds of cells.') },
  { id: 'cell-es', ...choiceQ('¿Qué significa "cell"?', 'célula', ['tejido', 'órgano', 'sistema'], 'Cell = célula.') },

  // Tissues
  { id: 'tissue-is', ...choiceQ('What is a tissue?', 'a group of similar cells that work together as a unit', ['one single cell', 'a group of organs', 'a part of the cell'], 'A tissue is a group of cells with a similar structure that work together as a unit.') },
  { id: 'tissue-how-many', ...choiceQ('How many main types of tissue are there in the human body?', 'four', ['two', 'three', 'six'], 'Muscle, connective, epithelial and nervous tissue.') },
  { id: 'tissue-which', ...choiceQ('Which one is a type of tissue?', 'nervous tissue', ['heart tissue', 'blood organ', 'cell tissue'], 'The four types are muscle, connective, epithelial and nervous tissue.') },
  { id: 'tissue-not', ...choiceQ('Which one is NOT a main type of tissue?', 'bone cell', tissues.slice(0, 3), 'A bone cell is a kind of cell, not a main type of tissue.') },
  { id: 'tissue-text', ...textQ('Write the word: a ______ is a group of cells that work together as a unit.', ['tissue'], 'A tissue is a group of cells that work together as a unit.') },
  { id: 'tissue-muscle', ...choiceQ('The muscle you drew in your book is made of...', 'muscle tissue', ['nervous tissue', 'epithelial tissue', 'a single cell'], 'Muscles are made of muscle tissue.') },

  // Organs
  { id: 'organ-is', ...choiceQ('What are organs?', 'the working parts of the body, each with a specific job', ['the smallest living units', 'groups of similar cells only', 'the outside layer of a cell'], 'Organs are the working parts of our body. Each organ has a specific job.') },
  { id: 'organ-jobs', ...choiceQ('Which is a job of an organ?', 'pumping blood', ['being a nucleus', 'making a tissue', 'being a cell membrane'], 'Organs have specific jobs, such as pumping or cleaning our blood or helping us breathe.') },
  { id: 'organ-text', ...textQ('Write the word: the heart is an ______.', ['organ'], 'The heart is an organ: its job is to pump blood.') },
  { id: 'organ-made-of', ...choiceQ('Organs are made of...', 'tissues', ['systems', 'nothing', 'only blood'], 'Tissues make organs.') },
  { id: 'organ-es', ...choiceQ('¿Qué significa "organ"?', 'órgano', ['célula', 'tejido', 'sistema'], 'Organ = órgano.') },
  { id: 'tissue-es', ...choiceQ('¿Qué significa "tissue"?', 'tejido', ['célula', 'órgano', 'sistema'], 'Tissue = tejido.') },
];
