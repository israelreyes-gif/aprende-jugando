// The three kinds of sentence and how the verb is written in each.
export const KINDS = ['pos', 'neg', 'q'];

const FORMS = {
  pos: { was: 'was', were: 'were' },
  neg: { was: "wasn't", were: "weren't" },
  q: { was: 'Was', were: 'Were' },
};

export const LABEL = { pos: '(affirmative)', neg: '(negative)', q: '(question)' };

export function beFor(kind, be) {
  return FORMS[kind][be];
}

export function otherBe(be) {
  return be === 'was' ? 'were' : 'was';
}
