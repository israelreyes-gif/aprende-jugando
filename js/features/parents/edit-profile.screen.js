import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { getProfile, updateProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { toast } from '../../shared/toast.js';
import { profileForm } from '../profiles/profile-form.js';
import { withParentsGate } from './pin-gate.js';

async function renderEditProfile({ pid }) {
  const profile = await getProfile(pid);
  if (!profile) return notFoundView();

  const form = profileForm({
    initial: { name: profile.name, color: profile.avatar_color },
    submitLabel: 'Guardar cambios',
    errorText: 'No se han podido guardar los cambios. Inténtalo de nuevo.',
    onSave: async ({ name, color }) => {
      await updateProfile(pid, { name, color });
      toast('Perfil actualizado');
      go(paths.childStats(pid));
    },
  });

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Editar perfil', sub: profile.name, back: paths.childStats(pid), shield: true }),
    h('div', { class: 'screen__body' }, form),
  );
}

export function editProfileScreen(params) {
  return withParentsGate(() => renderEditProfile(params));
}
