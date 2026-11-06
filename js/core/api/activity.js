// Cuándo fue la última petición de la zona de padres. Sirve para avisar de que la sesión de padres ha caducado
// (el Worker la caduca tras 30 min sin peticiones) sin esperar a la siguiente petición.
let lastAt = Date.now();

export const touchParentActivity = () => {
  lastAt = Date.now();
};

export const parentIdleMs = () => Date.now() - lastAt;
