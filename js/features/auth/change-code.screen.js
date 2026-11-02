import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { PARENT_OWNER } from '../../core/api/session-store.js';
import { changeCode } from '../../data/auth.repo.js';
import { notify } from '../../shared/modal.js';
import { codeInput } from './code-input.js';
import { codeView } from './code-view.js';
import { newCodeFields } from './new-code-fields.js';

function changeView({ owner, back, sub, onDone }) {
  const current = codeInput('current-code');
  const fields = newCodeFields({ owner, prefix: 'change', label: 'Código nuevo' });
  return codeView({
    title: 'Cambiar código', sub, back, buttonLabel: 'Guardar código',
    fields: [{ label: 'Código actual', node: current }, { node: fields }],
    onSubmit: async () => {
      if (!current.value) return 'Escribe tu código actual.';
      const { code, error } = fields.read();
      if (error) return error;
      await changeCode(owner, current.value, code);
      await notify({ kind: 'success', title: 'Código cambiado', message: 'Ya puedes usar el nuevo código.' });
      onDone();
      return null;
    },
  });
}

/** Cambiar el código de un perfil (hay que saber el actual). */
export async function changeCodeScreen({ pid }) {
  return changeView({ owner: pid, back: paths.editProfile(pid), sub: 'Tu código de entrada', onDone: () => go(paths.editProfile(pid)) });
}

/** Cambiar el código de padres. */
export async function changeParentCodeScreen() {
  return changeView({ owner: PARENT_OWNER, back: paths.parents(), sub: 'Código de la zona de padres', onDone: () => go(paths.parents()) });
}
