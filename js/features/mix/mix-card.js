import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';

/** Tarjeta de un mix al final de su unidad (pestaña Ejercicios). Siempre se muestra; si aún no hay temas estudiados, lo explica al abrirla. */
export function mixCard({ profile, course, subject, mix, t }) {
  return h(
    'a',
    { class: 'card topic-card topic-card--open topic-card--mix', href: paths.mix(profile.id, course.id, subject.id, mix.id), style: { '--tint': subject.tint, '--deep': subject.deep } },
    h('span', { class: 'topic-card__tile', 'aria-hidden': 'true' }, mix.emoji || '🎲'),
    h('span', { class: 'topic-card__text' }, h('span', { class: 'topic-card__title' }, mix.title), h('span', { class: 'topic-card__meta' }, `🎮 ${t.mixQuestions(mix.size)}`)),
  );
}
