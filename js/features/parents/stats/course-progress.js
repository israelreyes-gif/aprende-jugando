/**
 * Progreso del curso por asignatura: temas con contenido, liberados y estudiados.
 * topicsBySubject: { subjectId: [temas de loadTopics] }
 * releasedRows / studiedRows: filas de topic_release y study_progress del perfil.
 * "studied" cuenta solo temas liberados, así que nunca supera a "released".
 */
export function courseProgress(subjectIds, topicsBySubject, courseId, releasedRows, studiedRows) {
  const idsOf = (rows, subjectId) => new Set(rows.filter((r) => r.course_id === courseId && r.subject_id === subjectId).map((r) => r.topic_id));

  return subjectIds.map((subjectId) => {
    const withContent = (topicsBySubject[subjectId] || []).filter((t) => t.available);
    const released = idsOf(releasedRows, subjectId);
    const studied = idsOf(studiedRows, subjectId);
    const open = withContent.filter((t) => released.has(t.id));
    return {
      subjectId,
      total: withContent.length,
      released: open.length,
      studied: open.filter((t) => studied.has(t.id)).length,
    };
  });
}
