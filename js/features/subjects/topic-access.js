import { listReleased } from '../../data/release.repo.js';

/** ¿Ha liberado la familia este tema para este perfil? */
export async function isTopicReleased(profileId, subjectId, topicId) {
  const rows = await listReleased(profileId, { subjectId });
  return rows.some((row) => row.topic_id === topicId);
}
