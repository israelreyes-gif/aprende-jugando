import { pick } from '../../../../core/random.js';

// Sujetos de have got: { w: sujeto, has: usa has, c: contracción ("I've got") }
export const SUBJECTS = [
  { w: 'I', has: false, c: "I've" },
  { w: 'You', has: false, c: "You've" },
  { w: 'We', has: false, c: "We've" },
  { w: 'They', has: false, c: "They've" },
  { w: 'He', has: true, c: "He's" },
  { w: 'She', has: true, c: "She's" },
  { w: 'Luke and Victoria', has: false, c: null },
  { w: 'My parents', has: false, c: null },
  { w: 'Lisa', has: true, c: null },
  { w: 'Mark', has: true, c: null },
  { w: 'My sister', has: true, c: null },
];
// Objetos (fichas) que suenan bien con personas; con "It" van aparte.
export const OBJECTS = [['a', 'son'], ['two', 'brothers'], ['an', 'uncle'], ['an', 'aunt'], ['grandchildren'], ['a', 'big', 'brother'], ['three', 'children'], ['a', 'sister'], ['a', 'dog'], ['a', 'new', 'bag'], ['two', 'cats'], ['a', 'small', 'house']];
export const IT_OBJECTS = [['four', 'legs'], ['a', 'long', 'tail'], ['two', 'big', 'eyes'], ['a', 'small', 'nose']];
export const IT = { w: 'It', has: true, c: "It's" };

export function setup() {
  const s = Math.random() < 0.12 ? IT : pick(SUBJECTS);
  return { s, obj: pick(s === IT ? IT_OBJECTS : OBJECTS) };
}
export const verb = (s) => (s.has ? 'has' : 'have');
export const neg = (s) => (s.has ? "hasn't" : "haven't");
