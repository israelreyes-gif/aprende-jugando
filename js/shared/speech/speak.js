import { canSpeak } from './can-speak.js';
import { pickVoice } from './pick-voice.js';

/** Lee un texto en inglés con la voz elegida. Si ya estaba leyendo algo, lo corta. */
export function speak(text) {
  if (!canSpeak() || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(speechSynthesis.getVoices());
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-US';
  }
  utterance.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
