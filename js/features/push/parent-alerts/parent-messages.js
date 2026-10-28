import { REINFORCE_BELOW } from '../../parents/stats/thresholds.js';

const MAX_TOPIC = 60;
const short = (text) => (text.length > MAX_TOPIC ? `${text.slice(0, MAX_TOPIC - 1)}…` : text);

/** Resumen de la nota: { low, score } con score = "7 de 8 (88 %)". low: por debajo de la regla del 75 %. */
function grade(correct, total) {
  const pct = Math.round((correct * 100) / total);
  return { low: pct < REINFORCE_BELOW, score: `${correct} de ${total} (${pct} %)` };
}

const countCorrect = (results) => results.filter((r) => r.correct).length;

// Títulos cortos (para que iOS no los recorte); la asignatura, el tema y la nota van en el cuerpo.

/** Aviso al terminar una sesión de ejercicios de un tema. */
export function practiceMessage({ name, topicTitle, subjectName, results }) {
  const { low, score } = grade(countCorrect(results), results.length);
  const detail = `${subjectName} · ${short(topicTitle)} · ${score}`;
  return low
    ? { title: `${name} necesita refuerzo`, body: `${detail} ⚠️` }
    : { title: `${name} ha practicado`, body: `${detail} ✅` };
}

/** Aviso al terminar el reto del día. */
export function retoMessage({ name, answers }) {
  const { low, score } = grade(countCorrect(answers), answers.length);
  return { title: `${name} ha hecho el reto`, body: low ? `${score} ⚠️ Necesita refuerzo` : `${score} ✅` };
}

/** Aviso al marcar un tema como estudiado (no tiene nota). */
export function studiedMessage({ name, topicTitle, subjectName }) {
  return { title: `${name} ha estudiado`, body: `${subjectName} · ${short(topicTitle)}` };
}
