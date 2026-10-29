const HOURS = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

/** Nombre de la hora (1-12) en inglés. */
export function hourWord(h) {
  return HOURS[h % 12];
}

/** Hora en inglés: (3, 45) → "quarter to four". Los minutos van de 5 en 5. */
export function timeWords(h, m) {
  if (m === 0) return `${hourWord(h)} o'clock`;
  if (m === 15) return `quarter past ${hourWord(h)}`;
  if (m === 30) return `half past ${hourWord(h)}`;
  if (m === 45) return `quarter to ${hourWord(h + 1)}`;
  if (m < 30) return `${minuteWord(m)} past ${hourWord(h)}`;
  return `${minuteWord(60 - m)} to ${hourWord(h + 1)}`;
}

function minuteWord(m) {
  return { 5: 'five', 10: 'ten', 20: 'twenty', 25: 'twenty-five' }[m];
}

/** Hora en cifras: (3, 5) → "3:05". */
export function digital(h, m) {
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** Todas las horas posibles (de 5 en 5 minutos). */
export function allTimes() {
  const out = [];
  for (let h = 1; h <= 12; h++) for (let m = 0; m < 60; m += 5) out.push({ h, m });
  return out;
}
