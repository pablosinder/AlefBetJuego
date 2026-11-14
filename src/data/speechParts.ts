export type PartId = 'noun' | 'adjective' | 'verb' | 'adverb';

export interface SpeechPart {
  id: PartId;
  he: string;
  es: string;
  defHe: string;
  defEs: string;
  color: string; // clases tailwind
}

// Basado en la hoja "חֶלְקֵי הַדִּבּוּר".
export const SPEECH_PARTS: SpeechPart[] = [
  {
    id: 'noun',
    he: 'שֵׁם עֶצֶם',
    es: 'Sustantivo',
    defHe: 'שֵׁם שֶׁל אָדָם, מָקוֹם, חֵפֶץ אוֹ רַעְיוֹן',
    defEs: 'Nombre de una persona, lugar, objeto o idea',
    color: 'bg-sky-100 border-sky-400 text-sky-900',
  },
  {
    id: 'adjective',
    he: 'שֵׁם תֹּאַר',
    es: 'Adjetivo',
    defHe: 'מִלָּה שֶׁמְּתָאֶרֶת אֶת שֵׁם הָעֶצֶם',
    defEs: 'Palabra que describe al sustantivo',
    color: 'bg-rose-100 border-rose-400 text-rose-900',
  },
  {
    id: 'verb',
    he: 'פֹּעַל',
    es: 'Verbo',
    defHe: 'פְּעֻלָּה שֶׁעָשָׂה מִישֶׁהוּ אוֹ מַצָּב שֶׁבּוֹ הוּא נִמְצָא',
    defEs: 'Acción que alguien hizo o estado en el que está',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-900',
  },
  {
    id: 'adverb',
    he: 'תֹּאַר הַפֹּעַל',
    es: 'Adverbio',
    defHe: 'מִלָּה שֶׁמְּתָאֶרֶת אֶת הַפֹּעַל: מָקוֹם, זְמַן, אֹפֶן וְסִבָּה',
    defEs: 'Describe al verbo: lugar, tiempo, modo y causa',
    color: 'bg-amber-100 border-amber-400 text-amber-900',
  },
];

export const PART_WORDS: { he: string; es: string; part: PartId }[] = [
  { he: 'רוֹעִי', es: 'Roí (nombre)', part: 'noun' },
  { he: 'אִיטַלְיָה', es: 'Italia', part: 'noun' },
  { he: 'כִּסֵּא', es: 'silla', part: 'noun' },
  { he: 'אַהֲבָה', es: 'amor', part: 'noun' },
  { he: 'שֻׁלְחָן', es: 'mesa', part: 'noun' },
  { he: 'יֶלֶד', es: 'niño', part: 'noun' },
  { he: 'עִיר', es: 'ciudad', part: 'noun' },
  { he: 'סֵפֶר', es: 'libro', part: 'noun' },
  { he: 'יָפֶה', es: 'lindo', part: 'adjective' },
  { he: 'מְלֻכְלָךְ', es: 'sucio', part: 'adjective' },
  { he: 'חֲכָמָה', es: 'inteligente', part: 'adjective' },
  { he: 'מְצֻיָּנִים', es: 'excelentes', part: 'adjective' },
  { he: 'גָּדוֹל', es: 'grande', part: 'adjective' },
  { he: 'קָטָן', es: 'pequeño', part: 'adjective' },
  { he: 'שָׂמֵחַ', es: 'contento', part: 'adjective' },
  { he: 'אָדֹם', es: 'rojo', part: 'adjective' },
  { he: 'רָץ', es: 'corre', part: 'verb' },
  { he: 'יָשֵׁן', es: 'duerme', part: 'verb' },
  { he: 'הָלַכְנוּ', es: 'fuimos', part: 'verb' },
  { he: 'חוֹשֶׁבֶת', es: 'piensa', part: 'verb' },
  { he: 'אוֹכֵל', es: 'come', part: 'verb' },
  { he: 'כּוֹתֶבֶת', es: 'escribe', part: 'verb' },
  { he: 'קָפַץ', es: 'saltó', part: 'verb' },
  { he: 'שָׁרִים', es: 'cantan', part: 'verb' },
  { he: 'לְאַט', es: 'despacio', part: 'adverb' },
  { he: 'שָׁם', es: 'allí', part: 'adverb' },
  { he: 'מָחָר', es: 'mañana', part: 'adverb' },
  { he: 'כָּכָה', es: 'así', part: 'adverb' },
  { he: 'מַהֵר', es: 'rápido', part: 'adverb' },
  { he: 'אֶתְמוֹל', es: 'ayer', part: 'adverb' },
  { he: 'כָּאן', es: 'aquí', part: 'adverb' },
  { he: 'עַכְשָׁו', es: 'ahora', part: 'adverb' },
];
