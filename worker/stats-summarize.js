import { POINTS, sessionPoints, spainDay } from './stats-rules.js';

// Un reto o un mix guardan varias sesiones (una por tema) que comparten el principio del id: cuentan como una sola.
const GROUPED_KINDS = new Set(['reto', 'mix']);

function groupSessions(sessions) {
  const groups = new Map();
  for (const s of sessions) {
    const key = GROUPED_KINDS.has(s.kind) ? `${s.kind}:${String(s.id).split(':')[0]}` : `sesion:${s.id}`;
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

/** Igual que summarizePoints de la app, pero byDay sale como objeto { 'AAAA-MM-DD': puntos } para poder enviarlo como JSON. */
export function summarizePointsJson({ sessions, studied }) {
  const byDay = {};
  const add = (iso, n) => {
    const day = dayOf(iso);
    if (day) byDay[day] = (byDay[day] || 0) + n;
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
