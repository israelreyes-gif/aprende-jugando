// Configuración fija de la app.
// La URL del Worker no es secreta: así no hay que teclearla en cada dispositivo.
// La CLAVE de API nunca va en este archivo: se escribe una vez en cada dispositivo.
export const DEFAULT_API_URL = 'https://aprende-jugando.israel-reyes.workers.dev';

// Clave PÚBLICA de los avisos push (no es secreta; la privada vive solo en el Worker).
export const VAPID_PUBLIC_KEY = 'BHaapmRJeImDdJ2WyIeOl3JXh2VB1U9GWm5STuldUVXsdjrypURUE7lZ31OkHgu6hXDSoImwmzxtG0f2Mq8skGQ';

// Minutos que permanece desbloqueada la zona de padres tras introducir el PIN
export const PARENTS_UNLOCK_MINUTES = 10;
