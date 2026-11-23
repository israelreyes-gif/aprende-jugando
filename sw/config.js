// Nombres de las copias guardadas.
// Cada versión de la app (BUILD, en sw/manifest.js) tiene su propia copia COMPLETA: nunca se mezclan archivos de dos versiones.
const CACHE_PREFIX = 'aprende-jugando-';
const CACHE = `${CACHE_PREFIX}${BUILD}`;
const OLD_FONTS_CACHE = 'aprende-fuentes'; // copia de las fuentes de Google de versiones anteriores: ya no se usa y se borra al activar
const HASHES_KEY = './__huellas.json'; // dentro de cada copia: qué huella tenía cada archivo (para no volver a bajar lo que no cambia)
