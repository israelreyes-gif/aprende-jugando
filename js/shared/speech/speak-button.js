import { h } from '../../core/dom.js';
import { canSpeak } from './can-speak.js';
import { speak } from './speak.js';

/** Botón 🔊 que lee un texto en inglés. No sale si el navegador no sabe leer en voz alta o no hay texto. */
export function speakButton(text) {
  if (!canSpeak() || !text) return null;
  return h('button', { class: 'speak', type: 'button', 'aria-label': 'Listen', onClick: () => speak(text) }, '🔊');
}
