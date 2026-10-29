import { BACKUP_TABLES } from './backup-tables.js';

/** Comprueba que el contenido es una copia de esta app y lo deja listo para importar. Lanza un Error con un mensaje claro si no. */
export function checkBackup(data) {
  if (!data || typeof data !== 'object' || data.app !== 'aprende-y-juega') throw new Error('Este archivo no es una copia de esta app.');
  if (data.format !== 1) throw new Error('Esta copia es de una versión que no sé leer.');
  const tables = {};
  for (const name of BACKUP_TABLES) {
    const rows = data.tables?.[name];
    const valid = Array.isArray(rows) && rows.every((row) => row && typeof row === 'object' && typeof row.id === 'string');
    if (!valid) throw new Error(`La copia está incompleta o estropeada (${name}).`);
    tables[name] = rows;
  }
  return { created_at: data.created_at, tables };
}
