/** ¿Merece la pena reintentar más tarde? Sin red, error del servidor, límites temporales o sesión caducada (se guarda hasta volver a entrar). */
export function isRetryable(err) {
  return err instanceof TypeError || err.code === 'auth' || err.status >= 500 || err.status === 408 || err.status === 429;
}
