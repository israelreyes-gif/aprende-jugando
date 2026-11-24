import { openModal } from '../../shared/modal/modal-dialog.js';
import { notify } from '../../shared/modal.js';
import { buildBackup } from './build-backup.js';
import { finishBackup } from './finish-backup.js';

/**
 * Hace la copia y la entrega. Devuelve 'saved', 'cancelled' o 'error'.
 * En el iPhone, compartir el archivo necesita una pulsación nueva: se pide en una ventana aparte.
 */
export async function backupWithTap({ build = buildBackup, finish = finishBackup, ask = openModal, tell = notify } = {}) {
  try {
    const backup = await build();
    let outcome = await finish(backup);
    while (outcome === 'needs-tap') {
      const answer = await ask({
        title: 'Copia lista',
        message: 'Pulsa para guardarla.',
        actions: [
          { label: 'Cancelar', value: false, style: 'outline' },
          { label: 'Guardar copia', value: 'save', style: 'primary' },
        ],
        dismissValue: false,
        initialFocus: 1,
      });
      if (answer !== 'save') return 'cancelled';
      outcome = await finish(backup);
    }
    return outcome === 'saved' ? 'saved' : 'cancelled';
  } catch {
    await tell({ kind: 'error', title: 'No se ha podido hacer la copia', message: 'Puedes intentarlo de nuevo o borrar sin copia.' });
    return 'error';
  }
}
