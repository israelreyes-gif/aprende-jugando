import { h } from '../../core/dom.js';

/** Cabecera de la pantalla de inicio: título y la mochila de la app. */
export function homeBanner() {
  return h(
    'div',
    { class: 'home__banner' },
    h('div', { class: 'home__hero' }, h('p', { class: 'eyebrow' }, 'Aprende y juega'), h('h1', { class: 'title-xl' }, '¿Quién va a estudiar hoy?')),
    h('img', { class: 'home__mascot', src: 'icons/mochila.svg', alt: '', width: 112, height: 112 }),
  );
}
