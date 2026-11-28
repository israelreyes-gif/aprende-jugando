import { HttpError } from './http.js';
import { addDays, spainDay } from './reminder-dates.js';
import { finishedRetoDays } from './reminder-data.js';
import { shieldBalance } from './shield-balance.js';
import { loadProtections } from './shield-data.js';

/** Hasta cuántos días atrás se puede proteger un día. */
export const SHIELD_WINDOW_DAYS = 7;
const bad = (message) => new HttpError(400, message);

/**
 * Valida que un perfil puede gastar un protector en ese día: tiene alguno, el día ya pasó (de los últimos 7),
 * es posterior a su primer reto, no hizo el reto ese día y no era ya libre ni estaba protegido.
 */
export async function assertShieldRows(db, owner, rows, now = new Date()) {
  if (rows.length !== 1) throw bad('Un protector cada vez');
  const [row] = rows;
  if (typeof row.id !== 'string' || row.id.length === 0 || row.id.length > 200) throw bad('Identificador no válido');
  const day = row.day;
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`)) || addDays(day, 0) !== day) throw bad('Día no válido');
  const today = spainDay(now);
  if (day >= today) throw bad('Solo se puede proteger un día que ya pasó');
  if (day < addDays(today, -SHIELD_WINDOW_DAYS)) throw bad(`Solo se puede proteger uno de los últimos ${SHIELD_WINDOW_DAYS} días`);

  const [done, { free, shields }] = await Promise.all([finishedRetoDays(db, owner), loadProtections(db, owner)]);
  if (done.length === 0 || day <= [...done].sort()[0]) throw bad('Ese día es anterior al primer reto');
  if (done.includes(day)) throw bad('Ese día ya hizo el reto');
  if (free.includes(day) || shields.includes(day)) throw bad('Ese día ya está protegido');
  if (shieldBalance(done, free, shields).available < 1) throw bad('No tienes protectores');
}
