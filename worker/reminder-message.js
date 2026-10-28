const TAG = 'reto-recordatorio'; // el aviso de la tarde sustituye al de la mañana si sigue en el móvil

const daysInARow = (n) => (n === 1 ? '1 día seguido' : `${n} días seguidos`);

/** El aviso de cada momento. slot: 'morning' | 'evening'. streak: días de racha (0 = sin racha). */
export function reminderMessage({ slot, name, streak, url }) {
  if (slot === 'morning') {
    return { title: `¡Buenos días, ${name}! ☀️`, body: 'Tu reto de hoy te está esperando. Son solo 10 preguntas.', tag: TAG, url };
  }
  if (streak > 0) {
    return { title: `¡No pierdas tu racha, ${name}! 🔥`, body: `Llevas ${daysInARow(streak)}. Haz el reto de hoy y sigue sumando.`, tag: TAG, url };
  }
  return { title: `¡Todavía estás a tiempo, ${name}!`, body: 'Haz hoy tu reto de 10 preguntas antes de que acabe el día.', tag: TAG, url };
}
