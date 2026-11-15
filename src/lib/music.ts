// Música de fondo del menú: "Hu Elokeinu" en versión instrumental klezmer
// (public/music/hu-elokeinu.mp3). Suena bajita y en bucle solo en el menú, para no tapar
// las voces de los juegos, y al volver al menú sigue desde donde había quedado.
import { sfxOutput } from './sfx';

const KEY = 'alefbet.music';
const SRC = `${import.meta.env.BASE_URL}music/hu-elokeinu.mp3`;
const VOLUME = 0.12; // bajita, debajo de la voz

let enabled = (() => {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
})();
let wanted = false;

let buffer: Promise<AudioBuffer | null> | null = null;
let source: AudioBufferSourceNode | null = null;
let gain: GainNode | null = null;
let startedAt = 0; // ctx.currentTime en que arrancó (descontando el desfase)
let offset = 0; // segundos ya escuchados, para retomar

function load(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (!buffer) {
    buffer = fetch(SRC)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((data) =>
        data ? new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(data, res, rej)) : null,
      )
      .catch(() => null);
  }
  return buffer;
}

async function start() {
  const o = sfxOutput();
  if (!o || source) return;
  const buf = await load(o.ctx);
  // Puede haber cambiado mientras se descargaba.
  if (!buf || !wanted || !enabled || source) return;
  const { ctx } = o;
  gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(VOLUME, ctx.currentTime + 1.5);
  gain.connect(o.node);
  source = ctx.createBufferSource();
  source.buffer = buf;
  source.loop = true;
  source.connect(gain);
  const from = offset % buf.duration;
  source.start(0, from);
  startedAt = ctx.currentTime - from;
}

function stop() {
  const o = sfxOutput();
  const s = source;
  const g = gain;
  source = null;
  gain = null;
  if (!o || !s || !g) return;
  const { ctx } = o;
  offset = ctx.currentTime - startedAt;
  g.gain.cancelScheduledValues(ctx.currentTime);
  g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
  setTimeout(() => {
    try {
      s.stop();
    } catch {
      // ya estaba detenido
    }
    g.disconnect();
  }, 900);
}

function apply() {
  if (wanted && enabled) void start();
  else stop();
}

export const music = {
  isEnabled: () => enabled,
  /** La pantalla actual quiere música (menú) o no (dentro de un juego). */
  want(on: boolean) {
    wanted = on;
    apply();
  },
  /** Botón de música: recuerda la elección. */
  toggle(): boolean {
    enabled = !enabled;
    try {
      localStorage.setItem(KEY, enabled ? '1' : '0');
    } catch {
      // ignorar
    }
    apply();
    return enabled;
  },
};
