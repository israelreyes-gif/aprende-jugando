/** Escribe un número con puntos de miles: 223348 -> "223.348". */
export function fmt(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
