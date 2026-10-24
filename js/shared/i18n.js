// Textos de la interfaz que cambian según el idioma de la asignatura.
// Inglés y Sciences se muestran en inglés; el resto, en español.
import { es } from './i18n/es.js';
import { en } from './i18n/en.js';

const TEXTS = { es, en };

export function texts(lang) {
  return TEXTS[lang] || TEXTS.es;
}
