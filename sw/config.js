// Nombres de las copias guardadas.
// Cada versión de la app (BUILD, en sw/manifest.js) tiene su propia copia COMPLETA: nunca se mezclan archivos de dos versiones.
const CACHE_PREFIX = 'aprende-jugando-';
const CACHE = `${CACHE_PREFIX}${BUILD}`;
const FONTS_CACHE = 'aprende-fuentes'; // las fuentes de Google no cambian: se guardan aparte y sobreviven a las versiones
const HASHES_KEY = './__huellas.json'; // dentro de cada copia: qué huella tenía cada archivo (para no volver a bajar lo que no cambia)
