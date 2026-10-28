import { h } from '../../core/dom.js';

/** Barra "Perfil al 75 %" con lo que falta. update(completion) la refresca. */
export function completionBar(completion) {
  const title = h('b', {});
  const left = h('span', { class: 'completion__missing' });
  const fill = h('i', {});
  const root = h('div', { class: 'completion', role: 'status' }, h('div', { class: 'completion__head' }, title, left), h('div', { class: 'completion__bar' }, fill));

  root.update = ({ pct, missing }) => {
    root.classList.toggle('completion--full', pct === 100);
    title.textContent = pct === 100 ? 'Perfil completo ✅' : `Perfil al ${pct} %`;
    left.textContent = missing.length ? `Te falta: ${missing.join(', ')}` : '';
    fill.style.width = `${pct}%`;
  };
  root.update(completion);
  return root;
}
