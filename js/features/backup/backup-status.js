import { backupAgeDays } from './backup-due.js';

/** Frase bajo el título de la tarjeta de copia. */
export function backupStatus(last, due, now = new Date()) {
  if (last === undefined) return 'No se ha podido comprobar la última copia.';
  if (last === null) return 'Todavía no has hecho ninguna copia. Conviene hacer una.';
  const days = backupAgeDays(last, now);
  const when = days === 0 ? 'hoy' : days === 1 ? 'ayer' : `hace ${days} días`;
  return `Última copia: ${when}.${due ? ' Conviene actualizarla.' : ''}`;
}
