/** Agrupa las respuestas por tema: [{ subjectId, topicId, results }]. */
export function groupByTopic(answers) {
  const groups = new Map();
  for (const answer of answers) {
    const key = `${answer.subjectId}/${answer.topicId}`;
    if (!groups.has(key)) groups.set(key, { subjectId: answer.subjectId, topicId: answer.topicId, results: [] });
    groups.get(key).results.push(answer);
  }
  return [...groups.values()];
}
