export type PartId = 'noun' | 'adjective' | 'verb' | 'adverb';

export interface SpeechPart {
  id: PartId;
  he: string;
  def: string;
  color: string; // clases tailwind
}

// Basado en la hoja "חֶלְקֵי הַדִּבּוּר".
export const SPEECH_PARTS: SpeechPart[] = [
  {
    id: 'noun',
    he: 'שֵׁם עֶצֶם',
    def: 'שֵׁם שֶׁל אָדָם, מָקוֹם, חֵפֶץ אוֹ רַעְיוֹן',
    color: 'bg-sky-100 border-sky-400 text-sky-900',
  },
  {
    id: 'adjective',
    he: 'שֵׁם תֹּאַר',
    def: 'מִלָּה שֶׁמְּתָאֶרֶת אֶת שֵׁם הָעֶצֶם',
    color: 'bg-rose-100 border-rose-400 text-rose-900',
  },
  {
    id: 'verb',
    he: 'פֹּעַל',
    def: 'פְּעֻלָּה שֶׁעָשָׂה מִישֶׁהוּ אוֹ מַצָּב שֶׁבּוֹ הוּא נִמְצָא',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-900',
  },
  {
    id: 'adverb',
    he: 'תֹּאַר הַפֹּעַל',
    def: 'מִלָּה שֶׁמְּתָאֶרֶת אֶת הַפֹּעַל: מָקוֹם, זְמַן, אֹפֶן וְסִבָּה',
    color: 'bg-amber-100 border-amber-400 text-amber-900',
  },
];

export const PART_WORDS: { he: string; part: PartId }[] = [
  { he: 'רוֹעִי', part: 'noun' },
  { he: 'אִיטַלְיָה', part: 'noun' },
  { he: 'כִּסֵּא', part: 'noun' },
  { he: 'אַהֲבָה', part: 'noun' },
  { he: 'שֻׁלְחָן', part: 'noun' },
  { he: 'יֶלֶד', part: 'noun' },
  { he: 'עִיר', part: 'noun' },
  { he: 'סֵפֶר', part: 'noun' },
  { he: 'יָפֶה', part: 'adjective' },
  { he: 'מְלֻכְלָךְ', part: 'adjective' },
  { he: 'חֲכָמָה', part: 'adjective' },
  { he: 'מְצֻיָּנִים', part: 'adjective' },
  { he: 'גָּדוֹל', part: 'adjective' },
  { he: 'קָטָן', part: 'adjective' },
  { he: 'שָׂמֵחַ', part: 'adjective' },
  { he: 'אָדֹם', part: 'adjective' },
  { he: 'רָץ', part: 'verb' },
  { he: 'יָשֵׁן', part: 'verb' },
  { he: 'הָלַכְנוּ', part: 'verb' },
  { he: 'חוֹשֶׁבֶת', part: 'verb' },
  { he: 'אוֹכֵל', part: 'verb' },
  { he: 'כּוֹתֶבֶת', part: 'verb' },
  { he: 'קָפַץ', part: 'verb' },
  { he: 'שָׁרִים', part: 'verb' },
  { he: 'לְאַט', part: 'adverb' },
  { he: 'שָׁם', part: 'adverb' },
  { he: 'מָחָר', part: 'adverb' },
  { he: 'כָּכָה', part: 'adverb' },
  { he: 'מַהֵר', part: 'adverb' },
  { he: 'אֶתְמוֹל', part: 'adverb' },
  { he: 'כָּאן', part: 'adverb' },
  { he: 'עַכְשָׁו', part: 'adverb' },
];
