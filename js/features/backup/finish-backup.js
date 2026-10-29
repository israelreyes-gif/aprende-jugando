import { saveBackupFile } from './backup-file.js';
import { markBackupDone } from './last-backup.js';

/**
 * Entrega la copia y apunta la fecha solo si de verdad se ha guardado.
 * Devuelve 'saved', 'cancelled' o 'needs-tap' (el móvil pide pulsar otra vez para compartir).
 */
export async function finishBackup(backup) {
  let saved;
  try {
    saved = await saveBackupFile(backup);
  } catch (err) {
    if (err.name === 'NotAllowedError') return 'needs-tap';
    throw err;
  }
  if (!saved) return 'cancelled';
  await markBackupDone().catch(() => {});
  return 'saved';
}
