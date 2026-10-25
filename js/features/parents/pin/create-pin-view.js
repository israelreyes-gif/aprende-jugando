import { paths } from '../../../core/paths.js';
import { pinInput, pinView } from './pin-form.js';
import { validateNewPin } from './pin-rules.js';
import { savePin } from './pin-store.js';
import { unlock } from './unlock-state.js';

/** Pantalla para crear (o cambiar) el PIN. */
export function createPinView({ onDone, back = paths.home() }) {
  const pin = pinInput('pin-new');
  const confirm = pinInput('pin-confirm');
  return pinView({
    title: 'Zona de padres',
    sub: 'Crea un PIN de 4 a 8 números',
    back,
    buttonLabel: 'Guardar PIN',
    fields: [
      { label: 'PIN nuevo', input: pin },
      { label: 'Repite el PIN', input: confirm },
    ],
    onSubmit: async () => {
      const problem = validateNewPin(pin.value, confirm.value);
      if (problem) return problem;
      await savePin(pin.value);
      unlock();
      onDone();
      return null;
    },
  });
}
