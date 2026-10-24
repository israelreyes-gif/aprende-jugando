import { h } from '../core/dom.js';

function initialOf(name) {
  return (String(name || '').trim().charAt(0) || '?').toUpperCase();
}

/** Icono redondo del perfil. size: sm | md | lg | xl */
export function avatar(profile, size = 'md') {
  return h(
    'span',
    { class: `avatar avatar--${size}`, style: { '--avatar-color': profile.avatar_color } },
    initialOf(profile.name),
  );
}
