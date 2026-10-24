import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { isConfigured } from '../../core/api.js';
import { appHeader } from '../../shared/app-header.js';
import { connectionForm } from './connection-form.js';

/** Pantalla de conexión con el Worker. Se muestra la primera vez en cada dispositivo. */
export async function setupScreen() {
  return h(
    'main',
    { class: 'screen' },
    appHeader({
      title: 'Conectar la app',
      sub: 'Solo hace falta una vez en cada dispositivo',
      back: isConfigured() ? paths.home() : null,
      shield: true,
    }),
    h(
      'div',
      { class: 'screen__body' },
      h('p', { class: 'lead' }, 'Estos datos se guardan solo en este dispositivo.'),
      connectionForm({ onSaved: () => go(paths.home()) }),
    ),
  );
}
