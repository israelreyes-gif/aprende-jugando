/** Registra el service worker (instalación y funcionamiento sin conexión). Devuelve el registro, o null si no se puede. */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  const register = () =>
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch((err) => {
      console.warn('No se pudo registrar el service worker', err);
      return null;
    });
  if (document.readyState === 'complete') return register();
  return new Promise((resolve) => window.addEventListener('load', () => resolve(register())));
}
