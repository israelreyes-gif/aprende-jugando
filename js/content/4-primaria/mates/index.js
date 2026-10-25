// Temas de Matemáticas · 4.º de Primaria
// Cada tema es una carpeta con index.js, study.js y exercises.js.
// Un tema sin `load` aparece como "Pronto".
export const topics = [
  { id: 'numeros', title: 'Números hasta 6 cifras', minutes: 6, load: () => import('./numeros/index.js') },
  { id: 'redondear', title: 'Redondear y estimar', minutes: 5, load: () => import('./redondear/index.js') },
];
