import { h } from '../../../core/dom.js';

/** Interruptor accesible. onChange(nuevoValor) debe devolver una promesa; si falla, vuelve atrás. */
export function switchButton({ checked, label, disabled = false, onChange }) {
  const el = h('button', { class: 'switch', type: 'button', role: 'switch', 'aria-checked': String(checked), 'aria-label': label, disabled });
  el.addEventListener('click', async () => {
    const next = el.getAttribute('aria-checked') !== 'true';
    el.setAttribute('aria-checked', String(next));
    el.disabled = true;
    try {
      await onChange(next);
    } catch {
      el.setAttribute('aria-checked', String(!next));
    } finally {
      el.disabled = false;
    }
  });
  return el;
}
