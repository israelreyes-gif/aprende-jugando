import { h } from '../core/dom.js';
import { icon } from './icons.js';
import { avatar } from './avatar.js';

/**
 * Cabecera de las pantallas interiores.
 * back: dirección a la que vuelve el botón (o null)
 * profile: si se indica, muestra su icono a la derecha
 * shield: muestra el escudo de la zona de padres
 */
export function appHeader({ title, sub, back, profile, shield = false }) {
  return h(
    'header',
    { class: 'app-header' },
    back ? h('a', { class: 'icon-btn', href: back, 'aria-label': 'Volver' }, icon('back')) : null,
    h('div', { class: 'app-header__text' }, h('h1', { class: 'app-header__title' }, title), sub ? h('p', { class: 'app-header__sub' }, sub) : null),
    profile ? avatar(profile, 'sm') : null,
    shield ? h('div', { class: 'app-header__badge', 'aria-hidden': 'true' }, icon('shield', 28)) : null,
  );
}
