import { HttpError } from './http.js';
import { q } from './schema.js';

const MAX_IN_VALUES = 200;
const RESERVED = new Set(['order', 'limit', 'offset', 'conflict', 'select']);
const OPERATORS = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', like: 'LIKE' };

/** Construye el WHERE a partir del id de la ruta y de los filtros ?columna=operador.valor */
export function buildWhere(table, params, id) {
  const clauses = [];
  const values = [];

  if (id !== undefined) {
    if (table.pk.length !== 1) throw new HttpError(400, `La tabla ${table.name} no tiene clave primaria simple: usa filtros`);
    clauses.push(`${q(table.pk[0])} = ?`);
    values.push(id);
  }

  for (const [key, raw] of params.entries()) {
    if (RESERVED.has(key)) continue;
    if (!table.columns.includes(key)) throw new HttpError(400, `Columna desconocida: ${key}`);

    const dot = raw.indexOf('.');
    const op = dot === -1 ? '' : raw.slice(0, dot);
    const value = dot === -1 ? '' : raw.slice(dot + 1);

    if (op === 'in') {
      const list = value.split(',').filter((v) => v !== '');
      if (list.length === 0 || list.length > MAX_IN_VALUES) throw new HttpError(400, `Filtro in inválido en ${key}`);
      clauses.push(`${q(key)} IN (${list.map(() => '?').join(', ')})`);
      values.push(...list);
    } else if (op === 'is') {
      if (value === 'null') clauses.push(`${q(key)} IS NULL`);
      else if (value === 'notnull') clauses.push(`${q(key)} IS NOT NULL`);
      else throw new HttpError(400, `Filtro is inválido en ${key}`);
    } else if (OPERATORS[op]) {
      clauses.push(`${q(key)} ${OPERATORS[op]} ?`);
      values.push(value);
    } else {
      throw new HttpError(400, `Filtro inválido en ${key}: usa operador.valor (por ejemplo eq.abc)`);
    }
  }

  return { sql: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '', values };
}

export function parseSelect(table, raw) {
  if (!raw) return '*';
  const cols = raw.split(',').map((c) => c.trim()).filter(Boolean);
  for (const c of cols) if (!table.columns.includes(c)) throw new HttpError(400, `Columna desconocida: ${c}`);
  return cols.map(q).join(', ');
}

export function parseOrder(table, raw) {
  if (!raw) return '';
  const items = raw.split(',').map((part) => {
    const [col, dir = 'asc'] = part.trim().split('.');
    if (!table.columns.includes(col)) throw new HttpError(400, `Columna desconocida en order: ${col}`);
    if (!['asc', 'desc'].includes(dir)) throw new HttpError(400, 'order debe ser asc o desc');
    return `${q(col)} ${dir.toUpperCase()}`;
  });
  return ` ORDER BY ${items.join(', ')}`;
}

export function validateColumns(table, row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new HttpError(400, 'El cuerpo debe ser un objeto JSON');
  const keys = Object.keys(row);
  if (keys.length === 0) throw new HttpError(400, 'El objeto está vacío');
  for (const k of keys) if (!table.columns.includes(k)) throw new HttpError(400, `Columna desconocida: ${k}`);
  return keys;
}

export function toSqlValue(value) {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value !== null && typeof value === 'object') throw new HttpError(400, 'Los valores deben ser texto, número o null');
  return value;
}

export function clampInt(raw, fallback, min, max) {
  const n = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
