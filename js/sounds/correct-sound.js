// Acierto: dos campanitas (aguda y algo más grave) que se repiten una vez.
const NOTES = [
  { at: 0, hz: 1120, volume: 1 },
  { at: 0.1, hz: 883, volume: 1 },
  { at: 0.22, hz: 1120, volume: 0.7 },
  { at: 0.3, hz: 883, volume: 0.9 },
];
const LENGTH = 0.45;

function bell(ctx, out, start, { hz, volume }) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(0.35 * volume, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + LENGTH);
  gain.connect(out);
  for (const [multiple, level] of [[1, 1], [4, 0.25]]) {
    const osc = ctx.createOscillator();
    const part = ctx.createGain();
    part.gain.value = level;
    osc.frequency.value = hz * multiple;
    osc.connect(part).connect(gain);
    osc.start(start);
    osc.stop(start + LENGTH);
  }
}

/** Programa el sonido de acierto en `out`, empezando en el instante `start` del reloj de audio. */
export function scheduleCorrect(ctx, out, start) {
  for (const note of NOTES) bell(ctx, out, start + note.at, note);
}
