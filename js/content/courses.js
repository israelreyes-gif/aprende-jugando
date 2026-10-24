// Cursos de primaria. Para abrir un curso nuevo: available: true y crea su carpeta en content/.
export const COURSES = [
  { id: '1-primaria', label: '1.º', title: '1.º de Primaria', available: false },
  { id: '2-primaria', label: '2.º', title: '2.º de Primaria', available: false },
  { id: '3-primaria', label: '3.º', title: '3.º de Primaria', available: false },
  { id: '4-primaria', label: '4.º', title: '4.º de Primaria', available: true },
  { id: '5-primaria', label: '5.º', title: '5.º de Primaria', available: false },
  { id: '6-primaria', label: '6.º', title: '6.º de Primaria', available: false },
];

export const getCourse = (id) => COURSES.find((c) => c.id === id) || null;
