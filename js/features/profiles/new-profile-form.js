import { AVATAR_COLORS } from '../../data/profile-options.js';
import { createProfile } from '../../data/profiles.repo.js';
import { profileForm } from './profile-form.js';

/** Formulario para crear un perfil. Llama a onCreated() cuando el perfil se ha guardado. */
export function newProfileForm({ onCreated }) {
  return profileForm({
    initial: { name: '', color: AVATAR_COLORS[3].hex },
    submitLabel: 'Crear perfil',
    errorText: 'No se ha podido crear el perfil. Inténtalo de nuevo.',
    onSave: async ({ name, color }) => {
      await createProfile({ name, color });
      onCreated();
    },
  });
}
