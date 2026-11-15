// Qué sonido tiene una palabra al principio y al final, para los juegos de las hojas
// "צִבְעוּ אִם הַמִּלָּה מַתְחִילָה / מִסְתַּיֶּמֶת בָּעִצּוּר…".
import { WORDS, Word } from '../data/words';
import { LETTERS } from '../data/letters';
import { containsLetter, firstLetter, lettersOf } from './hebrew';

/** Letras que al final de palabra no suenan como consonante (ה muda, א, ע, וֹ, וּ, יִ). */
const SILENT_END = new Set(['ה', 'א', 'ע', 'ו', 'י']);
/** Letras que no sirven para escuchar: muchas veces son mudas o son vocales. */
const NOT_AUDIBLE = new Set(['א', 'ה', 'ו', 'י', 'ע']);

/** Letra con la que termina el sonido de la palabra (o null si termina en vocal). */
export function lastSound(word: string): string | null {
  const ls = lettersOf(word);
  const last = ls[ls.length - 1];
  return last && !SILENT_END.has(last) ? last : null;
}

export function startsWith(word: string, letter: string): boolean {
  return firstLetter(word) === letter;
}

export function endsWith(word: string, letter: string): boolean {
  return lastSound(word) === letter;
}

/** Se oye la letra en algún lugar de la palabra. */
export function hearsLetter(word: string, letter: string): boolean {
  return containsLetter(word, letter);
}

export type Where = 'start' | 'end';

export const test = (where: Where) => (where === 'start' ? startsWith : endsWith);

/** Letras con al menos `min` palabras que empiezan (o terminan) con ellas. */
export function lettersWith(where: Where, min: number, words: Word[] = WORDS): string[] {
  const f = test(where);
  return LETTERS.map((l) => l.char).filter((c) => words.filter((w) => f(w.he, c)).length >= min);
}

/** Letras que se pueden escuchar dentro de la palabra (sin las que suelen ser mudas). */
export const AUDIBLE_LETTERS = LETTERS.map((l) => l.char).filter((c) => !NOT_AUDIBLE.has(c));
