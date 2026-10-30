/** "a pencil" / "an apple". */
export function withArticle(word) {
  return /^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`;
}
