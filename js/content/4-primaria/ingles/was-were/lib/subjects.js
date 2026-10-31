// Rule from the book: WAS for I, he, she, it. WERE for you, we, they.
export const subjects = [
  { w: 'I', be: 'was' },
  { w: 'he', be: 'was' },
  { w: 'she', be: 'was' },
  { w: 'it', be: 'was' },
  { w: 'you', be: 'were' },
  { w: 'we', be: 'were' },
  { w: 'they', be: 'were' },
];

/** "he" → "He" (the word "I" stays as it is). */
export function capital(word) {
  return word === 'I' ? word : word[0].toUpperCase() + word.slice(1);
}
