export const exercises = [
  { id: 'q1', type: 'choice', prompt: '¿Cuál de estas palabras es un sustantivo propio?', options: ['ciudad', 'río', 'Madrid', 'país'], answer: 2, explain: 'Madrid nombra una ciudad concreta, por eso se escribe con mayúscula.' },
  { id: 'q2', type: 'choice', prompt: '¿Cuál de estas palabras es un sustantivo común?', options: ['Alex', 'Sevilla', 'gato', 'Pedro'], answer: 2, explain: '"Gato" nombra a cualquier animal de su tipo, no a uno concreto.' },
  { id: 'q3', type: 'text', prompt: 'Escribe el plural de «lápiz».', answers: ['lápices', 'lapices'], explain: 'Las palabras acabadas en -z cambian la z por c: lápices.' },
  { id: 'q4', type: 'text', prompt: 'Escribe el plural de «árbol».', answers: ['árboles', 'arboles'], explain: 'Si acaba en consonante se añade -es: árboles.' },
  { id: 'q5', type: 'choice', prompt: 'En la frase «El niño juega», ¿cuál es el sustantivo?', options: ['El', 'niño', 'juega'], answer: 1, explain: '"Niño" nombra a una persona. "El" acompaña al sustantivo y "juega" es un verbo.' },
  { id: 'q6', type: 'choice', prompt: '¿Cuál es el género del sustantivo «mesa»?', options: ['Masculino', 'Femenino'], answer: 1, explain: 'Decimos "la mesa", así que es femenino.' },
  { id: 'q7', type: 'text', prompt: 'Escribe el plural de «canción».', answers: ['canciones'], explain: 'Acaba en consonante: se añade -es y desaparece el acento: canciones.' },
  { id: 'q8', type: 'choice', prompt: '¿Cuál es el plural de «pez»?', options: ['pezes', 'peces', 'pezs', 'pecs'], answer: 1, explain: 'La z cambia a c: peces.' },
];
