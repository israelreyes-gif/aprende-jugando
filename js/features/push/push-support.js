const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isInstalled = () => navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

/**
 * ¿Puede este móvil recibir avisos?
 *  'ok'          sí
 *  'install'     iPhone/iPad con la app abierta desde Safari: hay que instalarla en la pantalla de inicio
 *  'unsupported' este navegador no sabe recibir avisos
 */
export function pushSupport() {
  if (isIos() && !isInstalled()) return 'install';
  const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  return ok ? 'ok' : 'unsupported';
}
