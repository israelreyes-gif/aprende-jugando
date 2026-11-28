import { h } from '../../../core/dom.js';
import { openModal } from '../../../shared/modal/modal-dialog.js';
import { diamond } from '../../../shared/diamond.js';
import { markSeen, wasSeen } from './notice-seen.js';
import { noticeTexts } from './notice-texts.js';
import { useDiamond } from './use-diamond.js';

/** Aviso dentro de la pantalla mientras ayer se pueda salvar con un diamante (null si no toca). */
export function streakBanner({ profile, status }) {
  const alert = status?.alert;
  if (alert?.kind !== 'save') return null;
  const text = noticeTexts.banner({ streak: alert.streak, available: status.diamonds.available });
  return h(
    'div',
    { class: 'diamond-banner' },
    h('span', { class: 'diamond-banner__gem' }, diamond({ filled: true, width: 34 })),
    h(
      'div',
      { class: 'diamond-banner__body' },
      h('p', { class: 'diamond-banner__title' }, text.title),
      h('p', { class: 'diamond-banner__text' }, text.message),
      h('span', { class: 'diamond-banner__chip' }, text.chip),
      h('button', { class: 'btn btn--primary btn--block', type: 'button', onClick: () => useDiamond({ profile, alert }) }, text.button),
    ),
  );
}

/**
 * Enseña, una vez al día, la ventana que toque: salvar la racha con un diamante, racha rota o diamante ganado.
 * Devuelve el tipo de aviso mostrado (o null).
 */
export async function showStreakNotice({ profile, status }) {
  if (!status) return null;
  const kind = status.alert?.kind ?? status.earned;
  if (!kind || wasSeen(profile.id, kind, status.today)) return null;
  markSeen(profile.id, kind, status.today);

  if (kind === 'save') {
    const text = noticeTexts.save({ streak: status.alert.streak, available: status.diamonds.available });
    const choice = await openModal({
      kind: 'info',
      graphic: diamond({ filled: true, width: 64 }),
      title: text.title,
      message: text.message,
      actions: [{ label: text.use, value: 'use' }, { label: text.skip, value: 'skip', style: 'outline' }],
      dismissValue: 'skip',
    });
    if (choice === 'use') await useDiamond({ profile, alert: status.alert });
    return kind;
  }

  const text = noticeTexts[kind]({ streak: status.alert?.streak ?? status.streak });
  await openModal({
    kind: 'info',
    graphic: diamond({ filled: kind.startsWith('earned'), width: kind.startsWith('earned') ? 72 : 64 }),
    title: text.title,
    message: text.message,
    actions: [{ label: text.button, value: 'ok' }],
    dismissValue: 'ok',
  });
  return kind;
}

/** Tras pintar la pantalla, enseña el aviso del día si la pantalla sigue en pantalla. */
export function scheduleStreakNotice(view, { profile, status }) {
  setTimeout(() => {
    if (document.body.contains(view)) showStreakNotice({ profile, status }).catch((err) => console.error(err));
  }, 350);
}
