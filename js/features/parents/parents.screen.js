import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { icon } from '../../shared/icons.js';
import { createPinView } from './pin/create-pin-view.js';
import { lock } from './pin/unlock-state.js';
import { withParentsGate } from './pin-gate.js';
import { profileRow } from './profile-row.js';

async function renderParents() {
  const profiles = await listProfiles();

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Zona de padres', sub: 'Estadísticas y refuerzo', back: paths.home(), shield: true }),
    h(
      'div',
      { class: 'screen__body' },
      h('p', { class: 'lead' }, profiles.length ? 'Elige un perfil para ver cómo va.' : 'Todavía no hay perfiles. Crea el primero desde el inicio.'),
      h('div', { class: 'stack' }, profiles.map(profileRow)),
      h('div', { class: 'spacer' }),
      h('a', { class: 'btn btn--outline btn--block', href: paths.parentsPin() }, 'Cambiar PIN'),
      h('button', { class: 'btn btn--primary btn--block', type: 'button', onClick: () => {
        lock();
        go(paths.home());
      } }, icon('lock', 22), 'Bloquear y salir'),
    ),
  );
}

export function parentsScreen() {
  return withParentsGate(renderParents);
}

/** Cambiar el PIN (requiere haber entrado ya en la zona de padres). */
export function changePinScreen() {
  return withParentsGate(async () => createPinView({ back: paths.parents(), onDone: () => go(paths.parents()) }));
}
