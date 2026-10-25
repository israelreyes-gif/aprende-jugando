// Temas de Matemáticas · 4.º de Primaria
// Cada tema es una carpeta con index.js, study.js y exercises.js.
// Un tema sin `load` aparece como "Pronto".
export const topics = [
  { id: 'numeros', title: 'Números hasta 6 cifras', minutes: 6, load: () => import('./numeros/index.js') },
  { id: 'romanos', title: 'Números romanos', minutes: 5, load: () => import('./romanos/index.js') },
  { id: 'pares', title: 'Pares e impares', minutes: 4, load: () => import('./pares/index.js') },
  { id: 'redondear', title: 'Redondear y estimar', minutes: 5, load: () => import('./redondear/index.js') },
  { id: 'tablas', title: 'Tablas de multiplicar', minutes: 5, load: () => import('./tablas/index.js') },
  { id: 'descomponer', title: 'Multiplicar descomponiendo', minutes: 6, load: () => import('./descomponer/index.js') },
  { id: 'cajitas', title: 'Cajitas multiplicativas', minutes: 5, load: () => import('./cajitas/index.js') },
  { id: 'relacionar', title: 'Relacionar multiplicaciones', minutes: 5, load: () => import('./relacionar/index.js') },
  { id: 'repartir', title: 'Repartir y hacer grupos', minutes: 5, load: () => import('./repartir/index.js') },
  { id: 'vocabulario', title: 'Vocabulario geométrico', minutes: 8, load: () => import('./vocabulario/index.js') },
  { id: 'simetria', title: 'Triángulos y simetría', minutes: 7, load: () => import('./simetria/index.js') },
];
