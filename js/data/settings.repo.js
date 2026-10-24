import { api } from '../core/api.js';

export async function getSetting(key) {
  const row = await api.get('settings', key);
  return row ? row.value : null;
}

export function saveSetting(key, value) {
  return api.insert('settings', { key, value, updated_at: new Date().toISOString() }, { conflict: 'replace' });
}
