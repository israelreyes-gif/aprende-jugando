/**
 * Quita el artículo del principio de un texto ya normalizado ("el leon" -> "leon", "una casa" -> "casa").
 * Solo lo quita si queda algo detrás: "el" o "la" solos se quedan como están (pueden ser la respuesta).
 */
export function stripArticle(normalized) {
  const match = /^(?:el|la|los|las|un|una) (.+)$/.exec(normalized);
  return match ? match[1] : normalized;
}
