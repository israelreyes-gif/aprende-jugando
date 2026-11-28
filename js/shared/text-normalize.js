const ENE = ''; // marca temporal para que la ñ no pierda su tilde al quitar las demás

/** Texto sin tildes, mayúsculas, signos ni espacios dobles, para comparar respuestas. La ñ se conserva (no es lo mismo "ano" que "año"). */
export function norm(text) {
  return String(text)
    .toLowerCase()
    .replace(/ñ/g, ENE)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(new RegExp(ENE, 'g'), 'ñ')
    .replace(/[^a-z0-9ñ ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
