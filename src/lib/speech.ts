// Voz en hebreo usando la Web Speech API del navegador.

let hebrewVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) voicesLoaded = true;
  hebrewVoice =
    voices.find((v) => v.lang === 'he-IL') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('he')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('iw')) ??
    null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** true si el navegador tiene una voz en hebreo (o todavía no cargó la lista). */
export function hasHebrewVoice(): boolean {
  if (!speechSupported()) return false;
  if (!voicesLoaded) loadVoices();
  return !voicesLoaded || hebrewVoice !== null;
}

export function speak(text: string, rate = 0.8) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'he-IL';
  if (hebrewVoice) u.voice = hebrewVoice;
  u.rate = rate;
  synth.speak(u);
}
