// The eight question words, with the Spanish translation from the notebook.
export const whWords = [
  { wh: 'Who', es: '¿Quién?' },
  { wh: 'When', es: '¿Cuándo?' },
  { wh: 'What', es: '¿Qué?' },
  { wh: 'Why', es: '¿Por qué?' },
  { wh: 'Where', es: '¿Dónde?' },
  { wh: 'Which', es: '¿Cuál?' },
  { wh: 'Whose', es: '¿De quién?' },
  { wh: 'How', es: '¿Cómo?' },
];

// Pairs that can look alike: never offered together as wrong options.
const TWINS = { What: 'Which', Which: 'What' };

export function twinOf(wh) {
  return TWINS[wh] || null;
}
