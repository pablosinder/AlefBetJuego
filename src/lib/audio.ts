// Reproduce las voces grabadas (public/audio/<id>.mp3).
// Si una frase no tiene archivo, usa la voz en hebreo del navegador.
import { clipId } from './clipId';

const BASE = `${import.meta.env.BASE_URL}audio/`;

let available: Set<string> | null = null;
const ready: Promise<void> = fetch(`${BASE}catalog.json`)
  .then((r) => (r.ok ? r.json() : {}))
  .then((catalog: Record<string, string>) => {
    available = new Set(Object.keys(catalog));
  })
  .catch(() => {
    available = new Set();
  });

// Un solo elemento <audio> reutilizado: en iOS queda "desbloqueado" tras el primer toque.
const player = typeof Audio !== 'undefined' ? new Audio() : null;
let token = 0;

export function hasClip(text: string): boolean {
  return !!available?.has(clipId(text));
}

/** Debe llamarse dentro de un toque del usuario para habilitar el audio. */
export function unlockAudio() {
  if (!player) return;
  player.muted = true;
  player.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
  player.play().then(
    () => {
      player.pause();
      player.muted = false;
    },
    () => {
      player.muted = false;
    },
  );
  if ('speechSynthesis' in window) {
    // también "despierta" la síntesis de voz en iOS
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  }
}

export function stopAudio() {
  token++;
  player?.pause();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function playClip(id: string, my: number): Promise<void> {
  return new Promise((resolve) => {
    if (!player || my !== token) return resolve();
    const done = () => {
      player.onended = null;
      player.onerror = null;
      resolve();
    };
    player.onended = done;
    player.onerror = done;
    player.src = `${BASE}${id}.mp3`;
    player.play().catch(done);
  });
}

function speakTTS(text: string, my: number): Promise<void> {
  return new Promise((resolve) => {
    if (my !== token || !('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'he-IL';
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith('he') || v.lang.toLowerCase().startsWith('iw'));
    if (voice) u.voice = voice;
    u.rate = 0.85;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
    setTimeout(resolve, 8000); // por si el navegador nunca avisa el final
  });
}

/** Dice una o más frases en orden. Corta lo que se estaba diciendo antes. */
export async function say(...texts: string[]): Promise<void> {
  stopAudio();
  const my = token;
  await ready;
  for (const text of texts) {
    if (my !== token) return;
    const id = clipId(text);
    if (available?.has(id)) await playClip(id, my);
    else await speakTTS(text, my);
  }
}
