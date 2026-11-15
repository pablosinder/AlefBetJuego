// Reproduce las voces grabadas (public/audio/<id>.mp3) con Web Audio.
// Web Audio, una vez activado con un toque, reproduce sin restricciones en iPhone/iPad
// y Android, también cuando la voz arranca sola (instrucciones al empezar una ronda).
// Si una frase no tiene grabación, se usa la voz en hebreo del dispositivo.
import { clipId } from './clipId';

const BASE = `${import.meta.env.BASE_URL}audio/`;

let ctx: AudioContext | null = null;

/** Contexto de audio compartido (voces y efectos). */
export function audioContext(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state !== 'running') void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/** Debe llamarse dentro de un toque del usuario para habilitar el audio. */
export function unlockAudio() {
  const c = audioContext();
  if (c) {
    // Un sonido vacío dentro del toque desbloquea el audio en iOS.
    const src = c.createBufferSource();
    src.buffer = c.createBuffer(1, 1, 22050);
    src.connect(c.destination);
    src.start(0);
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  }
}

// Grabaciones ya descargadas y decodificadas (null = no existe).
const buffers = new Map<string, Promise<AudioBuffer | null>>();

function decode(c: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  // Forma con callbacks: compatible con Safari antiguo.
  return new Promise((resolve, reject) => c.decodeAudioData(data, resolve, reject));
}

function load(id: string): Promise<AudioBuffer | null> {
  let p = buffers.get(id);
  if (!p) {
    p = fetch(`${BASE}${id}.mp3`)
      .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('audio') ? r.arrayBuffer() : null))
      .then((data) => {
        const c = audioContext();
        return data && c ? decode(c, data) : null;
      })
      .catch(() => null);
    buffers.set(id, p);
  }
  return p;
}

/** Descarga por adelantado para que no haya demora al hablar. */
export function preload(texts: string[]) {
  for (const t of texts) void load(clipId(t));
}

let token = 0;
let current: AudioBufferSourceNode | null = null;

export function stopAudio() {
  token++;
  try {
    current?.stop();
  } catch {
    // ya terminó
  }
  current = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function playBuffer(buf: AudioBuffer, my: number): Promise<void> {
  return new Promise((resolve) => {
    const c = audioContext();
    if (!c || my !== token) return resolve();
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.onended = () => {
      if (current === src) current = null;
      resolve();
    };
    current = src;
    src.start(0);
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
  // Empezar a descargar todas a la vez.
  const pending = texts.map((t) => load(clipId(t)));
  for (const [i, text] of texts.entries()) {
    const buf = await pending[i];
    if (my !== token) return;
    if (buf) await playBuffer(buf, my);
    else await speakTTS(text, my);
  }
}
