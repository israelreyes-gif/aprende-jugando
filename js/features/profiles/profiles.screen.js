import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { icon } from '../../shared/icons.js';
import { homeBanner } from './home-banner.js';
import { addProfileCard, profileCard } from './profile-cards.js';

/** Primera pantalla: selección de perfil. */
export async function profilesScreen() {
  const profiles = await listProfiles();

  return h(
    'main',
    { class: 'screen screen--home' },
    h(
      'div',
      { class: 'screen__body' },
      homeBanner(),
      h('div', { class: 'grid-2' }, profiles.map(profileCard), addProfileCard()),
      h('a', { class: 'btn btn--outline btn--block home__parents', href: paths.parents() }, icon('lock', 22), 'Zona de padres'),
    ),
  );
}
