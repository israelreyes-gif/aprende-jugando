import { withSay } from '../lib/with-say.js';
import { clockToWords } from './gen/clock-to-words.js';
import { phraseToClock } from './gen/phrase-to-clock.js';
import { digitalToWords } from './gen/digital-to-words.js';
import { writeTime } from './gen/write-time.js';
import { buildTime } from './gen/build-time.js';
import { midday } from './gen/midday.js';
import { routine } from './gen/routine.js';

export const exercises = withSay([
  { id: 'clock-to-words', generate: clockToWords },
  { id: 'phrase-to-clock', generate: phraseToClock },
  { id: 'digital-to-words', generate: digitalToWords },
  { id: 'write-time', generate: writeTime },
  { id: 'build-time', generate: buildTime },
  { id: 'midday', generate: midday },
  { id: 'routine', generate: routine },
], {
  'clock-to-words': 'answer',
  'phrase-to-clock': 'answer',
  'digital-to-words': 'answer',
  'write-time': 'answer',
  'build-time': 'answer',
  'midday': 'answer',
  'routine': 'answer',
});
