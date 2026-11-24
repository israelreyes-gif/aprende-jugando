// Escrituras pendientes que el servidor rechaza con un error suyo (5xx) una y otra vez.
// Si una lleva más de GIVE_UP_AFTER_MS fallando así, se descarta para que no bloquee las demás.
// Solo cuenta el tiempo en que el servidor contesta con error: estar sin conexión nunca descarta nada.
export const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

/** Identifica una escritura por su contenido (ignora las marcas que añade la propia cola). */
export const keyOf = (item) => JSON.stringify({ table: item.table, rows: item.rows, conflict: item.conflict, profileId: item.profileId });

/** ¿Es un error del servidor (no de red, ni de sesión, ni un límite temporal)? */
export const isServerError = (err) => err.status >= 500;

/** ¿Lleva demasiado tiempo fallando con errores del servidor? */
export const shouldGiveUp = (item, now = Date.now()) => Boolean(item.failingSince) && now - item.failingSince > GIVE_UP_AFTER_MS;

/** Copia de la cola con la escritura marcada como "fallando desde ahora" (si no lo estaba ya). */
export function markFailing(queue, item, now = Date.now()) {
  const key = keyOf(item);
  return queue.map((x) => (keyOf(x) === key && !x.failingSince ? { ...x, failingSince: now } : x));
}
