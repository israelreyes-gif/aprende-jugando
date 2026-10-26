import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { icon } from '../../shared/icons.js';
import { RETO_SIZE } from './reto-size.js';
import { streakBadge } from './streak-badge.js';

/**
 * Tarjeta del reto de hoy, arriba en la pantalla de asignaturas.
 * status: { reto, streak } o null si no se pudo consultar (entonces se ofrece empezar sin racha).
 */
export function retoCard({ profile, course, status }) {
  const reto = status?.reto;
  const streak = status?.streak ?? 0;
  const badge = streak > 0 ? streakBadge(streak) : null;
  const total = reto?.plan.length || RETO_SIZE;

  if (reto?.finished) {
    return h(
      'div',
      { class: 'reto-card reto-card--done' },
      h('span', { class: 'reto-card__icon' }, icon('check', 26)),
      h('span', { class: 'reto-card__text' }, h('span', { class: 'reto-card__title' }, '¡Reto de hoy hecho!'), h('span', { class: 'reto-card__sub' }, 'Vuelve mañana para seguir la racha')),
      badge,
    );
  }

  const answered = reto?.answers.length || 0;
  return h(
    'a',
    { class: 'reto-card', href: paths.reto(profile.id, course.id), 'aria-label': 'Reto de hoy' },
    h(
      'div',
      { class: 'reto-card__head' },
      h('span', { class: 'reto-card__icon' }, icon('flame', 26)),
      h(
        'span',
        { class: 'reto-card__text' },
        h('span', { class: 'reto-card__title' }, 'Reto de hoy'),
        h('span', { class: 'reto-card__sub' }, answered > 0 ? `Llevas ${answered} de ${total}` : `${total} preguntas de todas las asignaturas`),
      ),
      badge,
    ),
    h('span', { class: 'reto-card__cta' }, answered > 0 ? 'Seguir el reto' : 'Empezar el reto'),
  );
}
