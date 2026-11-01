import { choiceQ } from '../../../../exercises/make/choice.js';
import { textQ } from '../../../../exercises/make/text.js';
import { wordsQ } from '../../../../exercises/make/words.js';
import { verbs } from './words.js';

const irregular = verbs.filter(([b, p]) => p !== `${b}ed`);
const past = (id, base, right, wrongs) => ({ id, ...choiceQ(`Past of "${base}"`, right, wrongs, `${base} → ${right}`, { say: right }) });
const writePast = (base, right) => ({ id: `w-${base.replace(/ /g, '-')}`, ...textQ(`Write the past of "${base}"`, [right], `${base} → ${right}`, { say: right }) });
const fill = (id, sentence, right, wrongs) => {
  const full = sentence.replace('___', right);
  return { id, ...choiceQ(sentence, right, wrongs, full, { say: full }) };
};

export const exercises = [
  past('p-see', 'see', 'saw', ['seed', 'sawed', 'seen']),
  past('p-take', 'take', 'took', ['taked', 'taken', 'tooked']),
  past('p-give', 'give', 'gave', ['gived', 'given', 'gaved']),
  past('p-write', 'write', 'wrote', ['writed', 'written', 'wroted']),
  past('p-have', 'have', 'had', ['haved', 'has', 'haves']),
  past('p-teach', 'teach', 'taught', ['teached', 'teachs', 'tought']),
  past('p-drive', 'drive', 'drove', ['drived', 'driven', 'droved']),
  past('p-climb', 'climb', 'climbed', ['clomb', 'climbt', 'clamb']),
  ...irregular.map(([b, p]) => writePast(b, p)),
  fill('s-saw', 'Yesterday I ___ a big dog.', 'saw', ['see', 'seeing', 'seed']),
  fill('s-wrote', 'She ___ a letter to her friend.', 'wrote', ['write', 'writing', 'writed']),
  fill('s-had', 'We ___ lunch at two o\'clock.', 'had', ['have', 'haved', 'having']),
  fill('s-took', 'He ___ his bag and went home.', 'took', ['take', 'taked', 'taking']),
  fill('s-built', 'They ___ a house last year.', 'built', ['build', 'builded', 'building']),
  fill('s-told', 'My mum ___ me a story.', 'told', ['tell', 'telled', 'telling']),
  { id: 'build-gave', ...wordsQ('Build the sentence', ['She', 'gave', 'me', 'a', 'book.'], ['give'], 'She gave me a book.'), say: 'She gave me a book.' },
  { id: 'build-drove', ...wordsQ('Build the sentence', ['My', 'dad', 'drove', 'a', 'bus.'], ['drive'], 'My dad drove a bus.'), say: 'My dad drove a bus.' },
];
