// Avisos de esta pestaña (se olvidan al cerrar la app): qué perfiles se han abierto con su código y cuáles se pueden editar.
const ENTERED = 'aj.entered.';
const EDIT = 'aj.edit.';

const put = (key) => {
  try { sessionStorage.setItem(key, '1'); } catch { /* sin almacenamiento */ }
};
const has = (key) => {
  try { return sessionStorage.getItem(key) === '1'; } catch { return false; }
};

export const markEntered = (pid) => put(ENTERED + pid);
export const isEntered = (pid) => has(ENTERED + pid);
export const markEditOk = (pid) => put(EDIT + pid);
export const isEditOk = (pid) => has(EDIT + pid);

/** Al volver a la pantalla de inicio se olvida todo: la próxima tarjeta que se toque pedirá el código si lo pide siempre. */
export function resetFlags() {
  try {
    for (const key of Object.keys(sessionStorage)) if (key.startsWith(ENTERED) || key.startsWith(EDIT)) sessionStorage.removeItem(key);
  } catch {
    /* sin almacenamiento */
  }
}
