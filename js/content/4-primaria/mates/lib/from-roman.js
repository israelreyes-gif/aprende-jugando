const VALOR = { I: 1, V: 5, X: 10, L: 50, C: 100 };

/** Romanos a número: «XLIX» -> 49. Devuelve NaN si hay letras que no son romanas. */
export function fromRoman(texto) {
  let total = 0;
  for (let i = 0; i < texto.length; i++) {
    const v = VALOR[texto[i]];
    const siguiente = VALOR[texto[i + 1]] || 0;
    if (!v) return NaN;
    total += v < siguiente ? -v : v;
  }
  return total;
}
