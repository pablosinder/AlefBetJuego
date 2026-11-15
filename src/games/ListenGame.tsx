import PicMarkGame, { MarkRound } from './PicMarkGame';
import { t, SAY } from '../strings';
import { WORDS } from '../data/words';
import { sample, shuffle } from '../lib/hebrew';
import { AUDIBLE_LETTERS, hearsLetter } from '../lib/sounds';

const TOTAL = 6;
const CARDS = 6;

// Hojas 4, 9, 20, 23, 36: "צִבְעוּ אֶת הַחַיָּה אִם שׁוֹמְעִים ב בְּשֵׁם שֶׁלָּהּ".
// Sin la palabra escrita: solo con el oído.
function makeRounds(): MarkRound[] {
  const letters = shuffle(AUDIBLE_LETTERS).filter((c) => {
    const yes = WORDS.filter((w) => hearsLetter(w.he, c)).length;
    return yes >= 3 && WORDS.length - yes >= 4;
  });
  return letters.slice(0, TOTAL).map((target) => {
    const yes = WORDS.filter((w) => hearsLetter(w.he, target));
    const no = WORDS.filter((w) => !hearsLetter(w.he, target));
    const nYes = 2 + Math.floor(Math.random() * 2);
    return {
      target,
      ask: SAY.listenAsk,
      words: shuffle([...sample(yes, nYes), ...sample(no, CARDS - nYes)]),
      isYes: (w) => hearsLetter(w.he, target),
    };
  });
}

export default function ListenGame({ onBack }: { onBack: () => void }) {
  return (
    <PicMarkGame
      id="listen"
      title={t.gListenTitle}
      accent="#f43f5e"
      edge="#be123c"
      soft="#ffe4ea"
      total={TOTAL}
      showText={false}
      makeRounds={makeRounds}
      onBack={onBack}
    />
  );
}
