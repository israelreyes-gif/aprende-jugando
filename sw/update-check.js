// Detección de cambios: cuando un archivo guardado cambia en el servidor, avisa a la app.
const TEXT_TYPE = /text|javascript|json|xml|svg/;

/** ¿Es distinto el contenido de `fresh` (el del servidor) del de `cached` (el guardado)? Solo archivos de texto. */
async function hasChanged(cached, fresh) {
  if (!TEXT_TYPE.test(fresh.headers.get('content-type') || '')) return false;
  const [before, after] = await Promise.all([cached.clone().text(), fresh.clone().text()]);
  return before !== after;
}

/** Anota la versión nueva y avisa a las ventanas abiertas (si alguna no llega a oírlo, la marca la avisará al abrir). */
async function announceUpdate() {
  await markPending();
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of windows) client.postMessage({ type: 'app-updated' });
}

/** Compara y, si el archivo ha cambiado, avisa. Un fallo aquí nunca debe impedir guardar la copia nueva. */
async function checkForUpdate(cached, fresh) {
  try {
    if (await hasChanged(cached, fresh)) await announceUpdate();
  } catch {
    /* sin aviso, pero la copia se actualiza igual */
  }
}
