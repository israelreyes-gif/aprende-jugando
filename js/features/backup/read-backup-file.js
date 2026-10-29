import { checkBackup } from './check-backup.js';

/** Lee un archivo elegido por la persona y devuelve la copia ya comprobada. */
export async function readBackupFile(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error('No se puede leer el archivo: no es una copia válida.');
  }
  return checkBackup(data);
}
