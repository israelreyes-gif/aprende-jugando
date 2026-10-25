/** Convierte lo que escribe el niño en número ("223.348" -> 223348, "3,5" -> 3.5). Vacío -> NaN. */
export function toNum(value) {
  const clean = String(value ?? '').replace(/[\s.]/g, '').replace(',', '.');
  return clean === '' ? NaN : Number(clean);
}
