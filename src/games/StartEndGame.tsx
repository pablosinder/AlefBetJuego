import PicMarkGame, { MarkRound } from './PicMarkGame';
import { t, SAY } from '../strings';
import { WORDS } from '../data/words';
import { sample, shuffle } from '../lib/hebrew';
import { lettersWith, test, Where } from '../lib/sounds';

const TOTAL = 6;
const CARDS = 6;

// Hojas 6, 7, 13, 15, 21, 26, 29, 32, 36, 41, 46, 51:
// "צִבְעוּ אֶת הַצִּיּוּר אִם הַמִּלָּה מַתְחִילָה / מִסְתַּיֶּמֶת בָּעִצּוּר…". Se alternan las dos.
function makeRounds(): MarkRound[] {
  const used = new Set<string>();
  return Array.from({ length: TOTAL }, (_, i) => {
    const where: Where = i % 2 === 0 ? 'start' : 'end';
    const f = test(where);
    const options = lettersWith(where, 2).filter((c) => !used.has(c));
    const target = shuffle(options)[0];
    used.add(target);
    const yes = WORDS.filter((w) => f(w.he, target));
    // Para que no confunda: los "no" no tienen la letra ni al principio ni al final.
    const no = WORDS.filter((w) => !test('start')(w.he, target) && !test('end')(w.he, target));
    const nYes = Math.min(yes.length, 2 + Math.floor(Math.random() * 2));
    return {
      target,
      ask: where === 'start' ? SAY.startAsk : SAY.endAsk,
      badge: where === 'start' ? t.atStart : t.atEnd,
      words: shuffle([...sample(yes, nYes), ...sample(no, CARDS - nYes)]),
      isYes: (w) => f(w.he, target),
    };
  });
}

export default function StartEndGame({ onBack }: { onBack: () => void }) {
  return (
    <PicMarkGame
      id="startend"
      title={t.gStartEndTitle}
      accent="#d946ef"
      edge="#a21caf"
      soft="#fbe8ff"
      total={TOTAL}
      showText
      makeRounds={makeRounds}
      onBack={onBack}
    />
  );
}
