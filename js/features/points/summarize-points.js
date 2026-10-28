import { spainDay } from '../reto/streak/date-keys.js';
import { POINTS } from './rules.js';
import { sessionPoints } from './session-points.js';

/** Agrupa las sesiones: un reto (varias sesiones, una por tema) cuenta como una sola. */
function groupSessions(sessions) {
  const groups = new Map();
  for (const s of sessions) {
    const key = s.kind === 'reto' ? `reto:${String(s.id).split(':')[0]}` : `sesion:${s.id}`;
    const group = groups.get(key) || { correct: 0, total: 0, at: s.finished_at };
    group.correct += s.correct;
    group.total += s.total;
    if (s.finished_at > group.at) group.at = s.finished_at;
    groups.set(key, group);
  }
  return [...groups.values()];
}

function dayOf(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : spainDay(date);
}

/**
 * Suma todos los puntos de un perfil a partir de lo que ya está guardado (sesiones y temas estudiados).
 * total nunca baja de 0; raw es la suma sin ese límite. byDay: puntos por día (hora de España).
 */
export function summarizePoints({ sessions, studied }) {
  const byDay = new Map();
  const add = (iso, n) => {
    const day = dayOf(iso);
    if (day) byDay.set(day, (byDay.get(day) || 0) + n);
  };

  let right = 0;
  let wrong = 0;
  let bonus = 0;
  for (const group of groupSessions(sessions)) {
    const p = sessionPoints(group.correct, group.total);
    right += p.right;
    wrong += p.wrong;
    bonus += p.bonus;
    add(group.at, p.total);
  }
  for (const row of studied) add(row.completed_at, POINTS.studied);

  const studiedPts = studied.length * POINTS.studied;
  const raw = right * POINTS.correct + wrong * POINTS.wrong + bonus + studiedPts;
  return { total: Math.max(0, raw), raw, right, wrong, bonus, studied: studied.length, studiedPts, byDay };
}
