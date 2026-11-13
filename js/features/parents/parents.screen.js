import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { hasChildDevice } from '../../data/push-devices.js';
import { profileCompletion } from '../profiles/profile-completion.js';
import { loadPointsOrNull } from '../points/load-points.js';
import { backupCard } from '../backup/backup-card.js';
import { isBackupDue } from '../backup/backup-due.js';
import { loadLastBackup } from '../backup/last-backup.js';
import { restoreCard } from '../backup/restore-card.js';
import { appHeader } from '../../shared/app-header.js';
import { PARENT_OWNER } from '../../core/api/session-store.js';
import { logoutButton } from '../auth/logout-button.js';
import { parentsBell } from './parents-bell.js';
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
      restoreCard(),
      h('div', { class: 'spacer' }),
      h('a', { class: 'btn btn--outline btn--block', href: paths.faceId() }, 'Face ID'),
      h('a', { class: 'btn btn--outline btn--block', href: paths.parentsCode() }, 'Cambiar código'),
      logoutButton(PARENT_OWNER, 'Cerrar sesión de padres'),
    ),
  );
}

export const parentsScreen = renderParents;
