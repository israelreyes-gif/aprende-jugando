import { h } from '../../../core/dom.js';

const WHAT = { practice_sessions: 'un ejercicio', answers: 'unas respuestas', study_progress: 'un tema estudiado' };
const whenText = (iso) => new Date(iso).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
const row = (emoji, label, value, tone) => h('div', { class: `sync-row${tone ? ` sync-row--${tone}` : ''}` }, h('span', { class: 'sync-row__emoji' }, emoji), h('span', { class: 'sync-row__label' }, label), h('b', {}, String(value)));

/** Tarjeta "Sincronización" de la zona de padres. summary: lo que devuelve summarizeSync(). */
export function syncSection(summary, name) {
  const bad = summary.failed > 0;
  return h(
    'section',
    { class: 'stack' },
    h('h2', { class: 'title-lg' }, 'Sincronización'),
    h(
      'div',
      { class: 'sync-card' },
      h('p', { class: `sync-card__state ${bad ? 'sync-card__state--bad' : 'sync-card__state--ok'}` }, bad ? 'Revisar ⚠️' : 'Todo guardado ✅', h('span', {}, ' · últimos 7 días')),
      row('✅', 'Guardado a la primera', summary.ok, 'ok'),
      row('⏳', 'Guardado con retraso', summary.late, summary.late ? 'warn' : null),
      row('❌', 'Sin guardar', summary.failed, summary.failed ? 'bad' : null),
      summary.last
        ? h('p', { class: 'sync-card__note' }, `Último fallo de ${name}: ${whenText(summary.last.created_at)} · ${WHAT[summary.last.what] || summary.last.what}${summary.last.detail ? ` (${summary.last.detail})` : ''}.`)
        : null,
    ),
  );
}
