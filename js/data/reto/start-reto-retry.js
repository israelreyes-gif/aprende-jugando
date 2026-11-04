import { startReto } from './start-reto.js';

const WAITS_MS = [1000, 3000, 8000];

/** Como startReto, pero si falla reintenta en silencio (1 s, 3 s, 8 s). Si sigue fallando, lanza el último error. */
export async function startRetoWithRetry(args, { waits = WAITS_MS, start = startReto } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await start(args);
    } catch (err) {
      if (attempt >= waits.length) throw err;
      await new Promise((resolve) => setTimeout(resolve, waits[attempt]));
    }
  }
}
