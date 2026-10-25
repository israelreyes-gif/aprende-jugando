/**
 * Pregunta de respuesta libre con varias soluciones válidas.
 * fields = [{ label, kind?: 'number' | 'text' }]; test(valores) -> true si la respuesta vale; example = una respuesta de ejemplo.
 */
export function ruleQ(prompt, fields, test, example, explain) {
  return { type: 'rule', prompt, fields, test, example, explain };
}
