/** ¿Este navegador sabe de passkeys (Face ID)? */
export const passkeysSupported = () => typeof window !== 'undefined' && 'PublicKeyCredential' in window && Boolean(navigator.credentials?.create);

const FLAG = 'aj.passkey.here';

/** ¿Se activó Face ID en este dispositivo? (solo una marca para enseñar el botón; la prueba real la hace el móvil) */
export function hasLocalPasskey() {
  try { return localStorage.getItem(FLAG) === '1'; } catch { return false; }
}

export function setLocalPasskey(on) {
  try { on ? localStorage.setItem(FLAG, '1') : localStorage.removeItem(FLAG); } catch { /* sin almacenamiento */ }
}
