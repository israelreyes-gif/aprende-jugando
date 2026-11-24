import { h } from '../../../core/dom.js';
import { go } from '../../../core/router.js';
import { paths } from '../../../core/paths.js';
import { deleteProfile } from '../../../data/profiles.repo.js';
import { icon } from '../../../shared/icons.js';
import { confirmDialog, notify } from '../../../shared/modal.js';
import { ensureRecentBackup } from '../../backup/ensure-recent-backup.js';

/** Botón para borrar un perfil y todo su progreso (ofrece antes una copia de seguridad y pide confirmación). */
export function deleteProfileButton(profile) {
  async function onClick() {
    if (!(await ensureRecentBackup(profile.name))) return;
    const confirmed = await confirmDialog({
      title: `¿Borrar el perfil de ${profile.name}?`,
      message: 'Se borrará también todo su progreso. Esto no se puede deshacer.',
      confirm: 'Borrar',
      cancel: 'Cancelar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await deleteProfile(profile.id);
      go(paths.parents());
    } catch (err) {
      console.error(err);
      notify({ kind: 'error', title: 'No se ha podido borrar el perfil', message: 'Inténtalo de nuevo.' });
    }
  }
  return h('button', { class: 'btn btn--danger btn--block', type: 'button', onClick }, icon('trash', 20), 'Borrar este perfil');
}
