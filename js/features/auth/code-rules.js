import { PARENT_OWNER } from '../../core/api/session-store.js';

export const MAX_DIGITS = 8;
export const minDigits = (owner) => (owner === PARENT_OWNER ? 6 : 4);

/** Mensaje de error si el código no vale, o '' si es válido. */
export function codeProblem(code, owner) {
  const min = minDigits(owner);
  if (!new RegExp(`^\\d{${min},${MAX_DIGITS}}$`).test(code)) return `El código debe tener entre ${min} y ${MAX_DIGITS} números.`;
  return '';
}

const allSame = (code) => /^(\d)\1+$/.test(code);
const sequence = (code) => {
  const d = [...code].map(Number);
  return d.every((n, i) => i === 0 || n === d[i - 1] + 1) || d.every((n, i) => i === 0 || n === d[i - 1] - 1);
};

/** Fuerza del código: level 0 (vacío) a 3, con su texto. Cuantas menos cifras, más débil; repetidas o seguidas (1111, 1234) también. */
export function codeStrength(code) {
  if (!code) return { level: 0, label: '' };
  let level = code.length >= 7 ? 3 : code.length >= 5 ? 2 : 1;
  if (code.length > 1 && (allSame(code) || sequence(code))) level = 1;
  return { level, label: ['', 'Débil', 'Normal', 'Fuerte'][level] };
}
