// Huella corta de lo que se ha descargado: la misma cuenta que hace tools/manifest-text.js al preparar la versión.
async function fingerprintOf(response) {
  const bytes = await response.clone().arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 12);
}
