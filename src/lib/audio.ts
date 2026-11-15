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

/** WAV silencioso de 1 s, para el truco del interruptor de silencio de iPhone. */
function silentWavUrl(): string {
  const rate = 8000;
  const n = rate; // 1 segundo
  const buf = new ArrayBuffer(44 + n);
  const v = new DataView(buf);
  const w = (o: number, str: string) => [...str].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  w(0, 'RIFF');
  v.setUint32(4, 36 + n, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate, true);
  v.setUint16(32, 1, true);
  v.setUint16(34, 8, true); // 8 bits
  w(36, 'data');
  v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128); // silencio en 8 bits
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

let keepAlive: HTMLAudioElement | null = null;

/**
 * En iPhone, Web Audio queda en silencio si el interruptor lateral está en "silencio".
 * Pedimos sesión de "reproducción" (Safari 17+) y, para versiones anteriores, mantenemos
 * sonando un <audio> silencioso en bucle, que cambia la sesión de audio al modo reproducción.
 */
function iosPlaybackSession() {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = 'playback';
  } catch {
    // ignorar
  }
  try {
    if (!keepAlive) {
      keepAlive = document.createElement('audio');
      keepAlive.src = silentWavUrl();
      keepAlive.loop = true;
      keepAlive.setAttribute('playsinline', '');
      keepAlive.setAttribute('x-webkit-airplay', 'deny');
      keepAlive.preload = 'auto';
    }
    if (keepAlive.paused) void keepAlive.play().catch(() => {});
  } catch {
    // ignorar
  }
}

/** Debe llamarse dentro de un toque del usuario para habilitar el audio. */
export function unlockAudio() {
  iosPlaybackSession();
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

// iOS suspende el audio al bloquear la pantalla, cambiar de app o recibir una llamada:
// cualquier toque lo vuelve a activar.
if (typeof window !== 'undefined') {
  const wake = () => {
    if (!ctx) return;
    if (ctx.state !== 'running') void ctx.resume().catch(() => {});
    if (keepAlive) iosPlaybackSession();
  };
  for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) {
    window.addEventListener(ev, wake, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') wake();
    else keepAlive?.pause();
  });
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
  fallbackPlayer?.pause();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function playBuffer(buf: AudioBuffer, my: number): Promise<void> {
  return new Promise((resolve) => {
    const c = audioContext();
    if (!c || my !== token) return resolve();
    let finished = false;
    const end = () => {
      if (finished) return;
      finished = true;
      if (current === src) current = null;
      resolve();
    };
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.onended = end;
    current = src;
    src.start(0);
    // Si el contexto quedó suspendido, "ended" nunca llega: no trabar la secuencia.
    setTimeout(end, buf.duration * 1000 + 600);
  });
}

// Plan B (iPhone con el audio de Web Audio todavía dormido): un <audio> común.
const fallbackPlayer = typeof Audio !== 'undefined' ? new Audio() : null;
fallbackPlayer?.setAttribute('playsinline', '');

function playElement(id: string, my: number): Promise<void> {
  return new Promise((resolve) => {
    if (!fallbackPlayer || my !== token) return resolve();
    const done = () => {
      fallbackPlayer.onended = null;
      fallbackPlayer.onerror = null;
      resolve();
    };
    fallbackPlayer.onended = done;
    fallbackPlayer.onerror = done;
    fallbackPlayer.src = `${BASE}${id}.mp3`;
    fallbackPlayer.play().catch(done);
    setTimeout(done, 10000);
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
    const id = clipId(text);
    if (buf && ctx?.state === 'running') await playBuffer(buf, my);
    else if (buf) await playElement(id, my);
    else await speakTTS(text, my);
  }
}
