// Ajustes del service worker. Cuando cambies muchos archivos de golpe, sube VERSION
// para que se limpien las copias guardadas antiguas.
const VERSION = 'v5';
const CACHE = `aprende-jugando-${VERSION}`;

// Archivos que se guardan al instalar la app. El resto se guarda al usarlo.
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './js/main.js',
];
