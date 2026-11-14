import { LETTERS, FINAL_LETTERS } from './letters';

export interface Word {
  he: string; // con niqqud
  emoji: string;
}

// Banco de palabras con dibujo. Varias vienen de las hojas de trabajo
// (אַרְנָב, נָמֵר, קַרְנַף, סְנָאִי, פִּיל, אֶפְרוֹחַ, לְטָאָה, אַבַּטִּיחַ, כִּסֵּא, זְאֵב...).
const EXTRA_WORDS: Word[] = [
  { he: 'אַרְנָב', emoji: '🐰' },
  { he: 'נָמֵר', emoji: '🐆' },
  { he: 'קַרְנַף', emoji: '🦏' },
  { he: 'סְנָאִי', emoji: '🐿️' },
  { he: 'אֶפְרוֹחַ', emoji: '🐥' },
  { he: 'לְטָאָה', emoji: '🦎' },
  { he: 'אַבַּטִּיחַ', emoji: '🍉' },
  { he: 'כִּסֵּא', emoji: '🪑' },
  { he: 'זְאֵב', emoji: '🐺' },
  { he: 'אֲוִירוֹן', emoji: '✈️' },
  { he: 'אַגָּס', emoji: '🍐' },
  { he: 'אַיָּלָה', emoji: '🦌' },
  { he: 'כַּדּוּר', emoji: '⚽' },
  { he: 'בַּיִת', emoji: '🏠' },
  { he: 'גְּלִידָה', emoji: '🍦' },
  { he: 'דְּבוֹרָה', emoji: '🐝' },
  { he: 'פַּרְפַּר', emoji: '🦋' },
  { he: 'תַּרְנְגוֹל', emoji: '🐓' },
  { he: 'עַכְבָּר', emoji: '🐭' },
  { he: 'שׁוּעָל', emoji: '🦊' },
  { he: 'דֹּב', emoji: '🐻' },
  { he: 'יַנְשׁוּף', emoji: '🦉' },
  { he: 'צְפַרְדֵּעַ', emoji: '🐸' },
  { he: 'מְכוֹנִית', emoji: '🚗' },
  { he: 'אוֹפַנַּיִם', emoji: '🚲' },
  { he: 'אוֹטוֹבּוּס', emoji: '🚌' },
  { he: 'פֶּרַח', emoji: '🌸' },
  { he: 'עוּגָה', emoji: '🎂' },
  { he: 'תּוּת', emoji: '🍓' },
  { he: 'עֲנָבִים', emoji: '🍇' },
  { he: 'גֶּזֶר', emoji: '🥕' },
  { he: 'תִּירָס', emoji: '🌽' },
  { he: 'לֶחֶם', emoji: '🍞' },
  { he: 'חָלָב', emoji: '🥛' },
  { he: 'בֵּיצָה', emoji: '🥚' },
  { he: 'כּוֹכָב', emoji: '⭐' },
  { he: 'עָנָן', emoji: '☁️' },
  { he: 'מַפְתֵּחַ', emoji: '🔑' },
  { he: 'סֵפֶר', emoji: '📖' },
  { he: 'שָׁעוֹן', emoji: '⏰' },
  { he: 'כּוֹבַע', emoji: '🎩' },
  { he: 'נַעַל', emoji: '👟' },
  { he: 'פָּרָה', emoji: '🐄' },
  { he: 'כִּבְשָׂה', emoji: '🐑' },
  { he: 'חֲזִיר', emoji: '🐷' },
  { he: 'סַבְתָּא', emoji: '👵' },
  { he: 'אִמָּא', emoji: '👩' },
  { he: 'אַבָּא', emoji: '👨' },
  { he: 'אִישׁ', emoji: '🧔' },
  { he: 'אֹזֶן', emoji: '👂' },
  { he: 'אֶצְבַּע', emoji: '☝️' },
  { he: 'עִפָּרוֹן', emoji: '✏️' },
  { he: 'עוּגִיָּה', emoji: '🍪' },
  { he: 'אֵשׁ', emoji: '🔥' },
  { he: 'אוֹר', emoji: '💡' },
  { he: 'בּוּבָּה', emoji: '🪆' },
  { he: 'דֻּבִּי', emoji: '🧸' },
  { he: 'סֻכָּרִיָּה', emoji: '🍬' },
  { he: 'מִשְׁקָפַיִם', emoji: '👓' },
  { he: 'מִטָּה', emoji: '🛏️' },
  { he: 'חֶדֶר', emoji: '🚪' },
  { he: 'גִּיטָרָה', emoji: '🎸' },
  { he: 'תֹּף', emoji: '🥁' },
];

const LETTER_WORDS: Word[] = [
  ...LETTERS.map((l) => ({ he: l.word, emoji: l.emoji })),
  ...FINAL_LETTERS.map((l) => ({ he: l.word, emoji: l.emoji })),
];

// Sin duplicados (por palabra hebrea).
export const WORDS: Word[] = [...LETTER_WORDS, ...EXTRA_WORDS].filter(
  (w, i, all) => all.findIndex((x) => x.he === w.he) === i,
);
