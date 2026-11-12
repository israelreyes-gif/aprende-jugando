import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { setProfileCode } from '../../data/auth.repo.js';
import { listProfiles } from '../../data/profiles.repo.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { notify } from '../../shared/modal.js';
import { codeView } from './code-view.js';
import { newCodeFields } from './new-code-fields.js';

/** Los padres ponen un código nuevo a un perfil sin saber el actual (cierra sus sesiones abiertas). */
export async function setProfileCodeScreen({ pid }) {
  const profile = (await listProfiles()).find((p) => p.id === pid);
  if (!profile) return notFoundView();
  const fields = newCodeFields({ owner: pid, prefix: 'set', label: `Código nuevo de ${profile.name}` });
  return codeView({
    title: 'Código nuevo', sub: `Para que ${profile.name} entre en su perfil`, back: paths.childStats(pid), buttonLabel: 'Guardar código',
    fields: [{ node: fields }],
    onSubmit: async () => {
      const { code, error } = fields.read();
      if (error) return error;
      await setProfileCode(pid, code);
      await notify({ kind: 'success', title: 'Código guardado', message: `${profile.name} ya puede entrar con el código nuevo. Díselo.` });
      go(paths.childStats(pid));
      return null;
    },
  });
}
