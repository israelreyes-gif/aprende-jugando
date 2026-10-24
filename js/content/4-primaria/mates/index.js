// Temas de Matemáticas · 4.º de Primaria
// Un tema con `load` ya tiene contenido. Sin `load` aparece como "Pronto".
export const topics = [
  { id: 'tablas', title: 'Tablas de multiplicar', minutes: 5, load: () => import('./tablas/index.js') },
  { id: 'divisiones', title: 'Divisiones', minutes: 6 },
  { id: 'fracciones', title: 'Fracciones', minutes: 7 },
  { id: 'geometria', title: 'Geometría', minutes: 6 },
  { id: 'medidas', title: 'Medidas', minutes: 5 },
];
