export const PIN_PATTERN = /^\d{4,8}$/;

/** Devuelve el mensaje de error, o '' si el PIN nuevo es válido. */
export function validateNewPin(pin, confirm) {
  if (!PIN_PATTERN.test(pin)) return 'El PIN debe tener entre 4 y 8 números.';
  if (pin !== confirm) return 'Los dos PIN no coinciden.';
  return '';
}
