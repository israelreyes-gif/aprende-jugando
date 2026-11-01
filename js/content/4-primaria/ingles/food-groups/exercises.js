import { choiceQ } from '../../../../exercises/make/choice.js';
import { groups } from './words.js';

const names = groups.map((g) => g.name);
const english = (f) => f.split(' → ')[0];
const spanish = (f) => f.split(' → ')[1];

// One question per food: "Which group is X in?"
const byFood = groups.flatMap((g) => g.foods.map((f) => ({
  id: `g-${english(f).replace(/ /g, '-')}`,
  ...choiceQ(`Which group is "${english(f)}" in?`, g.name, names.filter((n) => n !== g.name).slice(0, 3), `${english(f)} (${spanish(f)}) → ${g.name}`, { say: english(f) }),
})));

const meaning = groups.map((g) => ({
  id: `es-${g.name.split(' ')[0].toLowerCase()}`,
  ...choiceQ(`¿Qué significa "${g.name}"?`, g.es, groups.filter((o) => o !== g).map((o) => o.es).slice(0, 3), `${g.name} = ${g.es}`, { say: g.name }),
}));

export const exercises = [...byFood, ...meaning];
