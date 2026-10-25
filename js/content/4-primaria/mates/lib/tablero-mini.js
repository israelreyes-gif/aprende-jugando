/** Cuadrado de 4 casillas: rojas en la diagonal principal y verdes en la otra. Para el campo `visual` de una pregunta. */
export function tableroMini([r1, v1, v2, r2]) {
  return `<div class="mini-board"><span class="mini-board__r">${r1}</span><span class="mini-board__g">${v1}</span><span class="mini-board__g">${v2}</span><span class="mini-board__r">${r2}</span></div>`;
}
