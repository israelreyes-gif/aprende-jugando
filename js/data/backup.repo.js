import { request } from '../core/api/request.js';

const PAGE_SIZE = 1000;

/** Lee una tabla entera, por páginas (el Worker limita las filas por petición). No se guarda en la caché del dispositivo. */
export async function readWholeTable(table) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await request('GET', table, { query: { order: 'id.asc', limit: PAGE_SIZE, offset } });
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}
