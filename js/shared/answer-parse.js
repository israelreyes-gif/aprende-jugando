/** Convierte lo que escribe el niño en número ("223.348" -> 223348). Vacío -> NaN. */
export function toNum(value) {
  const clean = String(value ?? '').replace(/[\s.]/g, '');
  return clean === '' ? NaN : Number(clean);
}
