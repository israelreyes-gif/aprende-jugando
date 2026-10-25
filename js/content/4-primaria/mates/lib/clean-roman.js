/** Deja solo las letras en mayúsculas: « xl-ix » -> «XLIX». Para comparar lo que escribe el niño. */
export function cleanRoman(texto) {
  return String(texto ?? '').toUpperCase().replace(/[^A-Z]/g, '');
}
