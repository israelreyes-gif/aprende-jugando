const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 5000;
const MAX_ROWS_PER_POST = 500;
const MAX_IN_VALUES = 200;
const SCHEMA_TTL_MS = 60_000;
const RESERVED = new Set(['order', 'limit', 'offset', 'conflict', 'select']);
const OPERATORS = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', like: 'LIKE' };

let schemaCache = { at: 0, tables: null };

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

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
      if (parts[0] !== 'api') throw new HttpError(404, 'Ruta no encontrada');

      const schema = await loadSchema(env.DB);
      if (parts.length === 1) return json({ ok: true, tables: Object.keys(schema) }, 200, cors);

      const table = schema[parts[1]];
      if (!table) throw new HttpError(404, `Tabla desconocida: ${parts[1]}`);

      const id = parts[2];
      if (parts.length > 3) throw new HttpError(404, 'Ruta no encontrada');

      switch (request.method) {
        case 'GET':
          return json(await handleGet(env.DB, table, url.searchParams, id), 200, cors);
        case 'POST':
          return json(await handlePost(env.DB, table, url.searchParams, request), 201, cors);
        case 'PATCH':
          return json(await handlePatch(env.DB, table, url.searchParams, request, id), 200, cors);
        case 'DELETE':
          return json(await handleDelete(env.DB, table, url.searchParams, id), 200, cors);
        default:
          throw new HttpError(405, 'Método no permitido');
      }
    } catch (err) {
      return errorResponse(err, cors);
    }
  },
};

async function handleGet(db, table, params, id) {
  const where = buildWhere(table, params, id);
  const columns = parseSelect(table, params.get('select'));
  const order = parseOrder(table, params.get('order'));
  let sql = `SELECT ${columns} FROM ${q(table.name)}${where.sql}${order}`;
  const values = [...where.values];

  if (id !== undefined) {
    const row = await db.prepare(`${sql} LIMIT 1`).bind(...values).first();
    if (!row) throw new HttpError(404, 'No encontrado');
    return row;
  }

  const limit = clampInt(params.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = clampInt(params.get('offset'), 0, 0, 1_000_000);
  sql += ' LIMIT ? OFFSET ?';
  values.push(limit, offset);
  const { results } = await db.prepare(sql).bind(...values).all();
  return results;
}

async function handlePost(db, table, params, request) {
  const body = await readJson(request);
  const rows = Array.isArray(body) ? body : [body];
  if (rows.length === 0) throw new HttpError(400, 'No hay filas que insertar');
  if (rows.length > MAX_ROWS_PER_POST) throw new HttpError(400, `Máximo ${MAX_ROWS_PER_POST} filas por petición`);

  const conflict = params.get('conflict');
  if (conflict && !['ignore', 'replace'].includes(conflict)) {
    throw new HttpError(400, 'conflict debe ser ignore o replace');
  }
  const verb = conflict === 'ignore' ? 'INSERT OR IGNORE' : conflict === 'replace' ? 'INSERT OR REPLACE' : 'INSERT';

  const statements = rows.map((row) => {
    const keys = validateColumns(table, row);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `${verb} INTO ${q(table.name)} (${keys.map(q).join(', ')}) VALUES (${placeholders})`;
    return db.prepare(sql).bind(...keys.map((k) => toSqlValue(row[k])));
  });

  const results = statements.length === 1 ? [await statements[0].run()] : await db.batch(statements);
  return { count: sumChanges(results) };
}

async function handlePatch(db, table, params, request, id) {
  const body = await readJson(request);
  const keys = validateColumns(table, body);
  const where = buildWhere(table, params, id);
  if (!where.sql) throw new HttpError(400, 'PATCH necesita un id o filtros');

  const sets = keys.map((k) => `${q(k)} = ?`).join(', ');
  const sql = `UPDATE ${q(table.name)} SET ${sets}${where.sql}`;
  const result = await db.prepare(sql).bind(...keys.map((k) => toSqlValue(body[k])), ...where.values).run();
  return { count: result.meta?.changes ?? 0 };
