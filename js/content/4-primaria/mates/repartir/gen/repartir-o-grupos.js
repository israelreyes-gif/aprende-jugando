import { rnd, pick } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

/** Distinguir si un problema es de repartir o de hacer grupos. */
export function repartirOGrupos() {
  const total = rnd(12, 60);
  const n = rnd(3, 9);
  const reparte = pick([true, false]);
  const texto = reparte
    ? pick([`Repartimos ${total} lápices entre ${n} niños.`, `Damos la misma cantidad de ${total} euros a cada una de ${n} personas.`])
    : pick([`Metemos ${total} huevos en cajas de ${n} huevos.`, `Hacemos grupos de ${n} con ${total} alumnos.`]);
  return choiceQ(
    `¿Es repartir o hacer grupos? ${texto}`,
    reparte ? 'Repartir' : 'Hacer grupos',
    [reparte ? 'Hacer grupos' : 'Repartir'],
    reparte
      ? 'Se sabe cuántos grupos hay y se pregunta cuánto toca a cada uno.'
      : 'Se sabe cuánto va en cada grupo y se pregunta cuántos grupos salen.',
  );
}
