import { chooseCould } from './gen/choose-could.js';
import { chooseActivity } from './gen/choose-activity.js';
import { writeCould } from './gen/write-could.js';
import { buildSentence } from './gen/build-sentence.js';
import { changeForm } from './gen/change-form.js';
import { shortAnswer } from './gen/short-answer.js';

export const exercises = [
  { id: 'choose-could', generate: chooseCould },
  { id: 'choose-activity', generate: chooseActivity },
  { id: 'write-could', generate: writeCould },
  { id: 'build-sentence', generate: buildSentence },
  { id: 'change-form', generate: changeForm },
  { id: 'short-answer', generate: shortAnswer },
];
