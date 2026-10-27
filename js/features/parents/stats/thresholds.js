/** Por debajo de este porcentaje de aciertos, un tema se marca como "necesita refuerzo". */
export const REINFORCE_BELOW = 75;
/** Por debajo de este porcentaje, el tema está en rojo (muy flojo). Entre este y REINFORCE_BELOW, en naranja. */
export const REINFORCE_RED_BELOW = 50;
/** Para el refuerzo se miran solo las últimas preguntas de cada tema (3 sesiones de 8 en ejercicios normales). */
export const REINFORCE_LAST_QUESTIONS = 24;
