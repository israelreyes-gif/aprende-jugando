/** Registra el service worker (instalación y funcionamiento sin conexión). */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .catch((err) => console.warn('No se pudo registrar el service worker', err));
  });
}
