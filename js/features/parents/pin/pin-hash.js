const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Huella SHA-256 de un texto, en hexadecimal. */
export async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return toHex(new Uint8Array(digest));
}

/** Texto aleatorio que se mezcla con el PIN antes de calcular la huella. */
export function randomSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(8)));
}
