import { MAX_SHIELDS, SHIELD_EVERY } from './shield-balance.js';

/** Textos de las ventanas de racha (diamante). Una función por aviso para poder cambiarlos sin tocar la lógica. */
export const noticeTexts = {
  save: ({ streak, available }) => ({
    title: 'Ayer no hiciste el reto',
    message: `Tu racha de ${streak} días está en peligro. Usa un diamante y la salvas como si no hubiera pasado nada.`,
    use: available > 1 ? `Usar un diamante (te quedan ${available - 1})` : 'Usar mi último diamante',
    skip: 'Prefiero no usarlo',
  }),
  lost: ({ streak }) => ({
    title: 'Ayer no pudo ser',
    message: `Tu racha de ${streak} días ha terminado, y fue estupenda. Esa marca ya es tuya y nadie te la quita. Hoy empieza una nueva: cada día que juegas suma, y a los ${SHIELD_EVERY} ganarás un diamante.`,
    button: '¡A por la nueva racha!',
  }),
  'lost-two': ({ streak }) => ({
    title: 'Dos días sin reto',
    message: `Tu racha de ${streak} días se ha roto: un diamante solo salva un día y han pasado dos. Esa marca ya es tuya y nadie te la quita. Hoy empieza una nueva, ¡a por ella!`,
    button: '¡A por la nueva racha!',
  }),
  earned: ({ streak }) => ({
    title: `¡${streak} días seguidos!`,
    message: `Has ganado un diamante. Si algún día no puedes hacer el reto, te salvará la racha. Puedes guardar hasta ${MAX_SHIELDS}.`,
    button: '¡Genial!',
  }),
  'earned-max': ({ streak }) => ({
    title: `¡${streak} días seguidos!`,
    message: `Qué gran racha. Ya tienes el máximo de ${MAX_SHIELDS} diamantes, así que este no se suma. ¡Úsalos cuando los necesites!`,
    button: '¡Genial!',
  }),
  banner: ({ streak, available }) => ({
    title: 'Ayer se te escapó el reto',
    message: `Puedes salvar tu racha de ${streak} días con un diamante.`,
    chip: available === 1 ? 'Tienes 1 diamante' : `Tienes ${available} diamantes`,
    button: 'Salvar mi racha',
  }),
};
