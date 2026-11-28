/** Recuerda (por perfil, aviso y día) que un aviso ya se enseñó, para no repetirlo cada vez que se abre la pantalla. */
const key = (profileId, kind, today) => `aj-aviso:${profileId}:${kind}:${today}`;

export function wasSeen(profileId, kind, today) {
  try {
    return localStorage.getItem(key(profileId, kind, today)) === '1';
  } catch {
    return false;
  }
}

export function markSeen(profileId, kind, today) {
  try {
    localStorage.setItem(key(profileId, kind, today), '1');
  } catch {
    /* sin almacenamiento: el aviso puede repetirse, no pasa nada */
  }
}
