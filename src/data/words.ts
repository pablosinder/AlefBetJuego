import { LETTERS, FINAL_LETTERS } from './letters';

export interface Word {
  he: string; // con niqqud
  es: string;
  emoji: string;
}

// Banco de palabras con dibujo. Varias vienen de las hojas de trabajo
// (אַרְנָב, נָמֵר, קַרְנַף, סְנָאִי, פִּיל, אֶפְרוֹחַ, לְטָאָה, אַבַּטִּיחַ, כִּסֵּא, זְאֵב...).
const EXTRA_WORDS: Word[] = [
  { he: 'אַרְנָב', es: 'conejo', emoji: '🐰' },
  { he: 'נָמֵר', es: 'leopardo', emoji: '🐆' },
  { he: 'קַרְנַף', es: 'rinoceronte', emoji: '🦏' },
  { he: 'סְנָאִי', es: 'ardilla', emoji: '🐿️' },
  { he: 'אֶפְרוֹחַ', es: 'pollito', emoji: '🐥' },
  { he: 'לְטָאָה', es: 'lagartija', emoji: '🦎' },
  { he: 'אַבַּטִּיחַ', es: 'sandía', emoji: '🍉' },
  { he: 'כִּסֵּא', es: 'silla', emoji: '🪑' },
  { he: 'זְאֵב', es: 'lobo', emoji: '🐺' },
  { he: 'אֲוִירוֹן', es: 'avión', emoji: '✈️' },
  { he: 'אַגָּס', es: 'pera', emoji: '🍐' },
  { he: 'אַיָּלָה', es: 'cierva', emoji: '🦌' },
  { he: 'כַּדּוּר', es: 'pelota', emoji: '⚽' },
  { he: 'בַּיִת', es: 'casa', emoji: '🏠' },
  { he: 'גְּלִידָה', es: 'helado', emoji: '🍦' },
  { he: 'דְּבוֹרָה', es: 'abeja', emoji: '🐝' },
  { he: 'פַּרְפַּר', es: 'mariposa', emoji: '🦋' },
  { he: 'תַּרְנְגוֹל', es: 'gallo', emoji: '🐓' },
  { he: 'עַכְבָּר', es: 'ratón', emoji: '🐭' },
  { he: 'שׁוּעָל', es: 'zorro', emoji: '🦊' },
  { he: 'דֹּב', es: 'oso', emoji: '🐻' },
  { he: 'יַנְשׁוּף', es: 'búho', emoji: '🦉' },
  { he: 'צְפַרְדֵּעַ', es: 'rana', emoji: '🐸' },
  { he: 'מְכוֹנִית', es: 'auto', emoji: '🚗' },
  { he: 'אוֹפַנַּיִם', es: 'bicicleta', emoji: '🚲' },
  { he: 'אוֹטוֹבּוּס', es: 'autobús', emoji: '🚌' },
  { he: 'פֶּרַח', es: 'flor', emoji: '🌸' },
  { he: 'עוּגָה', es: 'torta', emoji: '🎂' },
  { he: 'תּוּת', es: 'frutilla', emoji: '🍓' },
  { he: 'עֲנָבִים', es: 'uvas', emoji: '🍇' },
  { he: 'גֶּזֶר', es: 'zanahoria', emoji: '🥕' },
  { he: 'תִּירָס', es: 'choclo', emoji: '🌽' },
  { he: 'לֶחֶם', es: 'pan', emoji: '🍞' },
  { he: 'חָלָב', es: 'leche', emoji: '🥛' },
  { he: 'בֵּיצָה', es: 'huevo', emoji: '🥚' },
  { he: 'כּוֹכָב', es: 'estrella', emoji: '⭐' },
  { he: 'עָנָן', es: 'nube', emoji: '☁️' },
  { he: 'מַפְתֵּחַ', es: 'llave', emoji: '🔑' },
  { he: 'סֵפֶר', es: 'libro', emoji: '📖' },
  { he: 'שָׁעוֹן', es: 'reloj', emoji: '⏰' },
  { he: 'כּוֹבַע', es: 'sombrero', emoji: '🎩' },
  { he: 'נַעַל', es: 'zapato', emoji: '👟' },
  { he: 'פָּרָה', es: 'vaca', emoji: '🐄' },
  { he: 'כִּבְשָׂה', es: 'oveja', emoji: '🐑' },
  { he: 'חֲזִיר', es: 'cerdo', emoji: '🐷' },
  { he: 'סַבְתָּא', es: 'abuela', emoji: '👵' },
  { he: 'אִמָּא', es: 'mamá', emoji: '👩' },
  { he: 'אַבָּא', es: 'papá', emoji: '👨' },
  { he: 'אִישׁ', es: 'hombre', emoji: '🧔' },
  { he: 'אֹזֶן', es: 'oreja', emoji: '👂' },
  { he: 'אֶצְבַּע', es: 'dedo', emoji: '☝️' },
  { he: 'עִפָּרוֹן', es: 'lápiz', emoji: '✏️' },
  { he: 'עוּגִיָּה', es: 'galleta', emoji: '🍪' },
  { he: 'אֵשׁ', es: 'fuego', emoji: '🔥' },
  { he: 'אוֹר', es: 'luz', emoji: '💡' },
  { he: 'בּוּבָּה', es: 'muñeca', emoji: '🪆' },
  { he: 'דֻּבִּי', es: 'osito', emoji: '🧸' },
  { he: 'סֻכָּרִיָּה', es: 'caramelo', emoji: '🍬' },
  { he: 'מִשְׁקָפַיִם', es: 'anteojos', emoji: '👓' },
  { he: 'מִטָּה', es: 'cama', emoji: '🛏️' },
  { he: 'חֶדֶר', es: 'cuarto', emoji: '🚪' },
  { he: 'גִּיטָרָה', es: 'guitarra', emoji: '🎸' },
  { he: 'תֹּף', es: 'tambor', emoji: '🥁' },
];

const LETTER_WORDS: Word[] = [
  ...LETTERS.map((l) => ({ he: l.word, es: l.wordEs, emoji: l.emoji })),
  ...FINAL_LETTERS.map((l) => ({ he: l.word, es: l.wordEs, emoji: l.emoji })),
];

// Sin duplicados (por palabra hebrea).
export const WORDS: Word[] = [...LETTER_WORDS, ...EXTRA_WORDS].filter(
  (w, i, all) => all.findIndex((x) => x.he === w.he) === i,
);
