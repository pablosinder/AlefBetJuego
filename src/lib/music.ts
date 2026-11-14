// Música de fondo generada en el momento (sin archivos): un arpegio suave y alegre.
// Solo suena en el menú, bajito, para no tapar las voces de los juegos.
import { sfxOutput } from './sfx';

const KEY = 'alefbet.music';
const STEP = 0.3; // una corchea a 100 ppm

// Do – La m – Fa – Sol, un compás (8 corcheas) cada uno.
const CHORDS = [
  [261.63, 329.63, 392.0, 523.25],
  [220.0, 261.63, 329.63, 440.0],
  [174.61, 220.0, 261.63, 349.23],
  [196.0, 246.94, 293.66, 392.0],
];
const PATTERN = [0, 2, 1, 2, 3, 2, 1, 2];

let enabled = (() => {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
})();
let wanted = false;
let timer: number | null = null;
let gain: GainNode | null = null;
let nextTime = 0;
let step = 0;

function voice(ctx: AudioContext, freq: number, t: number, dur: number, vol: number, type: OscillatorType) {
  if (!gain) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(gain);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function schedule() {
  const o = sfxOutput();
  if (!o || !gain || document.hidden) return;
  const { ctx } = o;
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
  while (nextTime < ctx.currentTime + 0.4) {
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
    const i = step % 8;
    if (i === 0) voice(ctx, chord[0] / 2, nextTime, STEP * 7, 0.5, 'sine');
    voice(ctx, chord[PATTERN[i]] * 2, nextTime, STEP * 1.6, 0.22, 'triangle');
    if (i === 4 && Math.floor(step / 8) % 2 === 1) voice(ctx, chord[3] * 4, nextTime, STEP * 3, 0.07, 'sine');
    nextTime += STEP;
    step++;
  }
}

function apply() {
  const should = wanted && enabled;
  if (should && timer === null) {
    const o = sfxOutput();
    if (!o) return;
    gain = o.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, o.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, o.ctx.currentTime + 1.2);
    gain.connect(o.node);
    nextTime = 0;
    timer = window.setInterval(schedule, 100);
  } else if (!should && timer !== null) {
    clearInterval(timer);
    timer = null;
    const o = sfxOutput();
    const g = gain;
    gain = null;
    if (o && g) {
      g.gain.cancelScheduledValues(o.ctx.currentTime);
      g.gain.setTargetAtTime(0.0001, o.ctx.currentTime, 0.12);
      setTimeout(() => g.disconnect(), 900);
    }
  }
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
