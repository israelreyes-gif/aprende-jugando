/** ¿Merece la pena reintentar más tarde? Sin red, error del servidor o límites temporales. */
export function isRetryable(err) {
  return err instanceof TypeError || err.status >= 500 || err.status === 408 || err.status === 429;
}
