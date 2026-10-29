import { BACKUP_TABLES } from './backup-tables.js';

const LABELS = {
  profiles: 'Perfiles',
  practice_sessions: 'Sesiones',
  answers: 'Respuestas',
  study_progress: 'Temas estudiados',
  topic_release: 'Temas liberados',
  reto_diario: 'Retos',
};

/** "Perfiles: 2 · Sesiones: 14 · …" para enseñar qué trae la copia antes de importarla. */
export function backupSummary(backup) {
  return BACKUP_TABLES.map((table) => `${LABELS[table]}: ${backup.tables[table].length.toLocaleString('es-ES')}`).join(' · ');
}

/** "29 de octubre de 2026", o "fecha desconocida". */
export function backupDateText(backup) {
  const date = new Date(backup.created_at);
  return Number.isNaN(date.getTime()) ? 'fecha desconocida' : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
