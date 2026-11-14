import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type Lang = 'he' | 'es';

const he = {
  appTitle: 'אָלֶף־בֵּית',
  appSubtitle: 'מִשְׂחָקִים לִלְמֹד עִבְרִית',
  chooseGame: 'בַּחֲרוּ מִשְׂחָק',
  back: 'חֲזָרָה',
  next: 'הַבָּא',
  check: 'בְּדִיקָה',
  playAgain: 'עוֹד פַּעַם',
  toMenu: 'לַתַּפְרִיט',
  listen: 'הַקְשִׁיבוּ',
  great: 'כׇּל הַכָּבוֹד!',
  tryAgain: 'נַסּוּ שׁוּב',
  round: 'סִבּוּב',
  of: 'מִתּוֹךְ',
  mistakes: 'טָעֻיּוֹת',
  finished: 'סִיַּמְתֶּם!',
  correctOutOf: (c: number, t: number) => `${c} נְכוֹנוֹת מִתּוֹךְ ${t}`,
  noVoice: 'בַּדַּפְדְּפָן הַזֶּה אֵין קוֹל בְּעִבְרִית — אֶפְשָׁר לְשַׂחֵק גַּם בְּלִי.',
  lang: 'Español',

  // משחקים
  gLettersTitle: 'הָאוֹתִיּוֹת',
  gLettersDesc: 'מַכִּירִים אֶת כׇּל הָאוֹתִיּוֹת',
  gFirstTitle: 'הָאוֹת הָרִאשׁוֹנָה',
  gFirstDesc: 'בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה?',
  gFindTitle: 'מִצְאוּ אֶת הָאוֹת',
  gFindDesc: 'הַקִּיפוּ כׇּל אוֹת שֶׁמַּתְאִימָה',
  gInWordTitle: 'אוֹת בַּמִּלָּה',
  gInWordDesc: 'בְּאֵילוּ מִלִּים מוֹפִיעָה הָאוֹת?',
  gVowelsTitle: 'תְּנוּעוֹת',
  gVowelsDesc: 'בְּאֵיזוֹ תְּנוּעָה מַתְחִיל הַשֵּׁם?',
  gWriteTitle: 'כְּתִיבַת אוֹתִיּוֹת',
  gWriteDesc: 'עוֹבְרִים עַל הָאוֹת בָּאֶצְבַּע',
  gPartsTitle: 'חֶלְקֵי הַדִּבּוּר',
  gPartsDesc: 'מְמַיְּנִים מִלִּים לִקְבוּצוֹת',

  // הוראות
  lettersHint: 'לַחֲצוּ עַל אוֹת כְּדֵי לִשְׁמֹעַ',
  finalLetters: 'אוֹתִיּוֹת סוֹפִיּוֹת',
  firstAsk: 'בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה?',
  findAsk: (l: string) => `הַקִּיפוּ כׇּל אוֹת ${l}`,
  left: 'נִשְׁאֲרוּ',
  inWordAsk: (l: string) => `סַמְּנוּ אֶת הַתְּמוּנוֹת שֶׁבִּשְׁמָן מוֹפִיעָה הָאוֹת ${l}`,
  vowelsAsk: 'בַּחֲרוּ אֶת הַתְּמוּנָה שֶׁשְּׁמָהּ מַתְחִיל בַּתְּנוּעָה',
  writeAsk: 'עִבְרוּ עַל הָאוֹת בָּאֶצְבַּע',
  writeGroup1: 'א–י',
  writeGroup2: 'כ–ר',
  writeGroup3: 'ש–ת וְסוֹפִיּוֹת',
  clear: 'מְחִיקָה',
  writeMore: 'כִּמְעַט! כִּסּוּ עוֹד קְצָת מֵהָאוֹת',
  writeOutside: 'נַסּוּ לִכְתֹּב בְּתוֹךְ הָאוֹת',
  partsAsk: 'לְאֵיזוֹ קְבוּצָה שַׁיֶּכֶת הַמִּלָּה?',
  showDefs: 'מָה זֶה?',
};

export type Strings = typeof he;

const es: Strings = {
  appTitle: 'Álef-Bet',
  appSubtitle: 'Juegos para aprender hebreo',
  chooseGame: 'Elegí un juego',
  back: 'Volver',
  next: 'Siguiente',
  check: 'Comprobar',
  playAgain: 'Otra vez',
  toMenu: 'Al menú',
  listen: 'Escuchar',
  great: '¡Muy bien!',
  tryAgain: 'Intentá de nuevo',
  round: 'Ronda',
  of: 'de',
  mistakes: 'errores',
  finished: '¡Terminaste!',
  correctOutOf: (c, t) => `${c} correctas de ${t}`,
  noVoice: 'Este navegador no tiene voz en hebreo; se puede jugar igual.',
  lang: 'עִבְרִית',

  gLettersTitle: 'Las letras',
  gLettersDesc: 'Conocé todas las letras',
  gFirstTitle: 'La primera letra',
  gFirstDesc: '¿Con qué letra empieza la palabra?',
  gFindTitle: 'Encontrá la letra',
  gFindDesc: 'Marcá cada letra igual',
  gInWordTitle: 'Letra en la palabra',
  gInWordDesc: '¿En qué palabras aparece la letra?',
  gVowelsTitle: 'Vocales',
  gVowelsDesc: '¿Con qué vocal empieza el nombre?',
  gWriteTitle: 'Escribir letras',
  gWriteDesc: 'Repasá la letra con el dedo',
  gPartsTitle: 'Partes de la oración',
  gPartsDesc: 'Clasificá las palabras',

  lettersHint: 'Tocá una letra para escucharla',
  finalLetters: 'Letras finales',
  firstAsk: '¿Con qué letra empieza la palabra?',
  findAsk: (l) => `Marcá cada letra ${l}`,
  left: 'Faltan',
  inWordAsk: (l) => `Marcá los dibujos cuyo nombre tiene la letra ${l}`,
  vowelsAsk: 'Elegí el dibujo cuyo nombre empieza con la vocal',
  writeAsk: 'Repasá la letra con el dedo',
  writeGroup1: 'א–י',
  writeGroup2: 'כ–ר',
  writeGroup3: 'ש–ת y finales',
  clear: 'Borrar',
  writeMore: '¡Casi! Cubrí un poco más de la letra',
  writeOutside: 'Intentá escribir dentro de la letra',
  partsAsk: '¿A qué grupo pertenece la palabra?',
  showDefs: '¿Qué es?',
};

const STRINGS: Record<Lang, Strings> = { he, es };
const KEY = 'alefbet.lang';

interface I18n {
  lang: Lang;
  t: Strings;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18n | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'he' || saved === 'es') return saved;
  } catch {
    // ignorar
  }
  return 'he'; // idioma por defecto
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = lang === 'he' ? 'אָלֶף־בֵּית – מִשְׂחָקִים בְּעִבְרִית' : 'Álef-Bet – Juegos de hebreo';
  }, [lang, dir]);

  const value = useMemo<I18n>(
    () => ({
      lang,
      dir,
      t: STRINGS[lang],
      setLang: (l) => {
        setLangState(l);
        try {
          localStorage.setItem(KEY, l);
        } catch {
          // ignorar
        }
      },
    }),
    [lang, dir],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n fuera de I18nProvider');
  return v;
}
