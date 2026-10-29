import { h } from '../../core/dom.js';
import { backupStatus } from './backup-status.js';
import { buildBackup } from './build-backup.js';
import { finishBackup } from './finish-backup.js';

/** Tarjeta de la zona de padres para hacer la copia de seguridad; en amarillo si toca actualizarla. */
export function backupCard({ last, due }) {
  let prepared = null;
  const status = h('span', { class: 'backup-card__status' }, backupStatus(last, due));
  const button = h('button', { class: 'btn btn--primary', type: 'button' }, 'Hacer copia');
  const card = h('div', { class: `backup-card${due ? ' backup-card--due' : ''}` }, h('div', { class: 'backup-card__text' }, h('b', {}, '💾 Copia de seguridad'), status), button);

  const show = (text, label = 'Hacer copia', busy = false) => {
    status.textContent = text;
    button.textContent = label;
    button.disabled = busy;
  };

  button.addEventListener('click', async () => {
    show('Preparando la copia…', 'Preparando…', true);
    try {
      prepared ||= await buildBackup();
      const outcome = await finishBackup(prepared);
      if (outcome === 'saved') {
        prepared = null;
        last = new Date().toISOString();
        card.classList.remove('backup-card--due');
        show('✅ Copia hecha hoy. Guárdala en un sitio seguro (iCloud, correo…).', 'Hacer otra');
      } else if (outcome === 'needs-tap') {
        show('Copia lista. Pulsa para guardarla.', 'Guardar copia');
      } else {
        show(backupStatus(last, due));
      }
    } catch {
      prepared = null;
      show('No se ha podido hacer la copia. Inténtalo de nuevo.');
    }
  });
  return card;
}
