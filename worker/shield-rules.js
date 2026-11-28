import { HttpError } from './http.js';
import { addDays, spainDay } from './reminder-dates.js';
import { finishedRetoDays } from './reminder-data.js';
import { computeStreak } from './reminder-streak.js';
import { shieldBalance } from './shield-balance.js';
import { loadProtections } from './shield-data.js';

const bad = (message) => new HttpError(400, message);

/**
 * Valida que un perfil puede gastar un diamante: es para el día de ayer (y solo ese: un diamante salva un día),
 * ayer no hizo el reto ni era libre ni estaba ya protegido, su racha seguía viva al terminar anteayer
 * (si faltaron dos días seguidos, ya se rompió) y le queda algún diamante.
 */
export async function assertShieldRows(db, owner, rows, now = new Date()) {
  if (rows.length !== 1) throw bad('Un diamante cada vez');
  const [row] = rows;
  if (typeof row.id !== 'string' || row.id.length === 0 || row.id.length > 200) throw bad('Identificador no válido');
  const day = row.day;
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`)) || addDays(day, 0) !== day) throw bad('Día no válido');
  const yesterday = addDays(spainDay(now), -1);
  if (day !== yesterday) throw bad('Un diamante solo salva el día de ayer');

  const [done, { free, shields }] = await Promise.all([finishedRetoDays(db, owner), loadProtections(db, owner)]);
  const protectedDays = [...free, ...shields.map((s) => s.day)];
  if (done.includes(day)) throw bad('Ayer ya hizo el reto');
  if (protectedDays.includes(day)) throw bad('Ayer ya está protegido');
  if (computeStreak(done, yesterday, protectedDays) < 1) throw bad('No hay racha que salvar');
  if (shieldBalance(done, free, shields).available < 1) throw bad('No tienes diamantes');
}
