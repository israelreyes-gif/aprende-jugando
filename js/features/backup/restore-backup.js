import { insertMissingRows } from '../../data/backup.repo.js';
import { BACKUP_TABLES } from './backup-tables.js';

/** Importa la copia añadiendo solo lo que falta (sin borrar ni cambiar nada). Devuelve cuántas filas nuevas se han añadido. */
export async function restoreBackup(backup) {
  let added = 0;
  for (const table of BACKUP_TABLES) added += await insertMissingRows(table, backup.tables[table]);
  return added;
}
