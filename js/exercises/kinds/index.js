// Registro de los tipos de respuesta del motor de ejercicios (compartido por todas las asignaturas).
//
// Para añadir un tipo nuevo: crea kinds/<tipo>.js con estas cuatro piezas y regístralo aquí.
//   render(question, { t, onChange, onSubmit }) -> { el, focus(), lock(), reveal(isCorrect, value) }
//   check(question, value) -> boolean
//   answerText(question) -> texto de la respuesta correcta
//   givenText(question, value) -> texto de lo que respondió el niño
import { choice } from './choice.js';
import { multi } from './multi.js';
import { number } from './number.js';
import { order } from './order.js';
import { rule } from './rule.js';
import { tap } from './tap.js';
import { text } from './text.js';
import { words } from './words.js';

export const questionTypes = { choice, number, text, multi, rule, words, order, tap };
