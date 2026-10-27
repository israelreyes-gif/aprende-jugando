import { WRONG_COS, WRONG_HZ, WRONG_SIN } from './wrong-wave.js';

// Fallo: zumbador grave en dos golpes, uno corto y otro más largo que se va apagando.
const BURSTS = [
  { at: 0.02, length: 0.105, from: 1, to: 0.75 },
  { at: 0.17, length: 0.515, from: 1, to: 0.4 },
];

/** Programa el sonido de fallo en `out`, empezando en el instante `start` del reloj de audio. */
export function scheduleWrong(ctx, out, start) {
  const wave = ctx.createPeriodicWave(Float32Array.from(WRONG_COS), Float32Array.from(WRONG_SIN));
  for (const { at, length, from, to } of BURSTS) {
    const begin = start + at;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.linearRampToValueAtTime(0.5 * from, begin + 0.004);
    gain.gain.linearRampToValueAtTime(0.5 * to, begin + length - 0.004);
    gain.gain.linearRampToValueAtTime(0.0001, begin + length);
    gain.connect(out);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = WRONG_HZ;
    osc.connect(gain);
    osc.start(begin);
    osc.stop(begin + length);
  }
}
