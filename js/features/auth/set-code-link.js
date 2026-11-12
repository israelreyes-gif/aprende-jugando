import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { icon } from '../../shared/icons.js';

/** Botón de padres: lleva a poner un código nuevo a un perfil (si lo ha olvidado). */
export const setCodeLink = (profile) =>
  h('a', { class: 'btn btn--outline btn--block', href: paths.profileCode(profile.id) }, icon('lock', 22), 'Poner código nuevo');
