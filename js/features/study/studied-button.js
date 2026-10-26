import { h } from '../../core/dom.js';
import { icon } from '../../shared/icons.js';
import { notify } from '../../shared/modal.js';

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
      notify({ kind: 'success', title: t.studiedDone, button: t.gotIt });
    } catch (err) {
      console.error(err);
      done = false;
      draw();
      notify({ kind: 'error', title: t.saveFailed, message: t.tryAgain, button: t.gotIt });
    }
  });

  draw();
  return button;
}
