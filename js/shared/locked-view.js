import { h } from '../core/dom.js';
import { icon } from './icons.js';
import { appHeader } from './app-header.js';

/** Pantalla para un tema que existe pero todavía no está liberado. */
export function lockedView({ t, subject, profile, topic, back }) {
  return h(
    'main',
    { class: 'screen', style: { '--tint': subject.tint, '--deep': subject.deep } },
    appHeader({ title: topic.title, sub: subject.name, back, profile }),
    h(
      'div',
      { class: 'screen__body', lang: subject.lang },
      h(
        'div',
        { class: 'state', role: 'status' },
        icon('lock', 40),
        h('p', { class: 'title-lg' }, t.unavailableTitle),
        h('p', { class: 'state__text' }, t.unavailableText),
        h('a', { class: 'btn btn--outline', href: back }, t.backToTopics),
      ),
    ),
  );
}
