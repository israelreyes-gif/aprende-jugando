/** Entero al azar entre min y max, ambos incluidos. */
export function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Elemento al azar de una lista. */
export function pick(items) {
  return items[rnd(0, items.length - 1)];
}

/** Devuelve una copia desordenada del array (Fisher-Yates). */
export function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
