// Todo lo que el juego puede decir en voz alta. El script scripts/make-voices.mjs
// graba un MP3 por cada texto de esta lista.
import { LETTERS, FINAL_LETTERS } from '../data/letters';
import { WORDS } from '../data/words';
import { PART_WORDS, SPEECH_PARTS } from '../data/speechParts';
import { VOWELS } from '../lib/hebrew';
import { SAY } from '../strings';
import {
  ALL_SYLLABLES,
  COLORS,
  DAGESH_PAIRS,
  GENDER_PAIRS,
  KAMATZ,
  LETTER_SHAPES,
  PATACH,
  VOWEL_SYL_LETTERS,
  vowelSylName,
} from '../data/sheets';

export type PhraseKind = 'letter' | 'word' | 'sound' | 'sentence';

export interface Phrase {
  text: string;
  kind: PhraseKind;
}

export function allPhrases(): Phrase[] {
  const list: Phrase[] = [
    ...LETTERS.map((l) => ({ text: l.name, kind: 'letter' as const })),
    ...FINAL_LETTERS.map((l) => ({ text: l.name, kind: 'letter' as const })),
    ...WORDS.map((w) => ({ text: w.he, kind: 'word' as const })),
    ...PART_WORDS.map((w) => ({ text: w.he, kind: 'word' as const })),
    ...SPEECH_PARTS.map((p) => ({ text: p.he, kind: 'word' as const })),
    ...VOWELS.map((v) => ({ text: v.sound, kind: 'sound' as const })),
    ...DAGESH_PAIRS.flatMap((d) => [d.withName, d.withoutName]).map((text) => ({ text, kind: 'letter' as const })),
    ...VOWEL_SYL_LETTERS.flatMap((l) => [vowelSylName(l.name, KAMATZ), vowelSylName(l.name, PATACH)]).map((text) => ({
      text,
      kind: 'letter' as const,
    })),
    ...GENDER_PAIRS.flatMap((g) => [g.male, g.female]).map((text) => ({ text, kind: 'word' as const })),
    ...Object.values(COLORS).map((c) => ({ text: c.name, kind: 'word' as const })),
    ...ALL_SYLLABLES.map((text) => ({ text, kind: 'sound' as const })),
    ...Object.values(LETTER_SHAPES).map((text) => ({ text, kind: 'sentence' as const })),
    ...[
      SAY.welcome,
      SAY.chooseGame,
      ...SAY.praise,
      ...SAY.encourage,
      ...SAY.streak,
      ...SAY.finished,
      SAY.lettersHint,
      SAY.firstAsk,
      SAY.findAsk,
      SAY.inWordAsk,
      SAY.vowelsAsk,
      SAY.writeAsk,
      SAY.writeMore,
      SAY.writeOutside,
      SAY.partsAsk,
      SAY.completeAsk,
      SAY.connectAsk,
      SAY.catchAsk,
      SAY.colorAsk,
      SAY.posAsk,
      SAY.startAsk,
      SAY.endAsk,
      SAY.listenAsk,
      SAY.sortStartAsk,
      SAY.sortEndAsk,
      SAY.genderRule,
      SAY.genderAsk,
      SAY.genderTapH,
      SAY.readAsk,
      SAY.readPick,
      SAY.spellAsk,
      SAY.mazeStartAsk,
      SAY.mazeEndAsk,
      SAY.pathAsk,
      SAY.pathLearn,
      ...SAY.gameTitles,
    ].map((text) => ({ text, kind: 'sentence' as const })),
  ];
  const seen = new Set<string>();
  return list.filter((p) => (seen.has(p.text) ? false : (seen.add(p.text), true)));
}
