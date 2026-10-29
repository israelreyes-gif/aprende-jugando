/**
 * Agrupa temas seguidos que comparten `unit` (por ejemplo "Unit 1 · Practice Time").
 * Los temas sin `unit` quedan en un grupo sin título. Devuelve [{ unit, items: [{ topic, index }] }].
 */
export function groupTopics(topics) {
  const groups = [];
  topics.forEach((topic, index) => {
    const unit = topic.unit || null;
    const last = groups[groups.length - 1];
    if (last && last.unit === unit) last.items.push({ topic, index });
    else groups.push({ unit, items: [{ topic, index }] });
  });
  return groups;
}
