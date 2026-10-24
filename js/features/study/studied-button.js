import { h } from '../../core/dom.js';
import { icon } from '../../shared/icons.js';
import { toast } from '../../shared/toast.js';

/** Botón "Marcar como estudiado". onMark() guarda el progreso; si falla, se deshace. */
export function studiedButton({ t, studied, onMark }) {
  let done = studied;
  const button = h('button', { class: 'btn btn--outline btn--block', type: 'button' });

  function draw() {
    button.replaceChildren(...(done ? [icon('check', 22), t.studied] : [t.markStudied]));
    button.setAttribute('aria-disabled', String(done));
  }

  button.addEventListener('click', async () => {
    if (done) return;
    done = true;
    draw();
    try {
      await onMark();
      toast(t.studiedDone);
    } catch (err) {
      console.error(err);
      done = false;
      draw();
      toast(t.saveFailed);
    }
  });

  draw();
  return button;
}
