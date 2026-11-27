/**
 * Entradas del plan que aún faltan por responder.
 * Se empareja por identidad (asignatura, tema y pregunta), no por posición: así, aunque cambie el contenido
 * y alguna entrada ya no se pueda mostrar, las respuestas ya dadas no se desplazan sobre otras preguntas.
 * Se recorre el plan en orden y cada respuesta tapa la primera entrada igual que aún no esté tapada.
 */
export function pendingPlan(plan, answers) {
  let next = 0;
  return plan.filter((entry) => {
    const a = answers[next];
    if (a && a.subjectId === entry.subjectId && a.topicId === entry.topicId && a.questionId === entry.exerciseId) {
      next += 1;
      return false;
    }
    return true;
  });
}
