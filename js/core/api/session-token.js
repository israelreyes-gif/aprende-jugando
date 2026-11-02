import { inferOwner, routeOwner } from './owner.js';
import { PARENT_OWNER, getSession } from './session-store.js';

/**
 * Qué sesión usa una petición. En la zona de padres, siempre la de padres; si no, la del perfil
 * al que se refiere (o al de la pantalla abierta). Si ese perfil no tiene sesión, vale la de padres.
 * Devuelve { owner, token } (token vacío si no hay ninguna).
 */
export function pickSession(path, query, body, explicitOwner) {
  const here = routeOwner();
  const wanted = explicitOwner || (here === PARENT_OWNER ? PARENT_OWNER : inferOwner(path, query, body) || here);
  const own = getSession(wanted);
  if (own) return { owner: wanted, token: own };
  const parent = getSession(PARENT_OWNER);
  return parent ? { owner: PARENT_OWNER, token: parent } : { owner: wanted, token: '' };
}
