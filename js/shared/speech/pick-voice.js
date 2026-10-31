/** Elige la voz en inglés: Samantha (en-US) si el móvil la tiene; si no, cualquier en-US; si no, cualquier inglés. */
export function pickVoice(voices) {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
  const american = english.filter((voice) => voice.lang.toLowerCase().replace('_', '-') === 'en-us');
  return american.find((voice) => voice.name === 'Samantha') || american[0] || english[0] || null;
}
