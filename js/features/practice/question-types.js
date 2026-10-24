// Registro de los tipos de pregunta del motor de ejercicios.
//
// Para añadir un tipo nuevo: crea types/<tipo>.js con estas cuatro piezas y regístralo aquí.
//   render(question, { t, onChange, onSubmit }) -> { el, focus(), lock(), reveal(isCorrect, value) }
//   check(question, value) -> boolean
//   answerText(question) -> texto de la respuesta correcta
//   givenText(question, value) -> texto de lo que respondió el niño
import { choice } from './types/choice.js';
import { number } from './types/number.js';
import { text } from './types/text.js';

export const questionTypes = { choice, number, text };
