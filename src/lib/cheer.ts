// Frases motivadoras al azar, sin repetir la misma dos veces seguidas.
import { SAY } from '../strings';

const last: Record<string, string> = {};

function fresh(key: string, list: string[]): string {
  let x = list[Math.floor(Math.random() * list.length)];
  for (let i = 0; i < 5 && list.length > 1 && x === last[key]; i++) {
    x = list[Math.floor(Math.random() * list.length)];
  }
  last[key] = x;
  return x;
}

export const cheer = {
  praise: () => fresh('praise', SAY.praise),
  encourage: () => fresh('encourage', SAY.encourage),
  streak: () => fresh('streak', SAY.streak),
  finished: () => fresh('finished', SAY.finished),
};

/** Rachas en las que se festeja con una frase especial. */
export const STREAK_AT = new Set([3, 5, 8, 12]);
