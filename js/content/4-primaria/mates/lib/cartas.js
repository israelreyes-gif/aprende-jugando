/** Dibujo de cartas con una cifra (o letra) cada una. Para el campo `visual` de una pregunta. */
export function cartas(valores) {
  return `<div class="digit-cards">${valores.map((v) => `<span class="digit-card">${v}</span>`).join('')}</div>`;
}
