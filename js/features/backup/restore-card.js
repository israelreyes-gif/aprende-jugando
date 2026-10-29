import { h } from '../../core/dom.js';
import { confirmDialog, notify } from '../../shared/modal.js';
import { backupDateText, backupSummary } from './backup-summary.js';
import { readBackupFile } from './read-backup-file.js';
import { restoreBackup } from './restore-backup.js';

const IDLE = 'Elige un archivo de copia. Solo se añade lo que falte; no se borra ni se cambia nada.';

/** Tarjeta de la zona de padres para recuperar una copia de seguridad. */
export function restoreCard() {
  const status = h('span', { class: 'backup-card__status' }, IDLE);
  const button = h('button', { class: 'btn btn--outline', type: 'button' }, 'Elegir archivo');
  const input = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  const card = h('div', { class: 'backup-card' }, h('div', { class: 'backup-card__text' }, h('b', {}, '♻️ Recuperar copia'), status), button, input);

  const idle = () => {
    status.textContent = IDLE;
    button.disabled = false;
  };

  async function importFile(file) {
    let backup;
    try {
      backup = await readBackupFile(file);
    } catch (err) {
      status.textContent = err.message;
      return;
    }
    const accepted = await confirmDialog({
      title: 'Recuperar copia',
      message: `Copia del ${backupDateText(backup)}. ${backupSummary(backup)}. Solo se añadirá lo que falte; no se borra ni se cambia nada.`,
      confirm: 'Recuperar',
    });
    if (!accepted) return idle();
    button.disabled = true;
    status.textContent = 'Recuperando…';
    try {
      const added = await restoreBackup(backup);
      await notify({
        kind: 'success',
        title: added ? 'Copia recuperada' : 'Ya estaba todo',
        message: added ? `Se han añadido ${added.toLocaleString('es-ES')} datos que faltaban.` : 'No faltaba nada: todo lo de la copia ya estaba en la app.',
      });
      location.reload();
    } catch {
      status.textContent = 'No se ha podido recuperar la copia. Puedes intentarlo de nuevo: no se duplica nada.';
      button.disabled = false;
    }
  }

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (file) await importFile(file);
  });
  return card;
}
