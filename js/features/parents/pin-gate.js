import { reload } from '../../core/router.js';
import { createPinView } from './pin/create-pin-view.js';
import { enterPinView } from './pin/enter-pin-view.js';
import { getStoredPin } from './pin/pin-store.js';
import { isUnlocked } from './pin/unlock-state.js';

/**
 * Protege una pantalla de la zona de padres: si no está desbloqueada pide el PIN
 * (o lo crea la primera vez) y, al acertar, vuelve a pintar la pantalla pedida.
 */
export async function withParentsGate(renderProtected) {
  if (isUnlocked()) return renderProtected();
  const stored = await getStoredPin();
  return stored ? enterPinView({ stored, onDone: reload }) : createPinView({ onDone: reload });
}
