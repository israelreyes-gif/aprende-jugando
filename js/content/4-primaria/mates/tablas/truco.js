/** Truco para recordar la multiplicación a × b según los números que intervienen. */
export function truco(a, b) {
  if (a === 9 || b === 9) return 'Truco del 9: 10 × n − n.';
  if (a === 6 || b === 6) return 'Truco del 6: 5 × n + n.';
  if (a === 4 || b === 4) return 'Truco del 4: el doble del doble.';
  return 'Recuerda que a × b = b × a.';
}
