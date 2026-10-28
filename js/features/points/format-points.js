/** 1050 -> "1.050" */
export const formatNumber = (n) => String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Con signo: 6 -> "+6", -3 -> "−3", 0 -> "0". */
export function signed(n) {
  if (n > 0) return `+${formatNumber(n)}`;
  if (n < 0) return `−${formatNumber(n)}`;
  return '0';
}

/** 6 -> "+6 puntos", -1 -> "−1 punto". */
export const pointsText = (n) => `${signed(n)} ${Math.abs(n) === 1 ? 'punto' : 'puntos'}`;
