// Asignaturas. lang: idioma en el que se muestra la asignatura (interfaz y contenido). emoji: icono de su tarjeta.
export const SUBJECTS = [
  { id: 'mates', emoji: '🧮', name: 'Matemáticas', lang: 'es', tint: '#DDE7FF', deep: '#1F4DB8' },
  { id: 'sociales', emoji: '🌍', name: 'Sociales', lang: 'es', tint: '#FFE9C7', deep: '#9A5300' },
  { id: 'ingles', emoji: '🇬🇧', name: 'Inglés', lang: 'en', tint: '#FFDDE9', deep: '#B0285F' },
  { id: 'lengua', emoji: '🔤', name: 'Lengua', lang: 'es', tint: '#D7F2E3', deep: '#1B7A4E' },
  { id: 'sciences', emoji: '🔬', name: 'Sciences', lang: 'en', tint: '#E6DEFF', deep: '#5B3FB8' },
];

export const getSubject = (id) => SUBJECTS.find((s) => s.id === id) || null;
