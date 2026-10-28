import { REINFORCE_BELOW } from '../../parents/stats/thresholds.js';

const MAX_TOPIC = 60;
const short = (text) => (text.length > MAX_TOPIC ? `${text.slice(0, MAX_TOPIC - 1)}…` : text);

/** Resumen de la nota: { low, score } con score = "7 de 8 (88 %)". low: por debajo de la regla del 75 %. */
function grade(correct, total) {
  const pct = Math.round((correct * 100) / total);
  return { low: pct < REINFORCE_BELOW, score: `${correct} de ${total} (${pct} %)` };
}

const countCorrect = (results) => results.filter((r) => r.correct).length;

/** Aviso al terminar una sesión de ejercicios de un tema. */
export function practiceMessage({ name, topicTitle, subjectName, results }) {
  const { low, score } = grade(countCorrect(results), results.length);
  return low
    ? { title: `${name} necesita refuerzo en ${short(topicTitle)}`, body: `${subjectName} · ${score} ⚠️` }
    : { title: `${name} ha practicado ${short(topicTitle)}`, body: `${subjectName} · ${score} ✅` };
}

/** Aviso al terminar el reto del día. */
export function retoMessage({ name, answers }) {
  const { low, score } = grade(countCorrect(answers), answers.length);
  return low
    ? { title: `${name} ha hecho el reto, pero ha fallado bastante`, body: `${score} ⚠️ Mira el refuerzo` }
    : { title: `${name} ha hecho el reto del día`, body: `${score} ✅` };
}

/** Aviso al marcar un tema como estudiado (no tiene nota). */
export function studiedMessage({ name, topicTitle, subjectName }) {
  return { title: `${name} ha estudiado ${short(topicTitle)}`, body: subjectName };
}
