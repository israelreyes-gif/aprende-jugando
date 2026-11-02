import { AVATAR_COLORS } from '../../data/profile-options.js';
import { createProfile } from '../../data/profiles.repo.js';
import { createCode } from '../../data/auth.repo.js';
import { newCodeFields } from '../auth/new-code-fields.js';
import { profileForm } from './profile-form.js';

/**
 * Formulario para crear un perfil. Llama a onCreated() cuando el perfil se ha guardado.
 * El código es opcional: si se deja vacío, el niño lo crea la primera vez que entre.
 */
export function newProfileForm({ onCreated }) {
  const codeFields = newCodeFields({ owner: 'new', prefix: 'new-profile', optional: true, label: 'Código de entrada (opcional)' });
  return profileForm({
    initial: { name: '', color: AVATAR_COLORS[3].hex, gender: null },
    askCourse: true,
    submitLabel: 'Crear perfil',
    errorText: 'No se ha podido crear el perfil. Inténtalo de nuevo.',
    extra: codeFields,
    onSave: async ({ name, color, gender, courseId }) => {
      const { code, error } = codeFields.read();
      if (error) throw Object.assign(new Error(error), { userMessage: error });
      const profile = await createProfile({ name, color, gender, courseId });
      if (code) await createCode(profile.id, code, { remember: false });
      onCreated();
    },
  });
}
