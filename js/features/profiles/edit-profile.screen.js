import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { getProfile, updateProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { notify } from '../../shared/modal.js';
import { profileForm } from './profile-form.js';

/** Pantalla para cambiar el nombre y el color de un perfil. */
export async function editProfileScreen({ pid }) {
  const profile = await getProfile(pid);
  if (!profile) return notFoundView();

  const form = profileForm({
    initial: { name: profile.name, color: profile.avatar_color },
    submitLabel: 'Guardar cambios',
    errorText: 'No se han podido guardar los cambios. Inténtalo de nuevo.',
    onSave: async ({ name, color }) => {
      await updateProfile(pid, { name, color });
      await notify({ kind: 'success', title: 'Perfil actualizado', message: `Los cambios de ${name.trim()} se han guardado.` });
      go(paths.home());
    },
  });

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Editar perfil', sub: profile.name, back: paths.home() }),
    h('div', { class: 'screen__body' }, form),
  );
}
