import { currentPath } from '../core/router.js';
import { isBusyRoute } from './is-busy-route.js';
import { offerUpdate } from './offer-update.js';

const RETRY_MS = 3000;

/**
 * Escucha el aviso del service worker y ofrece actualizar cuando no estorba:
 * no en ejercicios, reto ni formularios (espera a que cambie de pantalla) y no encima de otra ventana abierta.
 */
export function watchUpdates(worker = navigator.serviceWorker, reload) {
  if (!worker) return;
  let pending = false;
  let offering = false;
  let timer = null;

  function tryOffer() {
    if (!pending || isBusyRoute(currentPath())) return;
    if (document.querySelector('.modal-overlay')) {
      timer = timer || setTimeout(() => ((timer = null), tryOffer()), RETRY_MS);
      return;
    }
    pending = false;
    offering = true;
    offerUpdate(reload).finally(() => (offering = false));
  }

  worker.addEventListener('message', (event) => {
    if (event.data?.type !== 'app-updated') return;
    worker.controller?.postMessage({ type: 'update-seen' });
    if (offering) return;
    pending = true;
    tryOffer();
  });
  worker.startMessages?.();
  worker.controller?.postMessage({ type: 'page-ready' });
  window.addEventListener('hashchange', tryOffer);
}
