import { openModal } from '../../shared/modal/modal-dialog.js';
import { backupAgeDays } from './backup-due.js';
import { backupStatus } from './backup-status.js';
import { loadLastBackup } from './last-backup.js';
import { backupWithTap } from './backup-with-tap.js';

/**
 * Antes de algo que no se puede deshacer (borrar un perfil): si no hay copia de hoy, ofrece hacerla.
 * Devuelve true si se puede seguir (ya había copia de hoy, se acaba de hacer o se ha elegido seguir sin copia)
 * y false si se ha cancelado.
 */
export async function ensureRecentBackup(name, { load = loadLastBackup, backup = backupWithTap, ask = openModal, now = new Date() } = {}) {
  const last = await load();
  if (last && backupAgeDays(last, now) === 0) return true;
  for (;;) {
    const choice = await ask({
      kind: 'danger',
      title: `Antes de borrar a ${name}`,
      message: `${backupStatus(last, false, now)} Borrar un perfil no se puede deshacer; con una copia se podría recuperar su progreso.`,
      actions: [
        { label: 'Cancelar', value: false, style: 'outline' },
        { label: 'Borrar sin copia', value: 'skip', style: 'bad' },
        { label: 'Hacer copia ahora', value: 'backup', style: 'primary' },
      ],
      dismissValue: false,
      initialFocus: 2,
    });
    if (choice === 'skip') return true;
    if (choice !== 'backup') return false;
    if ((await backup()) === 'saved') return true;
  }
}
