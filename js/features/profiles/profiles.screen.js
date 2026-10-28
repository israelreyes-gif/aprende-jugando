import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { icon } from '../../shared/icons.js';
import { loadPointsOrNull } from '../points/load-points.js';
import { homeBanner } from './home-banner.js';
import { addProfileCard, profileCard } from './profile-cards.js';

/** Primera pantalla: selección de perfil. */
export async function profilesScreen() {
  const profiles = await listProfiles();
  const points = await Promise.all(profiles.map((profile) => loadPointsOrNull(profile.id)));

  return h(
    'main',
    { class: 'screen screen--home' },
    h(
      'div',
      { class: 'screen__body' },
      homeBanner(),
      h('div', { class: 'grid-2' }, profiles.map((profile, i) => profileCard(profile, points[i])), addProfileCard()),
      h('a', { class: 'btn btn--outline btn--block home__parents', href: paths.parents() }, icon('lock', 22), 'Zona de padres'),
    ),
  );
}
