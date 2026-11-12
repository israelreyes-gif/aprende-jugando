import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { icon } from '../../shared/icons.js';
import { resetFlags } from '../auth/flags.js';
import { homeBanner } from './home-banner.js';
import { addProfileCard, profileCard } from './profile-cards.js';

/** Primera pantalla: selección de perfil. */
export async function profilesScreen() {
  resetFlags(); // al volver al inicio, las tarjetas que piden el código siempre lo piden de nuevo
  const profiles = await listProfiles();

  return h(
    'main',
    { class: 'screen screen--home' },
    h(
      'div',
      { class: 'screen__body' },
      homeBanner(),
      h('div', { class: 'grid-2' }, profiles.map((profile) => profileCard(profile, Number.isFinite(profile.points_total) ? { total: profile.points_total } : null)), addProfileCard()),
      h('a', { class: 'btn btn--outline btn--block home__parents', href: paths.parents() }, icon('lock', 22), 'Zona de padres'),
    ),
  );
}
