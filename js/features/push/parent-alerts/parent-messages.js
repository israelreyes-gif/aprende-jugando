import { formatNumber, pointsText } from '../../points/format-points.js';
import { POINTS } from '../../points/rules.js';
import { sessionPoints } from '../../points/session-points.js';
import { REINFORCE_BELOW } from '../../parents/stats/thresholds.js';

const MAX_TOPIC = 60;
const short = (text) => (text.length > MAX_TOPIC ? `${text.slice(0, MAX_TOPIC - 1)}…` : text);

/** Resumen de la nota: { low, score, points } con score = "7 de 8 (88 %)" y points = "+8 puntos". */
function grade(correct, total) {
  const pct = Math.round((correct * 100) / total);
  return { low: pct < REINFORCE_BELOW, score: `${correct} de ${total} (${pct} %)`, points: pointsText(sessionPoints(correct, total).total) };
}

const countCorrect = (results) => results.filter((r) => r.correct).length;

// Títulos cortos (para que iOS no los recorte); la asignatura, el tema, la nota y los puntos van en el cuerpo.

/** Aviso al terminar una sesión de ejercicios de un tema. */
export function practiceMessage({ name, topicTitle, subjectName, results }) {
  const { low, score, points } = grade(countCorrect(results), results.length);
  const detail = `${subjectName} · ${short(topicTitle)} · ${score}`;
  return low
    ? { title: `${name} necesita refuerzo`, body: `${detail} ⚠️ · ${points}` }
    : { title: `${name} ha practicado`, body: `${detail} ✅ · ${points}` };
}

/** Aviso al terminar el reto del día. */
export function retoMessage({ name, answers }) {
  const { low, score, points } = grade(countCorrect(answers), answers.length);
  return { title: `${name} ha hecho el reto`, body: low ? `${score} ⚠️ Necesita refuerzo · ${points}` : `${score} ✅ · ${points}` };
}

/** Aviso al marcar un tema como estudiado (no tiene nota). */
export function studiedMessage({ name, topicTitle, subjectName }) {
  return { title: `${name} ha estudiado`, body: `${subjectName} · ${short(topicTitle)} · ${pointsText(POINTS.studied)}` };
}

/** Aviso al subir de nivel. level: un elemento de LEVELS. */
export function levelUpMessage({ name, level }) {
  return { title: `¡${name} ha subido a ${level.name}!`, body: `Nivel ${level.n} · ${formatNumber(level.min)} puntos ${level.emoji}` };
}
