let context = null;

/** Sistema de audio del navegador (se crea una sola vez). Devuelve null si el dispositivo no lo permite. */
export function getAudioContext() {
  if (!context) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return null;
    context = new Audio();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}
