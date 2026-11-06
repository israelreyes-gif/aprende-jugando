import { start } from './core/router.js';
import { flushOutbox, isConfigured } from './core/api.js';
import { migrateReadCache } from './core/api/cache-store.js';
import { paths } from './core/paths.js';
import { registerRoutes } from './routes.js';
import { registerServiceWorker } from './register-sw.js';
import { disableZoomGestures } from './no-zoom.js';
import { watchUpdates } from './update/watch-updates.js';
import { authGuard, authRedirect } from './features/auth/auth-guard.js';
import { watchParentIdle } from './features/auth/parent-idle-watch.js';

disableZoomGestures();
migrateReadCache();
registerRoutes();

// Sin conexión con el Worker configurada, todo lleva a la pantalla de conexión
const guard = (path) => (!isConfigured() && path !== '/setup' ? paths.setup() : authGuard(path));
start(document.getElementById('app'), { guard, onAuthError: authRedirect });

// Avisa cuando caduca la sesión de padres por inactividad
watchParentIdle();

// Reenvía las escrituras guardadas sin conexión
flushOutbox();
window.addEventListener('online', flushOutbox);

// Cuando hay una versión nueva descargada, ofrece actualizar (y la busca al volver a la app)
registerServiceWorker().then((registration) => watchUpdates(registration));
