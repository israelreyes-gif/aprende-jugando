/**
 * Aprende y juega · Worker genérico de acceso a D1.
 * No conoce las reglas de la app: solo expone un CRUD sobre las tablas que existan.
 *
 * Necesita: binding D1 "DB", secreto "API_KEY" y, opcional, variable "ALLOWED_ORIGIN".
 * Rutas (cabecera X-Api-Key obligatoria):
 *   GET /api  ·  GET /api/:tabla  ·  GET /api/:tabla/:id
 *   POST /api/:tabla  ·  PATCH /api/:tabla/:id  ·  DELETE /api/:tabla/:id
 *   POST /push/send  (avisos push; necesita VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y VAPID_SUBJECT)
 */
import { HttpError, corsHeaders, errorResponse, json, safeEqual } from './http.js';
import { loadSchema } from './schema.js';
import { handleDelete, handleGet, handlePatch, handlePost } from './handlers.js';
import { handlePush } from './push-handle-push.js';

export default {
  async fetch(request, env) {
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
      if (parts[0] === 'push') return await handlePush(request, env, parts, cors);
      if (parts[0] !== 'api' || parts.length > 3) throw new HttpError(404, 'Ruta no encontrada');

      const schema = await loadSchema(env.DB);
      if (parts.length === 1) return json({ ok: true, tables: Object.keys(schema) }, 200, cors);

      const table = schema[parts[1]];
      if (!table) throw new HttpError(404, `Tabla desconocida: ${parts[1]}`);
      const id = parts[2];
      const params = url.searchParams;

      switch (request.method) {
        case 'GET':
          return json(await handleGet(env.DB, table, params, id), 200, cors);
        case 'POST':
          return json(await handlePost(env.DB, table, params, request), 201, cors);
        case 'PATCH':
          return json(await handlePatch(env.DB, table, params, request, id), 200, cors);
        case 'DELETE':
          return json(await handleDelete(env.DB, table, params, id), 200, cors);
        default:
          throw new HttpError(405, 'Método no permitido');
      }
    } catch (err) {
      return errorResponse(err, cors);
    }
  },
};
