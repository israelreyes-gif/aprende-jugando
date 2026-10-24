/** Devuelve el mensaje de error, o '' si los datos de conexión son válidos. */
export function validateConnection(url, key) {
  if (!/^https:\/\/.+/i.test(url)) return 'La dirección debe empezar por https://';
  if (!key) return 'Escribe la clave de conexión.';
  return '';
}
