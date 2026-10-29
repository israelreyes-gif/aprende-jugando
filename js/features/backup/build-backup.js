import { readWholeTable } from '../../data/backup.repo.js';
import { BACKUP_TABLES } from './backup-tables.js';

/** Lee todas las tablas y devuelve el contenido de la copia. */
export async function buildBackup(now = new Date()) {
  const tables = {};
  for (const table of BACKUP_TABLES) tables[table] = await readWholeTable(table);
  return { app: 'aprende-y-juega', format: 1, created_at: now.toISOString(), tables };
}
