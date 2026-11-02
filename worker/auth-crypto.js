const toHex = (bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');

export const randomHex = (bytes = 16) => toHex(crypto.getRandomValues(new Uint8Array(bytes)));

/** Huella SHA-256 (para guardar solo la huella del identificador de sesión). */
export async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

const ITERATIONS = 100_000; // el máximo que admite Cloudflare

/** Huella lenta (PBKDF2) del código con su sal. */
export async function hashCode(code, saltHex) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  return toHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256));
}
