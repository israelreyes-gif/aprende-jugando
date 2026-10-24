import { HttpError, readJson } from './http.js';
import { q } from './schema.js';
import { buildWhere, clampInt, parseOrder, parseSelect, toSqlValue, validateColumns } from './query.js';

const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 5000;
const MAX_ROWS_PER_POST = 500;

const sumChanges = (results) => results.reduce((total, r) => total + (r.meta?.changes ?? 0), 0);

export async function handleGet(db, table, params, id) {
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

export async function handlePost(db, table, params, request) {
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

export async function handlePatch(db, table, params, request, id) {
  const body = await readJson(request);
  const keys = validateColumns(table, body);
  const where = buildWhere(table, params, id);
  if (!where.sql) throw new HttpError(400, 'PATCH necesita un id o filtros');

  const sets = keys.map((k) => `${q(k)} = ?`).join(', ');
  const sql = `UPDATE ${q(table.name)} SET ${sets}${where.sql}`;
  const result = await db.prepare(sql).bind(...keys.map((k) => toSqlValue(body[k])), ...where.values).run();
  return { count: result.meta?.changes ?? 0 };
}

export async function handleDelete(db, table, params, id) {
  const where = buildWhere(table, params, id);
  if (!where.sql) throw new HttpError(400, 'DELETE necesita un id o filtros');
  const result = await db.prepare(`DELETE FROM ${q(table.name)}${where.sql}`).bind(...where.values).run();
  return { count: result.meta?.changes ?? 0 };
}
