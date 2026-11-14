export interface Letter {
  char: string;
  /** Nombre de la letra con niqqud */
  name: string;
  /** Palabra de ejemplo (con niqqud) que empieza con la letra */
  word: string;
  emoji: string;
  /** Forma final, si existe */
  final?: string;
  /** Letras que se parecen y sirven de distractores */
  similar: string[];
  /** Grupo de escritura, como en las hojas de caligrafía */
  group: 1 | 2 | 3;
}

export const LETTERS: Letter[] = [
  { char: 'א', name: 'אָלֶף', word: 'אַרְיֵה', emoji: '🦁', similar: ['ע', 'צ'], group: 1 },
  { char: 'ב', name: 'בֵּית', word: 'בָּנָנָה', emoji: '🍌', similar: ['כ', 'פ'], group: 1 },
  { char: 'ג', name: 'גִּימֶל', word: 'גָּמָל', emoji: '🐫', similar: ['נ', 'צ'], group: 1 },
  { char: 'ד', name: 'דָּלֶת', word: 'דָּג', emoji: '🐟', similar: ['ר', 'ך'], group: 1 },
  { char: 'ה', name: 'הֵא', word: 'הִיפּוֹפּוֹטָם', emoji: '🦛', similar: ['ח', 'ת'], group: 1 },
  { char: 'ו', name: 'וָו', word: 'וֶרֶד', emoji: '🌹', similar: ['ז', 'ן', 'י'], group: 1 },
  { char: 'ז', name: 'זַיִן', word: 'זֶבְּרָה', emoji: '🦓', similar: ['ו', 'ן'], group: 1 },
  { char: 'ח', name: 'חֵית', word: 'חָתוּל', emoji: '🐱', similar: ['ה', 'ת'], group: 1 },
  { char: 'ט', name: 'טֵית', word: 'טַוָּס', emoji: '🦚', similar: ['מ', 'ס'], group: 1 },
  { char: 'י', name: 'יוֹד', word: 'יָרֵחַ', emoji: '🌙', similar: ['ו', 'ז'], group: 1 },
  { char: 'כ', name: 'כַּף', word: 'כֶּלֶב', emoji: '🐶', final: 'ך', similar: ['ב', 'פ'], group: 2 },
  { char: 'ל', name: 'לָמֶד', word: 'לִימוֹן', emoji: '🍋', similar: ['ק', 'ר'], group: 2 },
  { char: 'מ', name: 'מֵם', word: 'מַטְרִיָּה', emoji: '☂️', final: 'ם', similar: ['ט', 'ס'], group: 2 },
  { char: 'נ', name: 'נוּן', word: 'נָחָשׁ', emoji: '🐍', final: 'ן', similar: ['ג', 'כ'], group: 2 },
  { char: 'ס', name: 'סָמֶךְ', word: 'סוּס', emoji: '🐴', similar: ['ם', 'ט'], group: 2 },
  { char: 'ע', name: 'עַיִן', word: 'עֵץ', emoji: '🌳', similar: ['צ', 'א'], group: 2 },
  { char: 'פ', name: 'פֵּא', word: 'פִּיל', emoji: '🐘', final: 'ף', similar: ['כ', 'ב'], group: 2 },
  { char: 'צ', name: 'צָדִי', word: 'צָב', emoji: '🐢', final: 'ץ', similar: ['ע', 'ג'], group: 2 },
  { char: 'ק', name: 'קוֹף', word: 'קוֹף', emoji: '🐒', similar: ['ה', 'ל'], group: 2 },
  { char: 'ר', name: 'רֵישׁ', word: 'רַכֶּבֶת', emoji: '🚂', similar: ['ד', 'ך'], group: 2 },
  { char: 'ש', name: 'שִׁין', word: 'שֶׁמֶשׁ', emoji: '☀️', similar: ['ע', 'צ'], group: 3 },
  { char: 'ת', name: 'תָּו', word: 'תַּפּוּחַ', emoji: '🍎', similar: ['ח', 'ה'], group: 3 },
];

export interface FinalLetter {
  char: string;
  regular: string;
  name: string;
  word: string;
  emoji: string;
}

export const FINAL_LETTERS: FinalLetter[] = [
  { char: 'ך', regular: 'כ', name: 'כַּף סוֹפִית', word: 'מֶלֶךְ', emoji: '👑' },
  { char: 'ם', regular: 'מ', name: 'מֵם סוֹפִית', word: 'יָם', emoji: '🌊' },
  { char: 'ן', regular: 'נ', name: 'נוּן סוֹפִית', word: 'בָּלוֹן', emoji: '🎈' },
  { char: 'ף', regular: 'פ', name: 'פֵּא סוֹפִית', word: 'עוֹף', emoji: '🐔' },
  { char: 'ץ', regular: 'צ', name: 'צָדִי סוֹפִית', word: 'עֵץ', emoji: '🌳' },
];

export const LETTER_BY_CHAR: Record<string, Letter> = Object.fromEntries(
  LETTERS.map((l) => [l.char, l]),
);
