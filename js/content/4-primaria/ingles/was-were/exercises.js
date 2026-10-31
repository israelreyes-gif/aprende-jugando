import { chooseBe } from './gen/choose-be.js';
import { chooseSubject } from './gen/choose-subject.js';
import { writeBe } from './gen/write-be.js';
import { buildSentence } from './gen/build-sentence.js';
import { changeForm } from './gen/change-form.js';

export const exercises = [
  { id: 'choose-be', generate: chooseBe },
  { id: 'choose-subject', generate: chooseSubject },
  { id: 'write-be', generate: writeBe },
  { id: 'build-sentence', generate: buildSentence },
  { id: 'change-form', generate: changeForm },
];
