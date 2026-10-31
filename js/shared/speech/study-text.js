/**
 * Lo que se lee de una línea de la lección.
 *   «hop → saltar»          → hop            (inglés a la izquierda)
 *   «3:05 → five past three» → five past three (la izquierda empieza por un número: se lee la derecha)
 *   una frase larga con flecha se lee entera
 * Se quitan los paréntesis (llevan aclaraciones en español), las barras y los puntos suspensivos.
 */
export function studyText(line) {
  let text = String(line);
  if (text.includes('→')) {
    const [left, right] = text.split('→');
    if (/^\s*\d/.test(left)) text = right;
    else if (left.trim().split(/\s+/).length > 4) text = `${left},${right}`;
    else text = left;
  }
  return text
    .replace(/\([^)]*\)/g, '')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s*=\s*/g, ', ')
    .replace(/…/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,?!])/g, '$1')
    .trim();
}
