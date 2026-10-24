import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

export function markStudied({ profileId, courseId, subjectId, topicId }) {
  return api.queueInsert('study_progress', {
    id: uuid(),
    profile_id: profileId,
    course_id: courseId,
    subject_id: subjectId,
    topic_id: topicId,
    completed_at: new Date().toISOString(),
  });
}

export function listStudied(profileId, { subjectId } = {}) {
  const where = { profile_id: profileId };
  if (subjectId) where.subject_id = subjectId;
  return api.list('study_progress', { where });
}
