// Datos sacados de las hojas de trabajo de כיתה א (hojas 1–51):
// palabras divididas en sílabas, parejas זָכָר / נְקֵבָה, colores para pintar
// y cómo se forma cada letra.

export interface SylWord {
  syl: string[]; // sílabas con niqqud; unidas forman la palabra
  emoji: string;
}

/** Palabras divididas en sílabas (הֲבָרוֹת), de derecha a izquierda. */
export const SYL_WORDS: SylWord[] = [
  { syl: ['בָּ', 'נָ', 'נָה'], emoji: '🍌' },
  { syl: ['סַ', 'בָּא'], emoji: '👴' },
  { syl: ['כֶּ', 'לֶב'], emoji: '🐶' },
  { syl: ['דֻּ', 'בִּי'], emoji: '🧸' },
  { syl: ['בֵּי', 'צָה'], emoji: '🥚' },
  { syl: ['אַרְ', 'נָב'], emoji: '🐰' },
  { syl: ['עַכְ', 'בָּר'], emoji: '🐭' },
  { syl: ['גָּ', 'מָל'], emoji: '🐫' },
  { syl: ['עוּ', 'גָה'], emoji: '🎂' },
  { syl: ['גִּי', 'טָ', 'רָה'], emoji: '🎸' },
  { syl: ['גֶּ', 'זֶר'], emoji: '🥕' },
  { syl: ['דּוֹלְ', 'פִין'], emoji: '🐬' },
  { syl: ['הִי', 'פּוֹ', 'פּוֹ', 'טָם'], emoji: '🦛' },
  { syl: ['מַ', 'תָּ', 'נָה'], emoji: '🎁' },
  { syl: ['וֶ', 'רֶד'], emoji: '🌹' },
  { syl: ['זַ', 'יִת'], emoji: '🫒' },
  { syl: ['זַ', 'חַל'], emoji: '🐛' },
  { syl: ['זֶבְּ', 'רָה'], emoji: '🦓' },
  { syl: ['חָ', 'תוּל'], emoji: '🐱' },
  { syl: ['חֲ', 'מוֹר'], emoji: '🫏' },
  { syl: ['לֶ', 'חֶם'], emoji: '🍞' },
  { syl: ['חַ', 'סָּה'], emoji: '🥬' },
  { syl: ['חַ', 'לּוֹן'], emoji: '🪟' },
  { syl: ['טֶ', 'לֶ', 'פוֹן'], emoji: '☎️' },
  { syl: ['טַ', 'וָּס'], emoji: '🦚' },
  { syl: ['טַ', 'בַּ', 'עַת'], emoji: '💍' },
  { syl: ['יַנְ', 'שׁוּף'], emoji: '🦉' },
  { syl: ['יָ', 'רֵחַ'], emoji: '🌙' },
  { syl: ['יַלְ', 'דָּה'], emoji: '👧' },
  { syl: ['כַּ', 'דּוּר'], emoji: '⚽' },
  { syl: ['כּוֹ', 'כָב'], emoji: '⭐' },
  { syl: ['כִּ', 'נּוֹר'], emoji: '🎻' },
  { syl: ['כַּ', 'פָּ', 'פָה'], emoji: '🧤' },
  { syl: ['לִי', 'מוֹן'], emoji: '🍋' },
  { syl: ['מַ', 'סּוֹק'], emoji: '🚁' },
  { syl: ['נָ', 'חָשׁ'], emoji: '🐍' },
  { syl: ['תַּ', 'פּוּז'], emoji: '🍊' },
  { syl: ['תַּ', 'פּוּחַ'], emoji: '🍎' },
  { syl: ['אֲ', 'נָ', 'נָס'], emoji: '🍍' },
  { syl: ['פִּי', 'צָה'], emoji: '🍕' },
  { syl: ['פַּרְ', 'פַּר'], emoji: '🦋' },
  { syl: ['גַּרְ', 'בַּ', 'יִם'], emoji: '🧦' },
  { syl: ['תַּ', 'נִּין'], emoji: '🐊' },
  { syl: ['קִ', 'פּוֹד'], emoji: '🦔' },
  { syl: ['דֶּ', 'לֶת'], emoji: '🚪' },
  { syl: ['שָׁ', 'עוֹן'], emoji: '⏰' },
  { syl: ['סֻ', 'לָּם'], emoji: '🪜' },
  { syl: ['עָ', 'נָן'], emoji: '☁️' },
  { syl: ['מַ', 'גָּף'], emoji: '🥾' },
  { syl: ['פַּ', 'טִּישׁ'], emoji: '🔨' },
  { syl: ['רַ', 'כֶּ', 'בֶת'], emoji: '🚂' },
  { syl: ['בַּ', 'יִת'], emoji: '🏠' },
  { syl: ['עֲ', 'נָ', 'בִים'], emoji: '🍇' },
  { syl: ['תִּי', 'רָס'], emoji: '🌽' },
  { syl: ['חָ', 'לָב'], emoji: '🥛' },
  { syl: ['סֵ', 'פֶר'], emoji: '📖' },
  { syl: ['מַפְ', 'תֵּחַ'], emoji: '🔑' },
  { syl: ['כּוֹ', 'בַע'], emoji: '🎩' },
  { syl: ['נַ', 'עַל'], emoji: '👟' },
  { syl: ['פָּ', 'רָה'], emoji: '🐄' },
  { syl: ['סֻ', 'כָּ', 'רִ', 'יָּה'], emoji: '🍬' },
  { syl: ['מִ', 'טָּה'], emoji: '🛏️' },
  { syl: ['שֶׁ', 'מֶשׁ'], emoji: '☀️' },
  { syl: ['אַרְ', 'יֵה'], emoji: '🦁' },
];

export const sylWord = (w: SylWord) => w.syl.join('');

/** Todas las sílabas distintas (para grabarlas). */
export const ALL_SYLLABLES: string[] = [...new Set(SYL_WORDS.flatMap((w) => w.syl))];

export interface GenderPair {
  male: string;
  female: string;
  emoji: string;
}

/** Hoja 25: "ה בְּסוֹף מִלָּה מְצַיֶּנֶת מִין נְקֵבָה". */
export const GENDER_PAIRS: GenderPair[] = [
  { male: 'סוּס', female: 'סוּסָה', emoji: '🐴' },
  { male: 'פָּר', female: 'פָּרָה', emoji: '🐄' },
  { male: 'כֶּלֶב', female: 'כַּלְבָּה', emoji: '🐶' },
  { male: 'חָתוּל', female: 'חֲתוּלָה', emoji: '🐱' },
  { male: 'אַיִל', female: 'אַיָּלָה', emoji: '🦌' },
  { male: 'עֵגֶל', female: 'עֶגְלָה', emoji: '🐮' },
  { male: 'נָמֵר', female: 'נְמֵרָה', emoji: '🐆' },
  { male: 'חֲזִיר', female: 'חֲזִירָה', emoji: '🐷' },
  { male: 'אַוָּז', female: 'אַוָּזָה', emoji: '🪿' },
  { male: 'בַּרְוָז', female: 'בַּרְוָזָה', emoji: '🦆' },
  { male: 'זְאֵב', female: 'זְאֵבָה', emoji: '🐺' },
  { male: 'דֹּב', female: 'דֻּבָּה', emoji: '🐻' },
  { male: 'קוֹף', female: 'קוֹפָה', emoji: '🐒' },
  { male: 'יֶלֶד', female: 'יַלְדָּה', emoji: '🧒' },
  { male: 'מֶלֶךְ', female: 'מַלְכָּה', emoji: '👑' },
];

export interface PaintColor {
  name: string; // nombre en hebreo (se dice en voz alta)
  hex: string;
}

/** Colores de los crayones de las hojas ("צִבְעוּ לְפִי הַהוֹרָאוֹת"). */
export const COLORS: Record<string, PaintColor> = {
  yellow: { name: 'צָהֹב', hex: '#ffd23f' },
  blue: { name: 'כָּחֹל', hex: '#3b6fe0' },
  lightblue: { name: 'תְּכֵלֶת', hex: '#7fd3f7' },
  green: { name: 'יָרֹק', hex: '#3fbf6a' },
  red: { name: 'אָדֹם', hex: '#ef4444' },
  pink: { name: 'וָרֹד', hex: '#ff8fc7' },
  orange: { name: 'כָּתֹם', hex: '#ff9a3d' },
  brown: { name: 'חוּם', hex: '#9a6233' },
  purple: { name: 'סָגֹל', hex: '#9b6bff' },
  black: { name: 'שָׁחֹר', hex: '#2f2f3a' },
  gray: { name: 'אָפֹר', hex: '#a3a3ad' },
};

/** Cómo se forma cada letra (inspirado en los recuadros "לוֹמְדִים" de las hojas). */
export const LETTER_SHAPES: Record<string, string> = {
  'א': 'רֹאשׁ מִיָּמִין, קַו בַּאֲלַכְסוֹן, וְרֶגֶל מִשְּׂמֹאל.',
  'ב': 'גַּג, קִיר מִיָּמִין, וְרִצְפָּה עִם עָקֵב קָטָן.',
  'ג': 'קַו אָרֹךְ מִלְמַעְלָה לְמַטָּה, וְרֶגֶל קְטַנָּה לְצַד שְׂמֹאל.',
  'ד': 'גַּג רָחָב, וְרֶגֶל אֲרֻכָּה בְּצַד יָמִין.',
  'ה': 'כְּמוֹ דָּלֶת, וְרֶגֶל קְטַנָּה בְּצַד שְׂמֹאל שֶׁלֹּא נוֹגַעַת בַּגַּג.',
  'ו': 'קַו יָשָׁר וְאָרֹךְ, עִם רֹאשׁ קָטָן לְמַעְלָה.',
  'ז': 'קַו יָשָׁר, וְעָלָיו כּוֹבַע קָטָן.',
  'ח': 'גַּג, וּשְׁתֵּי רַגְלַיִם אֲרֻכּוֹת.',
  'ט': 'עֲגֻלָּה מִלְּמַטָּה, וּפְתוּחָה לְמַעְלָה.',
  'י': 'הָאוֹת הַקְּטַנָּה בְּיוֹתֵר, כְּמוֹ נְקֻדָּה עִם זָנָב.',
  'כ': 'כְּמוֹ חֲצִי עִגּוּל, פְּתוּחָה לְצַד שְׂמֹאל.',
  'ל': 'רֹאשׁ שֶׁעוֹלֶה לְמַעְלָה, מֵעַל כׇּל הָאוֹתִיּוֹת.',
  'מ': 'אַף קָטָן לְמַעְלָה, וּפְתוּחָה קְצָת לְמַטָּה.',
  'נ': 'צָרָה, עִם רִצְפָּה קְטַנָּה.',
  'ס': 'עִגּוּל סָגוּר, עִם פִּנָּה קְטַנָּה לְמַעְלָה.',
  'ע': 'שְׁתֵּי זְרוֹעוֹת לְמַעְלָה, וְזָנָב לְמַטָּה.',
  'פ': 'כְּמוֹ כַּף, עִם לָשׁוֹן קְטַנָּה בִּפְנִים.',
  'צ': 'זְרוֹעַ קְטַנָּה מִיָּמִין, קַו בַּאֲלַכְסוֹן, וְרִצְפָּה.',
  'ק': 'גַּג, וְרֶגֶל אֲרֻכָּה שֶׁיּוֹרֶדֶת מִתַּחַת לַשּׁוּרָה.',
  'ר': 'כְּמוֹ דָּלֶת, אֲבָל בְּלִי פִּנָּה: הַגַּג עָגֹל.',
  'ש': 'שָׁלוֹשׁ זְרוֹעוֹת לְמַעְלָה, וְרִצְפָּה לְמַטָּה.',
  'ת': 'כְּמוֹ חֵית, עִם רֶגֶל קְטַנָּה שֶׁבּוֹעֶטֶת שְׂמֹאלָה.',
  'ך': 'כְּמוֹ רֵישׁ, אֲבָל הָרֶגֶל יוֹרֶדֶת מִתַּחַת לַשּׁוּרָה.',
  'ם': 'סְגוּרָה מִכׇּל הַצְּדָדִים, כְּמוֹ קֻפְסָה.',
  'ן': 'קַו אָרֹךְ שֶׁיּוֹרֵד מִתַּחַת לַשּׁוּרָה.',
  'ף': 'כְּמוֹ פֵּא, וְהָרֶגֶל יוֹרֶדֶת מִתַּחַת לַשּׁוּרָה.',
  'ץ': 'כְּמוֹ צָדִי, וְהָרֶגֶל יוֹרֶדֶת מִתַּחַת לַשּׁוּרָה.',
};

/** Letra con dagesh o sin él (hojas 5 y 37: "הַקִּיפוּ כׇּל אוֹת בֵּית דְּגוּשָׁה"). */
export const DAGESH_PAIRS: { with: string; without: string; withName: string; withoutName: string }[] = [
  { with: 'בּ', without: 'ב', withName: 'בֵּית דְּגוּשָׁה', withoutName: 'בֵית רָפָה' },
  { with: 'כּ', without: 'כ', withName: 'כַּף דְּגוּשָׁה', withoutName: 'כַף רָפָה' },
  { with: 'פּ', without: 'פ', withName: 'פֵּא דְּגוּשָׁה', withoutName: 'פֵא רָפָה' },
];

/** Letra + קָמָץ / פַּתָּח (hojas 2, 8, 12, 16, 18: "הַקִּיפוּ כׇּל בָּ בְּכָחֹל וְכׇל בַּ בְּיָרֹק"). */
export const KAMATZ = 'ָ';
export const PATACH = 'ַ';
export const VOWEL_SYL_LETTERS: { char: string; name: string }[] = [
  { char: 'בּ', name: 'בֵּית' },
  { char: 'ג', name: 'גִּימֶל' },
  { char: 'ד', name: 'דָּלֶת' },
  { char: 'ה', name: 'הֵא' },
  { char: 'ז', name: 'זַיִן' },
  { char: 'ח', name: 'חֵית' },
  { char: 'ט', name: 'טֵית' },
  { char: 'י', name: 'יוֹד' },
  { char: 'כּ', name: 'כַּף' },
  { char: 'ל', name: 'לָמֶד' },
  { char: 'מ', name: 'מֵם' },
  { char: 'נ', name: 'נוּן' },
];
export const vowelSylName = (name: string, mark: string) => `${name} ${mark === KAMATZ ? 'קָמָץ' : 'פַּתָּח'}`;

/** Dibujos para pintar por letra. Cada carácter es una zona; '.' queda en blanco. */
export interface PaintPicture {
  id: string;
  rows: string[];
  key: Record<string, { letter: string; color: keyof typeof COLORS }>;
}

export const PAINT_PICTURES: PaintPicture[] = [
  {
    id: 'heart',
    rows: [
      '..........',
      '.AA....AA.',
      'AAAA..AAAA',
      'AAAAAAAAAA',
      'AAAAAAAAAA',
      'BAAAAAAAAB',
      'B.AAAAAA.B',
      'BB.AAAA.BB',
      'BBB.AA.BBB',
      'BBBB..BBBB',
    ],
    key: { A: { letter: 'א', color: 'red' }, B: { letter: 'ב', color: 'lightblue' } },
  },
  {
    id: 'fish',
    rows: [
      'CCCCCCCCCC',
      'CCC.AAA.CC',
      'CC.AAAAA.C',
      'B.AAAAADAC',
      'BBAAAAAAAC',
      'BBAAAAAAAC',
      'B.AAAAAAAC',
      'CC.AAAAA.C',
      'CCC.AAA.CC',
      'CCCCCCCCCC',
    ],
    key: {
      A: { letter: 'ג', color: 'orange' },
      B: { letter: 'ב', color: 'yellow' },
      C: { letter: 'א', color: 'lightblue' },
      D: { letter: 'ד', color: 'black' },
    },
  },
  {
    id: 'flower',
    rows: [
      'EEEEEEEEEE',
      'EEE.AA.EEE',
      'EE.AAAA.EE',
      'E.AA..AA.E',
      'E.AABBAA.E',
      'E.AABBAA.E',
      'EE.AAAA.EE',
      'EEE.CC.EEE',
      'EDD.CC.DDE',
      'DDDDCCDDDD',
    ],
    key: {
      A: { letter: 'ה', color: 'pink' },
      B: { letter: 'ו', color: 'yellow' },
      C: { letter: 'ז', color: 'green' },
      D: { letter: 'ח', color: 'brown' },
      E: { letter: 'א', color: 'lightblue' },
    },
  },
  {
    id: 'house',
    rows: [
      'FFFF..FFFF',
      'FFF.AA.FFF',
      'FF.AAAA.FF',
      'F.AAAAAA.F',
      '.AAAAAAAA.',
      '.BBBBBBBB.',
      '.BCCBBDDB.',
      '.BCCBBDDB.',
      '.BBBBBDDB.',
      'EEEEEEEEEE',
    ],
    key: {
      A: { letter: 'ט', color: 'red' },
      B: { letter: 'י', color: 'yellow' },
      C: { letter: 'כ', color: 'lightblue' },
      D: { letter: 'ל', color: 'brown' },
      E: { letter: 'מ', color: 'green' },
      F: { letter: 'נ', color: 'blue' },
    },
  },
  {
    id: 'sun',
    rows: [
      'CCCCACCCCC',
      'CACCACCCAC',
      'CCA.BB.ACC',
      'CC.BBBB.CC',
      'AABBBBBBAA',
      'CC.BBBB.CC',
      'CCA.BB.ACC',
      'CACCACCCAC',
      'CCCCACCCCC',
      'DDDDDDDDDD',
    ],
    key: {
      A: { letter: 'ד', color: 'orange' },
      B: { letter: 'ג', color: 'yellow' },
      C: { letter: 'ב', color: 'lightblue' },
      D: { letter: 'ה', color: 'green' },
    },
  },
  {
    id: 'icecream',
    rows: [
      '....AA....',
      '...AAAA...',
      '..AAAAAA..',
      '..BBBBBB..',
      '.BBBBBBBB.',
      '..CCCCCC..',
      '...CCCC...',
      '...CCCC...',
      '....CC....',
      '....CC....',
    ],
    key: {
      A: { letter: 'ח', color: 'pink' },
      B: { letter: 'ז', color: 'purple' },
      C: { letter: 'ט', color: 'orange' },
    },
  },
];
