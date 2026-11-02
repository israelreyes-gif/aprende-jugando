import { insertRows } from './request.js';

const rid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Anota en el servidor un guardado que no fue a la primera.
 * outcome: 'late' (quedó en cola y se guardó después) o 'failed' (el servidor lo rechazó y se descartó).
 * Solo se anota qué se guardaba y el motivo corto; nunca el contenido. No lanza ni espera: si falla, se ignora.
 */
export function logSync({ outcome, what, detail, profileId }) {
  try {
    insertRows('sync_events', [{ id: rid(), profile_id: profileId || null, outcome, what, detail: detail ? String(detail).slice(0, 80) : null }], 'ignore').catch(() => {});
  } catch {
    /* sin conexión o sin configurar: no pasa nada */
  }
}
