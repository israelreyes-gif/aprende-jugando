// Dónde vive la app: la passkey queda atada a este dominio (rpId) y a este origen.
export function passkeyOrigins(env) {
  return String(env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter((o) => o && o !== '*');
}

/** rpId = dominio del primer origen permitido (p. ej. israelreyes-gif.github.io). null si no hay un origen concreto configurado. */
export function passkeyRpId(env) {
  const [first] = passkeyOrigins(env);
  return first ? new URL(first).hostname : null;
}
