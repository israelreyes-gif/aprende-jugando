import { DEFAULT_API_URL } from '../../config.js';
import { clearReadCache } from './cache-store.js';

const KEY_URL = 'aj.apiUrl';
const KEY_SECRET = 'aj.apiKey';

export function getConnection() {
  return {
    url: (localStorage.getItem(KEY_URL) || DEFAULT_API_URL || '').replace(/\/+$/, ''),
    key: localStorage.getItem(KEY_SECRET) || '',
  };
}

export function setConnection(url, key) {
  localStorage.setItem(KEY_URL, url.trim().replace(/\/+$/, ''));
  localStorage.setItem(KEY_SECRET, key.trim());
  clearReadCache(); // otra conexión puede ser otra base de datos
}

export function isConfigured() {
  const { url, key } = getConnection();
  return Boolean(url && key);
}
