/** Días que pueden pasar sin hacer copia antes de avisar. */
export const BACKUP_MAX_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

export function backupAgeDays(iso, now = new Date()) {
  return Math.max(0, Math.floor((now - new Date(iso)) / DAY));
}

/** ¿Toca avisar? last: ISO, null (nunca) o undefined (no se pudo leer: no se avisa por si acaso). */
export function isBackupDue(last, now = new Date()) {
  if (last === undefined) return false;
  if (last === null) return true;
  return backupAgeDays(last, now) >= BACKUP_MAX_DAYS;
}
