// Asignaturas. lang: idioma en el que se muestra la asignatura (interfaz y contenido).
export const SUBJECTS = [
  { id: 'mates', name: 'Matemáticas', lang: 'es', tint: '#DDE7FF', deep: '#1F4DB8' },
  { id: 'sociales', name: 'Sociales', lang: 'es', tint: '#FFE9C7', deep: '#9A5300' },
  { id: 'ingles', name: 'Inglés', lang: 'en', tint: '#FFDDE9', deep: '#B0285F' },
  { id: 'lengua', name: 'Lengua', lang: 'es', tint: '#D7F2E3', deep: '#1B7A4E' },
  { id: 'sciences', name: 'Sciences', lang: 'en', tint: '#E6DEFF', deep: '#5B3FB8' },
];

export const getSubject = (id) => SUBJECTS.find((s) => s.id === id) || null;
