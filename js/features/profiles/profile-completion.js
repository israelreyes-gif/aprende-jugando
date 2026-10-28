const FIELDS = [
  { key: 'name', missing: 'poner un nombre' },
  { key: 'color', missing: 'elegir un color' },
  { key: 'gender', missing: 'elegir chico o chica' },
  { key: 'bell', missing: 'activar los avisos' },
];

/**
 * Cuánto del perfil está rellenado. Cada dato vale lo mismo (25 %).
 * data: { name, color, gender, bell }. bell: true / false, o null si no se sabe (no cuenta como hecho).
 * Devuelve { pct, missing: ['elegir chico o chica', ...] }.
 */
export function profileCompletion(data) {
  const filled = (key) => (key === 'name' ? Boolean(String(data.name || '').trim()) : Boolean(data[key]));
  const missing = FIELDS.filter((f) => !filled(f.key)).map((f) => f.missing);
  return { pct: Math.round(((FIELDS.length - missing.length) * 100) / FIELDS.length), missing };
}
