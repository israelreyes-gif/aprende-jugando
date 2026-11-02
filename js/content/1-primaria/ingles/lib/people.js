// Nombres de ejemplo para las frases (de Claude; los de su cuaderno van aparte en cada tema).
export const BOYS = ['Tom', 'Leo', 'Sam', 'Jack', 'Ryan', 'Mark'];
export const GIRLS = ['Anna', 'Mia', 'Kate', 'Lisa', 'Emma', 'Eva'];
export const PEOPLE = [...BOYS.map((name) => ({ name, he: true })), ...GIRLS.map((name) => ({ name, he: false }))];
