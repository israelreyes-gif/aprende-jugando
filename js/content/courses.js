// Cursos de primaria. Para abrir un curso nuevo: available: true y crea su carpeta en content/.
// subjects (opcional): ids de las asignaturas que tiene el curso; sin él, tiene todas.
// Cada perfil estudia un curso (profiles.course_id); sin él, el curso por defecto.
export const DEFAULT_COURSE_ID = '4-primaria';
export const COURSES = [
  { id: '1-primaria', label: '1.º', title: '1.º de Primaria', available: true, subjects: ['ingles'] },
  { id: '2-primaria', label: '2.º', title: '2.º de Primaria', available: false },
  { id: '3-primaria', label: '3.º', title: '3.º de Primaria', available: false },
  { id: '4-primaria', label: '4.º', title: '4.º de Primaria', available: true },
  { id: '5-primaria', label: '5.º', title: '5.º de Primaria', available: false },
  { id: '6-primaria', label: '6.º', title: '6.º de Primaria', available: false },
];

export const getCourse = (id) => COURSES.find((c) => c.id === id) || null;

/** Curso que estudia un perfil: el suyo si está abierto; si no, el de por defecto. */
export function profileCourse(profile) {
  const own = profile && getCourse(profile.course_id);
  return own && own.available ? own : getCourse(DEFAULT_COURSE_ID);
}
