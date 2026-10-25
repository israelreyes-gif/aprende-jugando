import { rnd } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

/** Elegir qué operación resuelve un problema: multiplicar, restar o dividir. */
export function elegirOperacion() {
  const a = rnd(3, 9);
  const b = rnd(3, 9);
  const tipo = rnd(0, 2);
  if (tipo === 0) {
    return choiceQ(
      `¿Qué operación resuelve esto? Hay ${a} cajas con ${b} galletas cada una. ¿Cuántas galletas hay?`,
      `${a} × ${b}`,
      [`${a} + ${b}`, `${a} − ${b}`],
      'Son grupos iguales: se multiplica.',
    );
  }
  if (tipo === 1) {
    const dinero = a + b + 10;
    return choiceQ(
      `¿Qué operación resuelve esto? Tenemos ${dinero} euros y gastamos ${b}. ¿Cuánto queda?`,
      `${dinero} − ${b}`,
      [`${dinero} + ${b}`, `${dinero} × ${b}`],
      'Quitar se resta.',
    );
  }
  return choiceQ(
    `¿Qué operación resuelve esto? Repartimos ${a * b} globos entre ${b} niños por igual.`,
    `${a * b} : ${b}`,
    [`${a * b} × ${b}`, `${a * b} − ${b}`],
    'Repartir por igual es dividir.',
  );
}
