import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { PARENT_OWNER } from '../../core/api/session-store.js';
import { createCode, fetchParentStatus, login } from '../../data/auth.repo.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { icon } from '../../shared/icons.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { codeInput } from './code-input.js';
import { codeView } from './code-view.js';
import { markEditOk, markEntered } from './flags.js';
import { newCodeFields } from './new-code-fields.js';
import { takeNext } from './next-page.js';

/** Atajo para los padres: lleva al acceso de padres y, al acertar, vuelve a la pantalla que se quería abrir. */
const asParentLink = () => h('a', { class: 'btn btn--outline btn--block', href: paths.login(PARENT_OWNER) }, icon('lock', 22), 'Entrar como padre');

/** Tras entrar: se anota y se sigue a la pantalla que se quería abrir. */
function done(owner, edit) {
  if (owner !== PARENT_OWNER) {
    markEntered(owner);
    if (edit) markEditOk(owner);
  }
  go(takeNext(owner === PARENT_OWNER ? paths.parents() : paths.courses(owner)), { replace: true });
}

function enterView({ owner, edit, title, sub }) {
  const code = codeInput('login-code');
  return codeView({
    title, sub, back: paths.home(), buttonLabel: 'Entrar',
    fields: [{ label: owner === PARENT_OWNER ? 'Código de padres' : 'Tu código', node: code }],
    extra: owner === PARENT_OWNER ? null : asParentLink(),
    onSubmit: async () => {
      try {
        await login(owner, code.value);
      } catch (err) {
        code.value = '';
        code.focus();
        throw err;
      }
      done(owner, edit);
      return null;
    },
  });
}

function createView({ owner, edit, title, sub, withPin = false }) {
  const pin = withPin ? codeInput('old-pin') : null;
  const fields = newCodeFields({ owner, prefix: 'login', label: owner === PARENT_OWNER ? 'Código de padres nuevo' : 'Crea tu código' });
  return codeView({
    title, sub, back: paths.home(), buttonLabel: 'Guardar y entrar',
    fields: [...(pin ? [{ label: 'PIN de siempre (el de la zona de padres)', node: pin }] : []), { node: fields }],
    extra: owner === PARENT_OWNER ? null : asParentLink(),
    onSubmit: async () => {
      const { code, error } = fields.read();
      if (error) return error;
      if (pin && !pin.value) return 'Escribe el PIN de siempre de la zona de padres.';
      await createCode(owner, code, withPin ? { pin: pin.value } : {});
      done(owner, edit);
      return null;
    },
  });
}

/** Pantalla de entrada: pide el código, o ayuda a crearlo la primera vez. Sirve para un perfil o para los padres. */
export async function loginScreen({ owner, then }) {
  const edit = then === 'edit';
  if (owner === PARENT_OWNER) {
    const status = await fetchParentStatus();
    if (status.has_code) return enterView({ owner, edit, title: 'Zona de padres', sub: 'Escribe el código de padres' });
    return createView({ owner, edit, title: 'Zona de padres', sub: status.legacy ? 'Crea el código de padres' : 'Crea el código de padres', withPin: status.legacy });
  }
  const profile = (await listProfiles()).find((p) => p.id === owner);
  if (!profile) return notFoundView();
  if (profile.has_code) return enterView({ owner, edit, title: profile.name, sub: edit ? 'Escribe tu código para editar tu perfil' : 'Escribe tu código para entrar' });
  return createView({ owner, edit, title: profile.name, sub: 'Todavía no tienes código: crea uno' });
}
