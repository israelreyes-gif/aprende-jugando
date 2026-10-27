import { h } from '../../../core/dom.js';
import { setReleased } from '../../../data/release.repo.js';
import { notify } from '../../../shared/modal.js';
import { switchButton } from '../../../shared/switch-button.js';

/** Fila de un tema con su interruptor "Disponible". onCount(delta) avisa del cambio al contador. */
export function topicSwitchRow({ profile, course, subject, topic, released, onCount }) {
  const hasContent = topic.available;
  const key = { profileId: profile.id, courseId: course.id, subjectId: subject.id, topicId: topic.id };

  const toggle = switchButton({
    checked: released && hasContent,
    disabled: !hasContent,
    label: `${topic.title}: disponible`,
    onChange: async (value) => {
      try {
        await setReleased(key, value);
        onCount(value ? 1 : -1);
      } catch (err) {
        notify({ kind: 'error', title: 'No se pudo guardar', message: 'Revisa la conexión e inténtalo de nuevo.' });
        throw err;
      }
    },
  });

  return h(
    'div',
    { class: 'switch-row' },
    h('span', { class: 'switch-row__text' }, h('span', { class: 'switch-row__title' }, topic.title), h('span', { class: 'switch-row__meta' }, hasContent ? 'Disponible para estudiar y practicar' : 'Aún sin contenido')),
    toggle,
  );
}
