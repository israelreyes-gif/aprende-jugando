// Todas las direcciones de la app en un solo sitio.
// Las pantallas nunca escriben rutas a mano: usan estas funciones.
export const paths = {
  home: () => '#/',
  setup: () => '#/setup',
  newProfile: () => '#/new-profile',

  parents: () => '#/parents',
  parentsPin: () => '#/parents/pin',
  childStats: (pid) => `#/parents/${pid}`,
  subjectStats: (pid, cid, sid) => `#/parents/${pid}/stats/${cid}/${sid}`,
  release: (pid, cid) => `#/parents/${pid}/release/${cid}`,
  releaseSubject: (pid, cid, sid) => `#/parents/${pid}/release/${cid}/${sid}`,

  editProfile: (pid) => `#/p/${pid}/edit`,
  courses: (pid) => `#/p/${pid}`,
  course: (pid, cid) => `#/p/${pid}/c/${cid}`,
  reto: (pid, cid) => `#/p/${pid}/c/${cid}/reto`,
  subject: (pid, cid, sid, tab = 'study') => `#/p/${pid}/c/${cid}/s/${sid}/${tab}`,
  study: (pid, cid, sid, tid) => `#/p/${pid}/c/${cid}/s/${sid}/study/${tid}`,
  practice: (pid, cid, sid, tid) => `#/p/${pid}/c/${cid}/s/${sid}/practice/${tid}`,
};
