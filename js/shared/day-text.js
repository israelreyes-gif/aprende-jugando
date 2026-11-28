/** "viernes, 27 de noviembre" para un día 'AAAA-MM-DD'. */
export const dayText = (day) => new Date(`${day}T00:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
