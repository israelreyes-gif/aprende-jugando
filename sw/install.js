// Instalar una versión nueva: se baja ENTERA a una copia aparte (copiando de la anterior lo que no ha cambiado).
// Si algo falla (un archivo que no está, una descarga cortada, un archivo de otra versión), se tira todo y la app
// sigue con la versión que tenía. La versión nueva no se activa sola: la página avisa y el usuario pulsa "Actualizar".
const DOWNLOADS_AT_ONCE = 8;

/** La copia más reciente que no es la de esta versión (la que está en uso). */
async function newestOtherCache() {
  const names = (await caches.keys()).filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE);
  return names.length ? names[names.length - 1] : null;
}

/** Las huellas guardadas en una copia, o null si es de antes de este sistema (por ejemplo "aprende-jugando-v9"). */
async function readHashes(cache) {
  const saved = await cache.match(HASHES_KEY);
  return saved ? saved.json() : null;
}

async function saveFile(cache, older, olderHashes, path, hash) {
  if (olderHashes[path] === hash) {
    const kept = await older.match(path);
    if (kept) return cache.put(path, kept);
  }
  const response = await fetch(path, { cache: 'reload' });
  if (!response.ok) throw new Error(`${path}: respuesta ${response.status}`);
  if ((await fingerprintOf(response)) !== hash) throw new Error(`${path}: no es el archivo de la versión ${BUILD}`);
  return cache.put(path, response);
}

async function downloadAll(cache, older, olderHashes) {
  const pending = Object.entries(FILES);
  const downloader = async () => {
    for (let item = pending.shift(); item; item = pending.shift()) await saveFile(cache, older, olderHashes, ...item);
  };
  await Promise.all(Array.from({ length: DOWNLOADS_AT_ONCE }, downloader));
}

async function installBuild() {
  await caches.delete(CACHE);
  const cache = await caches.open(CACHE);
  try {
    const olderName = await newestOtherCache();
    const older = olderName ? await caches.open(olderName) : null;
    const olderHashes = older ? await readHashes(older) : null;
    await downloadAll(cache, older, olderHashes || {});
    await cache.put(HASHES_KEY, new Response(JSON.stringify(FILES)));
    // Primera instalación, o primer cambio desde el sistema antiguo (que se activaba solo): se activa ya.
    if (!olderHashes) self.skipWaiting();
  } catch (error) {
    await caches.delete(CACHE);
    throw error;
  }
}

self.addEventListener('install', (event) => event.waitUntil(installBuild()));
