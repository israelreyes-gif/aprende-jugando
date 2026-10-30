import { enToEs } from './gen/en-to-es.js';
import { esToEn } from './gen/es-to-en.js';
import { writeVerb } from './gen/write-verb.js';
import { buildPhrase } from './gen/build-phrase.js';
import { missingVerb } from './gen/missing-verb.js';

export const exercises = [
  { id: 'en-to-es', generate: enToEs },
  { id: 'es-to-en', generate: esToEn },
  { id: 'write-verb', generate: writeVerb },
  { id: 'build-phrase', generate: buildPhrase },
  { id: 'missing-verb', generate: missingVerb },
];
