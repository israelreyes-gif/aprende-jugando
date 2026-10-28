import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { getProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { formatNumber } from './format-points.js';
import { levelFor, levelsFor } from './levels.js';
import { loadPointsOrNull } from './load-points.js';
import { levelCard } from './ui/level-card.js';

/** Lista de los 10 niveles, con el actual marcado. */
export async function levelsScreen({ pid }) {
  const [profile, points] = await Promise.all([getProfile(pid), loadPointsOrNull(pid)]);
  if (!profile) return notFoundView();

  const current = points ? levelFor(points.total, profile.gender).n : 0;
  const rows = levelsFor(profile.gender).map((level) =>
    h(
      'li',
      { class: `level-row${level.n === current ? ' level-row--current' : ''}${level.n < current ? ' level-row--done' : ''}`, 'aria-current': level.n === current ? 'true' : null },
      h('span', { class: 'level-row__emoji', 'aria-hidden': 'true' }, level.emoji),
      h('span', { class: 'level-row__name' }, `${level.n} · ${level.name}`),
      h('span', { class: 'level-row__min' }, level.n === current ? `${formatNumber(level.min)} ◀` : formatNumber(level.min)),
    ),
  );

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Mis niveles', sub: profile.name, back: paths.courses(pid), profile }),
    h(
      'div',
      { class: 'screen__body' },
      points ? levelCard({ points, gender: profile.gender }) : h('p', { class: 'note note--empty' }, 'No se han podido cargar tus puntos. Revisa la conexión.'),
      h('p', { class: 'lead' }, 'Cada acierto suma 1 punto, cada fallo resta 1 y cada tema estudiado suma 10. Terminar una sesión en positivo da +5 extra.'),
      h('ul', { class: 'level-list' }, rows),
    ),
  );
}
