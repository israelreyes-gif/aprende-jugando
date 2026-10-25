import { h } from '../../../core/dom.js';
import { go } from '../../../core/router.js';
import { paths } from '../../../core/paths.js';
import { deleteProfile } from '../../../data/profiles.repo.js';
import { icon } from '../../../shared/icons.js';
import { toast } from '../../../shared/toast.js';

/** Botón para borrar un perfil y todo su progreso (pide confirmación). */
export function deleteProfileButton(profile) {
  async function onClick() {
    if (!window.confirm(`¿Borrar el perfil de ${profile.name} y todo su progreso? Esto no se puede deshacer.`)) return;
    try {
      await deleteProfile(profile.id);
      go(paths.parents());
    } catch (err) {
      console.error(err);
      toast('No se ha podido borrar el perfil');
    }
  }
  return h('button', { class: 'btn btn--danger btn--block', type: 'button', onClick }, icon('trash', 20), 'Borrar este perfil');
}
