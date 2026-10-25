// Figuras planas del curso. n: nombre, s: lados, v: vértices, e: ejes de simetría, d: dibujo SVG (viewBox 0 0 100 100).
const regular = (lados, giro) =>
  Array.from({ length: lados }, (_, i) => {
    const a = ((giro + (360 / lados) * i) * Math.PI) / 180;
    return (50 + 40 * Math.cos(a)).toFixed(1) + ',' + (50 + 40 * Math.sin(a)).toFixed(1);
  }).join(' ');

export const figuras = [
  { n: 'triángulo', s: 3, v: 3, e: 3, d: '<polygon points="50,14 90,83 10,83"/>' },
  { n: 'cuadrado', s: 4, v: 4, e: 4, d: '<polygon points="20,20 80,20 80,80 20,80"/>' },
  { n: 'rectángulo', s: 4, v: 4, e: 2, d: '<polygon points="8,28 92,28 92,72 8,72"/>' },
  { n: 'rombo', s: 4, v: 4, e: 2, d: '<polygon points="50,8 88,50 50,92 12,50"/>' },
  { n: 'trapecio', s: 4, v: 4, e: 1, d: '<polygon points="28,25 72,25 92,75 8,75"/>' },
  { n: 'pentágono', s: 5, v: 5, e: 5, d: `<polygon points="${regular(5, -90)}"/>` },
  { n: 'hexágono', s: 6, v: 6, e: 6, d: `<polygon points="${regular(6, 0)}"/>` },
  { n: 'octógono', s: 8, v: 8, e: 8, d: `<polygon points="${regular(8, -67.5)}"/>` },
  { n: 'semicírculo', s: 0, v: 0, e: 1, d: '<path d="M8 70 A42 42 0 0 1 92 70 Z"/>' },
];
