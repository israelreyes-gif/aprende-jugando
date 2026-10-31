const GIVE_UP_MS = 4000;

/**
 * Pasa a la versión nueva (que el service worker ya tiene descargada entera) y recarga la app.
 * Si el cambio de versión no llega a notarse, recarga igualmente pasados unos segundos.
 */
export function applyUpdate(registration, serviceWorker, reload) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    reload();
  };
  serviceWorker.addEventListener('controllerchange', finish, { once: true });
  registration.waiting?.postMessage({ type: 'skip-waiting' });
  setTimeout(finish, GIVE_UP_MS);
}
