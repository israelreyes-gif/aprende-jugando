import { insertRows, request } from '../core/api/request.js';

const PAGE_SIZE = 1000;
const CHUNK_SIZE = 200;

/** Lee una tabla entera, por páginas (el Worker limita las filas por petición). No se guarda en la caché del dispositivo. */
export async function readWholeTable(table) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await request('GET', table, { query: { order: 'id.asc', limit: PAGE_SIZE, offset } });
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

/** Añade las filas que no existan (por trozos). Las que ya están no se tocan. Devuelve cuántas se han añadido. */
export async function insertMissingRows(table, rows) {
  let added = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const result = await insertRows(table, rows.slice(i, i + CHUNK_SIZE), 'ignore');
    added += result.count ?? 0;
  }
  return added;
}
