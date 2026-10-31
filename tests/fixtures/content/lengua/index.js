// Temas de Lengua · 4.º de Primaria
export const topics = [
  { id: 'sustantivo', title: 'El sustantivo', minutes: 6, load: () => import('./sustantivo/index.js') },
  { id: 'adjetivo', title: 'El adjetivo', minutes: 5 },
  { id: 'verbos', title: 'Los verbos', minutes: 7 },
  { id: 'ortografia-bv', title: 'Ortografía: b y v', minutes: 5 },
  { id: 'comprension', title: 'Comprensión lectora', minutes: 8 },
];
