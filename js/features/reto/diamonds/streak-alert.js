import { addDays } from '../streak/date-keys.js';
import { computeStreak } from '../streak/compute-streak.js';

/**
 * Qué hay que contarle al perfil sobre su racha tras no hacer el reto ayer (o null si nada):
 * - 'save': ayer falló, su racha seguía viva y tiene diamantes → puede salvarla con uno ({ streak, day: ayer }).
 * - 'lost': ayer falló, su racha seguía viva y no tiene diamantes → se ha roto ({ streak }).
 * - 'lost-two': falló anteayer y ayer → se rompió directamente; un diamante solo salva un día ({ streak }).
 * streak = la racha que tenía antes de fallar. protectedDays: días libres + protegidos con diamante.
 */
export function streakAlert({ doneDays, protectedDays, available, today }) {
  const done = new Set(doneDays);
  const protectedSet = new Set(protectedDays);
  const missed = (day) => !done.has(day) && !protectedSet.has(day);
  const yesterday = addDays(today, -1);
  if (!missed(yesterday)) return null;

  const alive = computeStreak(doneDays, yesterday, protectedDays); // racha al terminar anteayer
  if (alive > 0) return { kind: available > 0 ? 'save' : 'lost', streak: alive, day: yesterday };

  const dayBefore = addDays(today, -2);
  if (!missed(dayBefore)) return null;
  const before = computeStreak(doneDays, dayBefore, protectedDays); // racha al terminar el día anterior a anteayer
  return before > 0 ? { kind: 'lost-two', streak: before } : null;
}
