import { start } from './core/router.js';
import { flushOutbox, isConfigured } from './core/api.js';
import { paths } from './core/paths.js';
import { registerRoutes } from './routes.js';
import { registerServiceWorker } from './register-sw.js';
import { disableZoomGestures } from './no-zoom.js';

disableZoomGestures();
registerRoutes();

// Sin conexión con el Worker configurada, todo lleva a la pantalla de conexión
const guard = (path) => (!isConfigured() && path !== '/setup' ? paths.setup() : null);
start(document.getElementById('app'), { guard });

// Reenvía las escrituras guardadas sin conexión
flushOutbox();
window.addEventListener('online', flushOutbox);

registerServiceWorker();
