// Pantallas en las que no se interrumpe con el aviso de versión nueva: ejercicios, reto y formularios de perfil.
const BUSY = [/\/practice\/[^/]+$/, /\/reto$/, /^\/new-profile$/, /^\/p\/[^/]+\/edit$/];

/** ¿Es esta dirección (por ejemplo '/p/1/c/4-primaria/reto') una pantalla en la que no conviene interrumpir? */
export const isBusyRoute = (path) => BUSY.some((pattern) => pattern.test(path));
