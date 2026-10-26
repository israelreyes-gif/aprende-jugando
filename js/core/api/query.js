/** Convierte opciones { where, order, limit, offset, conflict, select } en el texto ?a=b del Worker. select: columnas que se quieren (lista). */
export function buildQuery({ where, order, limit, offset, conflict, select } = {}) {
  const params = new URLSearchParams();
  for (const [col, value] of Object.entries(where || {})) {
    params.append(col, Array.isArray(value) ? `in.${value.join(',')}` : `eq.${value}`);
  }
  if (select) params.set('select', Array.isArray(select) ? select.join(',') : select);
  if (order) params.set('order', order);
  if (limit != null) params.set('limit', String(limit));
  if (offset != null) params.set('offset', String(offset));
  if (conflict) params.set('conflict', conflict);
  const text = params.toString();
  return text ? `?${text}` : '';
}
