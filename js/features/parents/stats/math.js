/** Porcentaje redondeado, o null si no hay datos. */
export const pctOf = (correct, total) => (total > 0 ? Math.round((correct * 100) / total) : null);

/** Suma el campo `key` de una lista de objetos. */
export const sum = (items, key) => items.reduce((acc, item) => acc + item[key], 0);
