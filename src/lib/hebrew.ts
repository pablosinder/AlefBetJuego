// Utilidades para texto hebreo: niqqud, letras finales y vocales.

const NIQQUD_RE = /[֑-ׇ]/g;

/** Quita niqqud y te'amim, dejando solo las letras. */
export function stripNiqqud(text: string): string {
  return text.replace(NIQQUD_RE, '');
}

export const FINAL_TO_REGULAR: Record<string, string> = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ',
};

export const REGULAR_TO_FINAL: Record<string, string> = Object.fromEntries(
  Object.entries(FINAL_TO_REGULAR).map(([f, r]) => [r, f]),
);

/** Convierte letras finales en su forma normal (ך → כ). */
export function normalizeFinals(text: string): string {
  return text.replace(/[ךםןףץ]/g, (c) => FINAL_TO_REGULAR[c]);
}

/** Letras (sin niqqud) de una palabra, con las finales normalizadas. */
export function lettersOf(word: string): string[] {
  return [...normalizeFinals(stripNiqqud(word))].filter((c) => /[א-ת]/.test(c));
}

export function firstLetter(word: string): string {
  return lettersOf(word)[0] ?? '';
}

export function containsLetter(word: string, letter: string): boolean {
  const target = normalizeFinals(letter);
  return lettersOf(word).includes(target);
}

export type Vowel = 'a' | 'e' | 'i' | 'o' | 'u';

/** Vocal de la primera sílaba, según el niqqud de la primera letra. */
export function firstVowel(word: string): Vowel | null {
  const chars = [...word];
  let i = 0;
  while (i < chars.length && !/[א-ת]/.test(chars[i])) i++;
  if (i >= chars.length) return null;
  i++;
  const marks: string[] = [];
  while (i < chars.length && /[֑-ׇ]/.test(chars[i])) marks.push(chars[i++]);
  const has = (...cs: string[]) => marks.some((m) => cs.includes(m));

  if (has('ָ', 'ַ', 'ֲ', 'ֳ')) return 'a'; // קמץ, פתח, חטף פתח, חטף קמץ
  if (has('ֶ', 'ֵ', 'ֱ')) return 'e'; // סגול, צירה, חטף סגול
  if (has('ִ')) return 'i'; // חיריק
  if (has('ֹ', 'ֺ')) return 'o'; // חולם
  if (has('ֻ')) return 'u'; // קובוץ

  // חולם מלא (וֹ) או שורוק (וּ) en la letra siguiente
  const next = chars[i];
  const nextMark = chars[i + 1];
  if (next === 'ו' && (nextMark === 'ֹ' || nextMark === 'ֺ')) return 'o';
  if (next === 'ו' && nextMark === 'ּ') return 'u';
  return null;
}

export const VOWELS: { id: Vowel; sample: string; sound: string; name: string }[] = [
  { id: 'a', sample: 'אַ', sound: 'אַ', name: 'קָמָץ / פַּתָּח' },
  { id: 'e', sample: 'אֶ', sound: 'אֶה', name: 'סֶגּוֹל / צֵירֵה' },
  { id: 'i', sample: 'אִ', sound: 'אִי', name: 'חִירִיק' },
  { id: 'o', sample: 'אוֹ', sound: 'אוֹ', name: 'חוֹלָם' },
  { id: 'u', sample: 'אוּ', sound: 'אוּ', name: 'שׁוּרוּק / קֻבּוּץ' },
];

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Largo (en caracteres UTF-16) de la primera letra con su niqqud. */
export function firstClusterLength(word: string): number {
  let i = 1;
  while (i < word.length && /[\u0591-\u05C7]/.test(word[i])) i++;
  return i;
}

/** Divide una palabra en "grupos": cada letra con su niqqud. */
export function clusters(word: string): string[] {
  const out: string[] = [];
  for (const ch of word) {
    if (/[֑-ׇ]/.test(ch) && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

const VOWEL_MARK = /[ֱ-ׇֻ]/; // cualquier vocal salvo shva
const DAGESH = 'ּ';

/** El grupo tiene una vocal audible (no shva ni letra muda). */
export function hasVowel(cluster: string): boolean {
  return VOWEL_MARK.test(cluster);
}

/** Pone otra letra con la misma vocal: (בַּ, ג) → גַּ / (בַּ, ל) → לַ */
export function swapLetter(cluster: string, letter: string): string {
  const marks = [...cluster.slice(1)].filter((c) => c !== DAGESH && c !== 'ׁ' && c !== 'ׂ');
  const dagesh = cluster.includes(DAGESH) && 'בכפ'.includes(letter) ? DAGESH : '';
  const shin = letter === 'ש' ? 'ׁ' : '';
  return letter + shin + dagesh + marks.join('');
}
