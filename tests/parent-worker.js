// El Worker real, pero con una sesión de padres puesta por defecto en cada petición (menos las de /auth).
// Sirve a las pruebas que no hablan de acceso: así no tienen que iniciar sesión una a una.
import worker from '../worker/worker.js';
import { createSession } from '../worker/auth-sessions.js';

const tokens = new WeakMap();

export default {
  ...worker,
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const asParent = ['/auth/setup', '/auth/change'].includes(pathname) ? request.headers.get('X-Session') === 'test' : !pathname.startsWith('/auth') && (!request.headers.get('X-Session') || request.headers.get('X-Session') === 'test');
    if (env?.DB && asParent) {
      let token = tokens.get(env.DB);
      if (!token) { token = await createSession(env.DB, 'parent'); tokens.set(env.DB, token); }
      const headers = new Headers(request.headers);
      headers.set('X-Session', token);
      request = new Request(request, { headers });
    }
    return worker.fetch(request, env, ctx);
  },
};
