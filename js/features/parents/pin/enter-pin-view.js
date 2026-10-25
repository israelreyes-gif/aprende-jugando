import { paths } from '../../../core/paths.js';
import { pinInput, pinView } from './pin-form.js';
import { verifyPin } from './pin-store.js';
import { unlock } from './unlock-state.js';

/** Pantalla para introducir el PIN ya creado. */
export function enterPinView({ stored, onDone }) {
  const pin = pinInput('pin-enter');
  return pinView({
    title: 'Zona de padres',
    sub: 'Introduce tu PIN',
    back: paths.home(),
    buttonLabel: 'Entrar',
    fields: [{ label: 'PIN', input: pin }],
    onSubmit: async () => {
      if (!(await verifyPin(pin.value, stored))) {
        pin.value = '';
        pin.focus();
        return 'PIN incorrecto.';
      }
      unlock();
      onDone();
      return null;
    },
  });
}
