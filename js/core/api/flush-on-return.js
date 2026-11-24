// Reenvía la cola de escrituras pendientes cada vez que la app vuelve a ser visible.
// En el iPhone una app abierta en segundo plano no siempre recibe el aviso "online" al recuperar la red.
import { flushOutbox } from './outbox.js';

export function flushWhenVisible() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') flushOutbox();
  });
}
