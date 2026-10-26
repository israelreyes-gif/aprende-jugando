/** Generador de números al azar con semilla (mulberry32): la misma semilla da siempre la misma secuencia. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ejecuta fn (que debe ser síncrona) con Math.random fijado por la semilla y después lo deja como estaba.
 * Sirve para volver a crear exactamente la misma pregunta de un generador.
 */
export function withSeed(seed, fn) {
  const original = Math.random;
  Math.random = mulberry32(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}
