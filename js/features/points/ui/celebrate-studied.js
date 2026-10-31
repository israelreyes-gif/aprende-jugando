import { h } from '../../../core/dom.js';
import { mascotSrc } from '../../../shared/mascot.js';
import { formatNumber, signed } from '../format-points.js';
import { pointsOutcome } from '../points-outcome.js';
import { POINTS } from '../rules.js';
import { announceLevelUp } from './announce-level-up.js';
import { showCelebration } from './celebration.js';

/** Al marcar un tema como estudiado: "+10" a pantalla completa y, si sube de nivel, la pantalla de nivel. Nunca lanza error. */
export async function celebrateStudied({ profile, queued, topicTitle }) {
  try {
    const outcome = await pointsOutcome({ profileId: profile.id, delta: POINTS.studied, queued });
    const lines = [{ label: topicTitle, value: signed(POINTS.studied), tone: 'pos' }];
    if (outcome) lines.push({ label: 'Total ahora', value: `${formatNumber(outcome.total)} puntos`, tone: 'total' });

    await showCelebration({
      theme: 'gold',
      art: h('img', { class: 'celebration__mascot', src: mascotSrc(), alt: '', width: 120, height: 120 }),
      big: signed(POINTS.studied),
      title: '¡tema estudiado!',
      bubble: '¡Eso es un cerebro en marcha! 🧠',
      lines,
    });
    if (outcome?.up) await announceLevelUp({ profile, level: outcome.up });
  } catch (err) {
    console.warn('No se pudieron mostrar los puntos', err);
  }
}
