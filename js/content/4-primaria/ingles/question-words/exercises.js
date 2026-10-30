import { chooseWh } from './gen/choose-wh.js';
import { answerToQuestion } from './gen/answer-to-question.js';
import { questionToAnswer } from './gen/question-to-answer.js';
import { translateWh } from './gen/translate-wh.js';
import { buildQuestion } from './gen/build-question.js';
import { writeWh } from './gen/write-wh.js';

export const exercises = [
  { id: 'choose-wh', generate: chooseWh },
  { id: 'answer-to-question', generate: answerToQuestion },
  { id: 'question-to-answer', generate: questionToAnswer },
  { id: 'translate-wh', generate: translateWh },
  { id: 'build-question', generate: buildQuestion },
  { id: 'write-wh', generate: writeWh },
];
