export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const MAX_BODY_BYTES = 1_000_000; // una copia de seguridad restaurada va en tandas de 500 filas, muy por debajo

/** Rechaza antes de leerlo un cuerpo anunciado como demasiado grande. */
export function assertBodySize(request) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > MAX_BODY_BYTES) throw new HttpError(413, 'Petición demasiado grande');
}

export async function readJson(request) {
  let text;
  try {
    text = await request.text();
  } catch {
    throw new HttpError(400, 'El cuerpo no es un JSON válido');
  }
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'Petición demasiado grande');
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'El cuerpo no es un JSON válido');
  }
}

export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map((s) => s.trim()).filter(Boolean);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, X-Session',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (allowed.includes('*')) headers['Access-Control-Allow-Origin'] = '*';
  else if (origin && allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

export function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors },
  });
}

/** Respuesta de error. Nunca lleva el texto interno de la base de datos: ese detalle solo va a los avisos a padres. */
export function errorResponse(err, cors) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status, cors);

  const message = String(err?.message || err);
  if (/UNIQUE constraint|FOREIGN KEY constraint|PRIMARY KEY/i.test(message)) {
    return json({ error: 'Conflicto con los datos existentes' }, 409, cors);
  }
  if (/CHECK constraint|NOT NULL constraint/i.test(message)) {
    return json({ error: 'Datos no válidos' }, 400, cors);
  }
  return json({ error: 'Error interno' }, 500, cors);
}
