/** Pregunta de construir con fichas: answer = fichas en orden, extra = fichas de más para confundir. */
export function wordsQ(prompt, answer, extra, explain) {
  return { type: 'words', prompt, answer, extra, explain };
}
