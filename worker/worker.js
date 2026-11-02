/**
 * Aprende y juega · Worker genérico de acceso a D1.
 * No conoce las reglas de la app: solo expone un CRUD sobre las tablas que existan.
 *
 * Necesita: binding D1 "DB", secreto "API_KEY" y, opcional, variable "ALLOWED_ORIGIN".
 * Permisos por tabla y operación en permissions.js (lo demás da 403).
 * Acceso con código: /auth/* (login, setup, change, reset, logout); el resto exige además la cabecera X-Session (auth-*.js).
 * Un perfil solo toca sus propios datos (auth-scope.js); los padres, todo lo que permite permissions.js.
 * Rutas (cabecera X-Api-Key obligatoria):
 *   GET /api  ·  GET /api/:tabla  ·  GET /api/:tabla/:id
 *   POST /api/:tabla  ·  PATCH /api/:tabla/:id  ·  DELETE /api/:tabla/:id
 *   POST /push/send  (avisos push; necesita VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y VAPID_SUBJECT)
 * Cron (wrangler.jsonc): recordatorios del reto a las 08:00 y a las 18:30, hora de Madrid, y el resumen semanal por Telegram el domingo a las 20:00.
 * Si el Worker falla por su lado (error 5xx) o un recordatorio no sale, avisa a los móviles de padres (error-alert.js).
 */
import { HttpError, corsHeaders, errorResponse, json, safeEqual } from './http.js';
import { loadSchema } from './schema.js';
import { handleDelete, handleGet, handlePatch, handlePost } from './handlers.js';
import { handlePush } from './push-handle-push.js';
import { runReminders } from './reminder-run.js';
import { runWeeklyReport } from './report-run.js';
import { alertParents } from './error-alert.js';
import { alertSyncFailures } from './sync-alert.js';
import { purgeWeekly } from './purge-sync.js';
import { assertAllowed, visibleTables } from './permissions.js';
import { handleAuth } from './auth-routes.js';
import { findSession } from './auth-sessions.js';
import { enforceScope } from './auth-scope.js';

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(purgeWeekly(env, event.scheduledTime));
    ctx.waitUntil(
      runReminders(env, event.scheduledTime).then(async (summary) => {
        console.log('Recordatorios', JSON.stringify(summary));
        if (summary.error || summary.failed > 0) {
          await alertParents(env, { where: 'Recordatorios', detail: summary.error || `${summary.failed} perfil(es) sin avisar` });
        }
      }),
    );
    ctx.waitUntil(
      runWeeklyReport(env, event.scheduledTime)
        .then((summary) => summary.report && console.log('Resumen semanal', JSON.stringify(summary)))
        .catch(async (err) => {
          console.error('Resumen semanal fallido', err);
          await alertParents(env, { where: 'Resumen semanal', detail: String(err?.message || err) });
        }),
    );
  },

  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (!env.API_KEY) throw new HttpError(500, 'Falta la variable API_KEY en el Worker');
      if (!env.DB) throw new HttpError(500, 'Falta el binding DB (D1) en el Worker');
      if (!safeEqual(request.headers.get('X-Api-Key') || '', env.API_KEY)) {
        throw new HttpError(401, 'Clave de API incorrecta');
      }

      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
      if (parts[0] === 'auth') return await handleAuth(request, env, parts, cors);
      const session = await findSession(env.DB, request.headers.get('X-Session') || '');
      if (!session) throw new HttpError(401, 'Sesión no válida');
      if (parts[0] === 'push') return await handlePush(request, env, parts, cors, session);
      if (parts[0] !== 'api' || parts.length > 3) throw new HttpError(404, 'Ruta no encontrada');

      const schema = await loadSchema(env.DB);
      if (parts.length === 1) return json({ ok: true, tables: visibleTables(Object.keys(schema)) }, 200, cors);

      const table = schema[parts[1]];
      if (!table) throw new HttpError(404, `Tabla desconocida: ${parts[1]}`);
      assertAllowed(request.method, table.name);
      const id = parts[2];
      const params = url.searchParams;
      await enforceScope(env.DB, session, request.method, table, params, id, request);

      switch (request.method) {
        case 'GET':
          return json(await handleGet(env.DB, table, params, id), 200, cors);
        case 'POST': {
          // Los guardados fallidos que anota la app (sync_events) avisan a los padres.
          const received = table.name === 'sync_events' ? await request.clone().json().catch(() => null) : null;
          const result = await handlePost(env.DB, table, params, request);
          if (received) ctx?.waitUntil(alertSyncFailures(env, received));
          return json(result, 201, cors);
        }
        case 'PATCH':
          return json(await handlePatch(env.DB, table, params, request, id), 200, cors);
        case 'DELETE':
          return json(await handleDelete(env.DB, table, params, id), 200, cors);
        default:
          throw new HttpError(405, 'Método no permitido');
      }
    } catch (err) {
      const response = errorResponse(err, cors);
      const { pathname } = new URL(request.url);
      // Error del servidor (5xx): se avisa a los padres. No se avisa de los fallos del propio envío de avisos.
      if (response.status >= 500 && !pathname.startsWith('/push')) {
        const detail = String(err?.message || err);
        ctx?.waitUntil(alertParents(env, { where: `${request.method} ${pathname}`, detail }));
      }
      return response;
    }
  },
};
