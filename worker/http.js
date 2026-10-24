export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function readJson(request) {
  try {
    return await request.json();
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
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
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

export function errorResponse(err, cors) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status, cors);

  const message = String(err?.message || err);
  if (/UNIQUE constraint|FOREIGN KEY constraint|PRIMARY KEY/i.test(message)) {
    return json({ error: 'Conflicto con los datos existentes', detail: message }, 409, cors);
  }
  if (/CHECK constraint|NOT NULL constraint/i.test(message)) {
    return json({ error: 'Datos no válidos', detail: message }, 400, cors);
  }
  return json({ error: 'Error interno', detail: message }, 500, cors);
}
