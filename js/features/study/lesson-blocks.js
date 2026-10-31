import { h } from '../../core/dom.js';
import { speakButton } from '../../shared/speech/speak-button.js';
import { foldBlock } from './fold-block.js';
import { studyText } from '../../shared/speech/study-text.js';

// Una lección es una lista de bloques. Cada bloque es un objeto con UNA clave:
//   { h: 'Título de sección' }
//   { fold: 'Título', list: [...] }   (sección plegable)
//   { p: 'Párrafo de texto' }
//   { list: ['punto 1', 'punto 2'] }
//   { tip: 'Truco o ejemplo destacado', label: 'Truco' }   (label es opcional)
// Con { speak: true } (asignaturas en inglés) cada párrafo, línea y truco lleva un botón 🔊.
export function renderBlocks(blocks, { speak = false } = {}) {
  const listen = (text) => (speak ? speakButton(studyText(text)) : null);
  return blocks.map((block) => {
    if (block.fold) return foldBlock(block, listen);
    if (block.h) return h('h2', { class: 'lesson__h' }, block.h);
    if (block.p) return h('p', { class: 'lesson__p' }, block.p, listen(block.p));
    if (block.list) return h('ul', { class: 'lesson__list' }, block.list.map((item) => h('li', {}, item, listen(item))));
    if (block.tip) return h('div', { class: 'lesson__tip' }, block.label ? h('strong', {}, `${block.label}: `) : null, block.tip, listen(block.tip));
    return null;
  });
}
