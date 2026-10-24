// Configuración fija de la app.
// La URL del Worker no es secreta: así no hay que teclearla en cada dispositivo.
// La CLAVE de API nunca va en este archivo: se escribe una vez en cada dispositivo.
export const DEFAULT_API_URL = 'https://aprende-jugando.israel-reyes.workers.dev';

// Minutos que permanece desbloqueada la zona de padres tras introducir el PIN
export const PARENTS_UNLOCK_MINUTES = 10;
