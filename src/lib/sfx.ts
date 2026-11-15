// Efectos de sonido sintetizados con Web Audio (sin archivos).
// Todos pasan por un compresor para que suenen parejos y no saturen sobre las voces.

import { audioContext } from './audio';

let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function out(c: AudioContext): AudioNode {
  if (!master) {
    const comp = c.createDynamicsCompressor();
    master = c.createGain();
    master.gain.value = 0.85;
    master.connect(comp).connect(c.destination);
  }
  return master;
}

/** Salida compartida para la música de fondo. */
export function sfxOutput(): { ctx: AudioContext; node: AudioNode } | null {
  const c = audioContext();
  return c ? { ctx: c, node: out(c) } : null;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.2,
  slideTo?: number,
) {
  const c = audioContext();
  if (!c) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(out(c));
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Campanita: fundamental + armónicos suaves. */
function bell(freq: number, start: number, dur = 0.5, vol = 0.16) {
  tone(freq, start, dur, 'sine', vol);
  tone(freq * 2, start, dur * 0.7, 'sine', vol * 0.35);
  tone(freq * 3, start, dur * 0.4, 'sine', vol * 0.15);
}

/** Ruido filtrado con barrido (soplidos, brillos, golpes). */
function noise(start: number, dur: number, vol: number, from: number, to: number, q = 1.2) {
  const c = audioContext();
  if (!c) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + start;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(out(c));
  src.start(t);
  src.stop(t + dur + 0.05);
}

// Escala pentatónica mayor desde Do5: cada acierto seguido sube un escalón.
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const note = (i: number) => 523.25 * Math.pow(2, PENTA[Math.max(0, Math.min(PENTA.length - 1, i))] / 12);

export const sfx = {
  /** Acierto. `combo` (1, 2, 3…) sube el tono como en los juegos de combinar. */
  correct(combo = 1) {
    const n = note(combo - 1);
    tone(n, 0, 0.13, 'triangle', 0.2);
    tone(n * 1.25, 0.07, 0.15, 'triangle', 0.2);
    tone(n * 1.5, 0.14, 0.32, 'triangle', 0.2);
    tone(n * 3, 0.14, 0.4, 'sine', 0.05);
    noise(0.1, 0.25, 0.03, 5000, 9000, 3);
  },
  /** Error: un "boing" suave hacia abajo, nada que asuste. */
  wrong() {
    tone(330, 0, 0.22, 'sine', 0.16, 170);
    tone(247, 0.13, 0.26, 'triangle', 0.1, 130);
  },
  /** Toque de botón. */
  tap() {
    tone(480, 0, 0.07, 'sine', 0.07, 900);
  },
  /** Cada cosita juntada dentro de una misma ronda (sube de tono). */
  collect(step = 0) {
    const n = note(step);
    tone(n, 0, 0.12, 'triangle', 0.16);
    tone(n * 2, 0.03, 0.14, 'sine', 0.06);
  },
  /** Fin de juego. */
  win() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle', 0.17));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, 0.55, 0.9, 'triangle', 0.09));
    noise(0.5, 0.9, 0.035, 6000, 11000, 2);
  },
  /** Estrella ganada (0, 1, 2). */
  star(i: number) {
    bell([783.99, 987.77, 1174.66][Math.min(2, i)], 0, 0.6, 0.18);
    noise(0, 0.2, 0.025, 7000, 10000, 3);
  },
  /** Gema que llega al contador. */
  gem() {
    tone(1318.5, 0, 0.06, 'square', 0.035);
    tone(1760, 0.05, 0.1, 'square', 0.035);
  },
  whoosh() {
    noise(0, 0.28, 0.07, 400, 3200);
  },
  /** Racha: barrido hacia arriba con brillo. */
  comboUp() {
    tone(392, 0, 0.3, 'triangle', 0.12, 1568);
    bell(1568, 0.26, 0.5, 0.1);
    noise(0.05, 0.4, 0.04, 2000, 9000, 2);
  },
  giftShake() {
    noise(0, 0.12, 0.08, 300, 180, 0.8);
    tone(196, 0, 0.1, 'sine', 0.12);
  },
  giftOpen() {
    noise(0, 0.35, 0.08, 500, 6000);
    [0, 2, 4, 5, 7, 9, 11, 12].forEach((s, i) =>
      tone(523.25 * Math.pow(2, s / 12), 0.05 + i * 0.045, 0.14, 'triangle', 0.13),
    );
    [1046.5, 1318.5, 1568].forEach((f) => bell(f, 0.45, 0.9, 0.09));
  },
  levelUp() {
    [392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle', 0.17));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, 0.42, 1.1, 'triangle', 0.1));
    bell(2093, 0.42, 1, 0.07);
    noise(0.4, 1, 0.04, 5000, 11000, 2);
  },
};
