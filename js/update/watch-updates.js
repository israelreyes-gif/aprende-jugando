import { currentPath } from '../core/router.js';
import { isBusyRoute } from './is-busy-route.js';
import { offerUpdate } from './offer-update.js';
import { applyUpdate } from './apply-update.js';

const RETRY_MS = 3000;
export const CHECK_EVERY_MS = 30 * 60 * 1000;

/**
 * Vigila si hay una versión nueva ya descargada y esperando, y ofrece actualizar cuando no estorba:
 * no en ejercicios, reto ni formularios (espera a que cambie de pantalla) y no encima de otra ventana abierta.
 * Si dice "Ahora no", vuelve a preguntar pasados 10 minutos, al cambiar de pantalla o al volver a la app.
 * Pregunta al servidor si hay versión nueva al volver a la app (aunque estuviera abierta en segundo plano),
 * al recuperar la conexión y cada media hora mientras está abierta.
 */
export function watchUpdates(registration, { serviceWorker = navigator.serviceWorker, reload = () => location.reload() } = {}) {
  if (!registration || !serviceWorker) return;
  let offering = false;
  let applying = false;
  let timer = null;

  // Con "controller" vacío es la primera instalación: no hay nada que actualizar.
  const versionWaiting = () => Boolean(registration.waiting && serviceWorker.controller);

  function tryOffer() {
    if (offering || applying || !versionWaiting() || isBusyRoute(currentPath())) return;
    if (document.querySelector('.modal-overlay')) {
      timer = timer || setTimeout(() => ((timer = null), tryOffer()), RETRY_MS);
      return;
    }
    offering = true;
    const accept = () => {
      applying = true;
      applyUpdate(registration, serviceWorker, () => {
        reload();
        applying = false;
      });
    };
    offerUpdate(accept).finally(() => (offering = false));
  }

  function watchInstalling(worker) {
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed') tryOffer();
    });
  }

  const checkForUpdate = () => registration.update().catch(() => {});
  const returnedToApp = () => {
    if (document.visibilityState !== 'visible') return;
    checkForUpdate();
    tryOffer();
  };

  tryOffer();
  watchInstalling(registration.installing);
  registration.addEventListener('updatefound', () => watchInstalling(registration.installing));

  window.addEventListener('hashchange', tryOffer);
  window.addEventListener('online', checkForUpdate);
  document.addEventListener('visibilitychange', returnedToApp);
  setInterval(returnedToApp, CHECK_EVERY_MS);
}
