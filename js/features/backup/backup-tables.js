/** Tablas que entran en la copia. No van settings (PIN de padres) ni push_devices (móviles con avisos). */
export const BACKUP_TABLES = ['profiles', 'practice_sessions', 'answers', 'study_progress', 'topic_release', 'reto_diario', 'free_days', 'streak_shields'];

/** Tablas que las copias antiguas no traen: si faltan, se leen como vacías (no hacen la copia inválida). */
export const OPTIONAL_TABLES = new Set(['free_days', 'streak_shields']);
