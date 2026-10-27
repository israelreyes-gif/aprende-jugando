import { getAudioContext } from './audio-context.js';
import { scheduleCorrect } from './correct-sound.js';
import { scheduleWrong } from './wrong-sound.js';

/** Suena el acierto o el fallo. Si el dispositivo no puede reproducir sonido, no pasa nada. */
export function playFeedback(ok) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    (ok ? scheduleCorrect : scheduleWrong)(ctx, ctx.destination, ctx.currentTime + 0.02);
  } catch {
    /* sin sonido, la app sigue igual */
  }
}
