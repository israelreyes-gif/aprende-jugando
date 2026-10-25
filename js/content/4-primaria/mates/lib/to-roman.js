const VALORES = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

/** Número de 1 a 399 en romanos: 49 -> «XLIX». */
export function toRoman(n) {
  let s = '';
  for (const [valor, letra] of VALORES) {
    while (n >= valor) {
      s += letra;
      n -= valor;
    }
  }
  return s;
}
