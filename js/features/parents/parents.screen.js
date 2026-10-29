import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { hasChildDevice } from '../../data/push-devices.js';
import { profileCompletion } from '../profiles/profile-completion.js';
import { loadPointsOrNull } from '../points/load-points.js';
import { backupCard } from '../backup/backup-card.js';
import { isBackupDue } from '../backup/backup-due.js';
import { loadLastBackup } from '../backup/last-backup.js';
import { appHeader } from '../../shared/app-header.js';
import { icon } from '../../shared/icons.js';
import { parentsBell } from './parents-bell.js';
import { createPinView } from './pin/create-pin-view.js';
import { lock } from './pin/unlock-state.js';
import { withParentsGate } from './pin-gate.js';
import { profileRow } from './profile-row.js';

async function renderParents() {
  const profiles = await listProfiles();
  const points = await Promise.all(profiles.map((profile) => loadPointsOrNull(profile.id)));
  const bells = await Promise.all(profiles.map((profile) => hasChildDevice(profile.id)));
  const last = await loadLastBackup();
  const due = isBackupDue(last);
  const backup = backupCard({ last, due });
  const completions = profiles.map((profile, i) => profileCompletion({ name: profile.name, color: profile.avatar_color, gender: profile.gender, bell: bells[i] }));

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Zona de padres', sub: 'Estadísticas y refuerzo', back: paths.home(), shield: true }),
    h(
      'div',
      { class: 'screen__body' },
      h('p', { class: 'lead' }, profiles.length ? 'Elige un perfil para ver cómo va.' : 'Todavía no hay perfiles. Crea el primero desde el inicio.'),
      due ? backup : null,
      h('div', { class: 'stack' }, profiles.map((profile, i) => profileRow(profile, points[i], completions[i]))),
      parentsBell(),
      due ? null : backup,
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
