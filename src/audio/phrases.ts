// Todo lo que el juego puede decir en voz alta. El script scripts/make-voices.mjs
// graba un MP3 por cada texto de esta lista.
import { LETTERS, FINAL_LETTERS } from '../data/letters';
import { WORDS } from '../data/words';
import { PART_WORDS, SPEECH_PARTS } from '../data/speechParts';
import { VOWELS } from '../lib/hebrew';
import { SAY } from '../strings';

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
    ...[
      SAY.welcome,
      SAY.chooseGame,
      ...SAY.praise,
      SAY.tryAgain,
      SAY.finished,
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
      ...SAY.gameTitles,
    ].map((text) => ({ text, kind: 'sentence' as const })),
  ];
  const seen = new Set<string>();
  return list.filter((p) => (seen.has(p.text) ? false : (seen.add(p.text), true)));
}
