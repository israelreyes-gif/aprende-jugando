import { withSay } from '../lib/with-say.js';
import { enToEs } from './gen/en-to-es.js';
import { esToEn } from './gen/es-to-en.js';
import { writeWord } from './gen/write-word.js';
import { buildPhrase } from './gen/build-phrase.js';
import { missingVerb } from './gen/missing-verb.js';

export const exercises = withSay([
  { id: 'en-to-es', generate: enToEs },
  { id: 'es-to-en', generate: esToEn },
  { id: 'write-word', generate: writeWord },
  { id: 'build-phrase', generate: buildPhrase },
  { id: 'missing-verb', generate: missingVerb },
], {
  'en-to-es': 'quoted',
  'es-to-en': 'answer',
  'write-word': 'answer',
  'build-phrase': 'answer',
  'missing-verb': 'fill',
});
