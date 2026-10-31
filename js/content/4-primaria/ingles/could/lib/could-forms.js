// The three kinds of sentence: affirmative, negative and question.
export const KINDS = ['pos', 'neg', 'q'];

export const LABEL = { pos: '(affirmative)', neg: '(negative)', q: '(question)' };

// `main` is the correct verb form; `wrong` is the distractor used in the exercises.
const FORMS = {
  pos: { main: 'could', wrong: "couldn't" },
  neg: { main: "couldn't", wrong: 'could' },
  q: { main: 'Could', wrong: 'Do' },
};

export function mainForm(kind) {
  return FORMS[kind].main;
}

export function wrongForm(kind) {
  return FORMS[kind].wrong;
}
