import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { getProfile, updateProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { notify } from '../../shared/modal.js';
import { bellRow } from '../push/bell-row.js';
import { askAlwaysRow } from '../auth/ask-always-row.js';
import { logoutButton } from '../auth/logout-button.js';
import { profileForm } from './profile-form.js';

/** Pantalla para cambiar nombre, color y chico/chica de un perfil y activar sus avisos en este móvil. */
export async function editProfileScreen({ pid }) {
  const profile = await getProfile(pid);
  if (!profile) return notFoundView();

  const askAlways = askAlwaysRow({ initial: profile.ask_always });
  let form = null;
  form = profileForm({
    showCompletion: true,
    initial: { name: profile.name, color: profile.avatar_color, gender: profile.gender },
    submitLabel: 'Guardar cambios',
    errorText: 'No se han podido guardar los cambios. Inténtalo de nuevo.',
    extra: h('div', { class: 'stack' }, bellRow({
      kind: 'child',
      profileId: pid,
      onState: (active) => form && form.setBell(active),
      title: 'Avisos del reto',
      meta: 'Recordatorio si el reto del día no está hecho',
      welcome: { title: 'Avisos activados', body: `Recibirás un recordatorio si ${profile.name} no ha hecho el reto del día.`, tag: 'avisos-activados' },
    }), askAlways),
    onSave: async ({ name, color, gender }) => {
      await updateProfile(pid, { name, color, gender, askAlways: askAlways.value() });
      await notify({ kind: 'success', title: 'Perfil actualizado', message: `Los cambios de ${name.trim()} se han guardado.` });
      go(paths.home());
    },
  });

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Editar perfil', sub: profile.name, back: paths.home() }),
    h('div', { class: 'screen__body' }, form, h('a', { class: 'btn btn--outline btn--block', href: paths.changeCode(pid) }, 'Cambiar mi código'), logoutButton(pid)),
  );
}
