import { bellRow } from '../push/bell-row.js';

/** Campanita de la zona de padres: este móvil recibe un aviso cuando un perfil termina un reto, un estudio o ejercicios. */
export function parentsBell() {
  return bellRow({
    kind: 'parent',
    title: 'Avisos para padres',
    meta: 'Cuando terminen un reto, un estudio o ejercicios',
    welcome: {
      title: 'Avisos activados',
      body: 'Recibirás un aviso cuando un perfil termine un reto, un estudio o ejercicios.',
      tag: 'avisos-padres-activados',
    },
  });
}
