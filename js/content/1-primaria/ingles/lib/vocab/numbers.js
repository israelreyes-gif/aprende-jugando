// Números. 0–20 y decenas: de su cuaderno. 21–99 compuestos, años y centenas: aplican la misma regla (Claude, por validar).
export const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const TENS = { 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety' };

/** 0–99 en inglés ("twenty-one"). */
export function words99(n) {
  if (n <= 20) return ONES[n];
  const t = Math.floor(n / 10) * 10;
  return n % 10 === 0 ? TENS[t] : `${TENS[t]}-${ONES[n % 10]}`;
}
/** Respuestas válidas al escribir: con guion y con espacio ("twenty-one" / "twenty one"). */
export const writeVariants = (text) => [...new Set([text, text.replace(/-/g, ' ')])];

export const numbers0to20 = ONES.map((en, n) => ({ n, en }));
export const tens = [20, 30, 40, 50, 60, 70, 80, 90].map((n) => ({ n, en: TENS[n] }));
