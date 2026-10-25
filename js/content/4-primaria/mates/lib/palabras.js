import { UNIDADES, DECENAS, CENTENAS } from './palabras-tablas.js';

const hasta99 = (n) => (n < 30 ? UNIDADES[n] : DECENAS[Math.floor(n / 10)] + (n % 10 ? ' y ' + UNIDADES[n % 10] : ''));
const hasta999 = (n) => (n === 100 ? 'cien' : [CENTENAS[Math.floor(n / 100)], n % 100 ? hasta99(n % 100) : ''].filter(Boolean).join(' '));
// Delante de «mil» el uno se apocopa: veintiún mil, treinta y un mil.
const apocope = (s) => s.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');

/** Número entero de 1 a 999 999 escrito con palabras: 21500 -> «veintiún mil quinientos». */
export function palabras(n) {
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  let s = miles ? (miles === 1 ? 'mil' : apocope(hasta999(miles)) + ' mil') : '';
  if (resto) s += (s ? ' ' : '') + hasta999(resto);
  return s;
}
