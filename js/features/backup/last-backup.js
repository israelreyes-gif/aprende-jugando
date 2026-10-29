import { getSetting, saveSetting } from '../../data/settings.repo.js';

const KEY = 'last_backup_at';

/** Fecha (ISO) de la última copia; null si nunca se ha hecho; undefined si no se ha podido leer. */
export async function loadLastBackup() {
  try {
    return await getSetting(KEY);
  } catch {
    return undefined;
  }
}

export function markBackupDone(now = new Date()) {
  return saveSetting(KEY, now.toISOString());
}
