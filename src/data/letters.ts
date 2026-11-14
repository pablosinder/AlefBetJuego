export interface Letter {
  char: string;
  /** Nombre de la letra con niqqud */
  name: string;
  /** Transliteración del nombre */
  nameEs: string;
  /** Palabra de ejemplo (con niqqud) que empieza con la letra */
  word: string;
  wordEs: string;
  emoji: string;
  /** Forma final, si existe */
  final?: string;
  /** Letras que se parecen y sirven de distractores */
  similar: string[];
  /** Grupo de escritura, como en las hojas de caligrafía */
  group: 1 | 2 | 3;
}

export const LETTERS: Letter[] = [
  { char: 'א', name: 'אָלֶף', nameEs: 'Álef', word: 'אַרְיֵה', wordEs: 'león', emoji: '🦁', similar: ['ע', 'צ'], group: 1 },
  { char: 'ב', name: 'בֵּית', nameEs: 'Bet', word: 'בָּנָנָה', wordEs: 'banana', emoji: '🍌', similar: ['כ', 'פ'], group: 1 },
  { char: 'ג', name: 'גִּימֶל', nameEs: 'Guímel', word: 'גָּמָל', wordEs: 'camello', emoji: '🐫', similar: ['נ', 'צ'], group: 1 },
  { char: 'ד', name: 'דָּלֶת', nameEs: 'Dálet', word: 'דָּג', wordEs: 'pez', emoji: '🐟', similar: ['ר', 'ך'], group: 1 },
  { char: 'ה', name: 'הֵא', nameEs: 'He', word: 'הִיפּוֹפּוֹטָם', wordEs: 'hipopótamo', emoji: '🦛', similar: ['ח', 'ת'], group: 1 },
  { char: 'ו', name: 'וָו', nameEs: 'Vav', word: 'וֶרֶד', wordEs: 'rosa', emoji: '🌹', similar: ['ז', 'ן', 'י'], group: 1 },
  { char: 'ז', name: 'זַיִן', nameEs: 'Zain', word: 'זֶבְּרָה', wordEs: 'cebra', emoji: '🦓', similar: ['ו', 'ן'], group: 1 },
  { char: 'ח', name: 'חֵית', nameEs: 'Jet', word: 'חָתוּל', wordEs: 'gato', emoji: '🐱', similar: ['ה', 'ת'], group: 1 },
  { char: 'ט', name: 'טֵית', nameEs: 'Tet', word: 'טַוָּס', wordEs: 'pavo real', emoji: '🦚', similar: ['מ', 'ס'], group: 1 },
  { char: 'י', name: 'יוֹד', nameEs: 'Yod', word: 'יָרֵחַ', wordEs: 'luna', emoji: '🌙', similar: ['ו', 'ז'], group: 1 },
  { char: 'כ', name: 'כַּף', nameEs: 'Kaf', word: 'כֶּלֶב', wordEs: 'perro', emoji: '🐶', final: 'ך', similar: ['ב', 'פ'], group: 2 },
  { char: 'ל', name: 'לָמֶד', nameEs: 'Lámed', word: 'לִימוֹן', wordEs: 'limón', emoji: '🍋', similar: ['ק', 'ר'], group: 2 },
  { char: 'מ', name: 'מֵם', nameEs: 'Mem', word: 'מַטְרִיָּה', wordEs: 'paraguas', emoji: '☂️', final: 'ם', similar: ['ט', 'ס'], group: 2 },
  { char: 'נ', name: 'נוּן', nameEs: 'Nun', word: 'נָחָשׁ', wordEs: 'serpiente', emoji: '🐍', final: 'ן', similar: ['ג', 'כ'], group: 2 },
  { char: 'ס', name: 'סָמֶךְ', nameEs: 'Sámej', word: 'סוּס', wordEs: 'caballo', emoji: '🐴', similar: ['ם', 'ט'], group: 2 },
  { char: 'ע', name: 'עַיִן', nameEs: 'Ain', word: 'עֵץ', wordEs: 'árbol', emoji: '🌳', similar: ['צ', 'א'], group: 2 },
  { char: 'פ', name: 'פֵּא', nameEs: 'Pe', word: 'פִּיל', wordEs: 'elefante', emoji: '🐘', final: 'ף', similar: ['כ', 'ב'], group: 2 },
  { char: 'צ', name: 'צָדִי', nameEs: 'Tsadi', word: 'צָב', wordEs: 'tortuga', emoji: '🐢', final: 'ץ', similar: ['ע', 'ג'], group: 2 },
  { char: 'ק', name: 'קוֹף', nameEs: 'Kof', word: 'קוֹף', wordEs: 'mono', emoji: '🐒', similar: ['ה', 'ל'], group: 2 },
  { char: 'ר', name: 'רֵישׁ', nameEs: 'Resh', word: 'רַכֶּבֶת', wordEs: 'tren', emoji: '🚂', similar: ['ד', 'ך'], group: 2 },
  { char: 'ש', name: 'שִׁין', nameEs: 'Shin', word: 'שֶׁמֶשׁ', wordEs: 'sol', emoji: '☀️', similar: ['ע', 'צ'], group: 3 },
  { char: 'ת', name: 'תָּו', nameEs: 'Tav', word: 'תַּפּוּחַ', wordEs: 'manzana', emoji: '🍎', similar: ['ח', 'ה'], group: 3 },
];

export interface FinalLetter {
  char: string;
  regular: string;
  name: string;
  nameEs: string;
  word: string;
  wordEs: string;
  emoji: string;
}

export const FINAL_LETTERS: FinalLetter[] = [
  { char: 'ך', regular: 'כ', name: 'כַּף סוֹפִית', nameEs: 'Kaf final', word: 'מֶלֶךְ', wordEs: 'rey', emoji: '👑' },
  { char: 'ם', regular: 'מ', name: 'מֵם סוֹפִית', nameEs: 'Mem final', word: 'יָם', wordEs: 'mar', emoji: '🌊' },
  { char: 'ן', regular: 'נ', name: 'נוּן סוֹפִית', nameEs: 'Nun final', word: 'בָּלוֹן', wordEs: 'globo', emoji: '🎈' },
  { char: 'ף', regular: 'פ', name: 'פֵּא סוֹפִית', nameEs: 'Pe final', word: 'עוֹף', wordEs: 'pollo', emoji: '🐔' },
  { char: 'ץ', regular: 'צ', name: 'צָדִי סוֹפִית', nameEs: 'Tsadi final', word: 'עֵץ', wordEs: 'árbol', emoji: '🌳' },
];

export const LETTER_BY_CHAR: Record<string, Letter> = Object.fromEntries(
  LETTERS.map((l) => [l.char, l]),
);
