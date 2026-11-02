import { pick } from '../../../../core/random.js';
import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wrongs } from './wrongs.js';

/**
 * Tres ejercicios de vocabulario para una lista [{ en, es, alt? }]:
 * inglés → español, español → inglés y escribir en inglés. `id` es el prefijo de los ids.
 */
export function vocabGens(list, id) {
  const ens = list.map((w) => w.en);
  const ess = list.map((w) => w.es);
  return [
    {
      id: `${id}-en-es`,
      generate() {
        const w = pick(list);
        return { ...choiceQ(`¿Qué significa "${w.en}"?`, w.es, wrongs(ess, w.es), `${w.en} = ${w.es}`), say: w.en };
      },
    },
    {
      id: `${id}-es-en`,
      generate() {
        const w = pick(list);
        return { ...choiceQ(`¿Cómo se dice "${w.es}" en inglés?`, w.en, wrongs(ens, w.en), `${w.es} = ${w.en}`), say: w.en };
      },
    },
    {
      id: `${id}-write`,
      generate() {
        const w = pick(list);
        return { ...textQ(`Escribe en inglés: ${w.es}`, [w.en, ...(w.alt || [])], `${w.es} = ${w.en}`), say: w.en };
      },
    },
  ];
}

/** Las palabras como líneas de estudio "en → es" (se ordenan como vienen en la lista). */
export const studyLines = (list) => list.map((w) => `${w.en} → ${w.es}`);
