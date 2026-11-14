import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { EndScreen, Feedback, GameShell, PrimaryButton, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { WORDS, Word } from '../data/words';
import { LETTERS, LETTER_BY_CHAR } from '../data/letters';
import { containsLetter, sample, shuffle } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';

const TOTAL = 6;
const CARDS = 6;
const ACCENT = '#8b5cf6';

interface Round {
  target: string;
  words: Word[];
}

// Como en la hoja: "צִבְעוּ אֶת הַחַיָּה אִם הָאוֹת א מוֹפִיעָה בְּשֵׁם שֶׁלָּהּ".
function makeRounds(): Round[] {
  const candidates = shuffle(LETTERS).filter((l) => {
    const yes = WORDS.filter((w) => containsLetter(w.he, l.char)).length;
    return yes >= 3 && WORDS.length - yes >= 3;
  });
  return candidates.slice(0, TOTAL).map((l) => {
    const yes = WORDS.filter((w) => containsLetter(w.he, l.char));
    const no = WORDS.filter((w) => !containsLetter(w.he, l.char));
    const nYes = 2 + Math.floor(Math.random() * 2); // 2–3
    return { target: l.char, words: shuffle([...sample(yes, nYes), ...sample(no, CARDS - nYes)]) };
  });
}

export default function InWordGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('inword', TOTAL);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);

  const r = rounds[q.round];
  const letter = LETTER_BY_CHAR[r.target];

  useEffect(() => {
    setMarked(new Set());
    setErrors(new Set());
    setSolved(false);
    if (!q.done) void say(SAY.inWordAsk, letter.name);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (i: number) => {
    if (solved) return;
    const m = new Set(marked);
    if (m.has(i)) m.delete(i);
    else m.add(i);
    setMarked(m);
    setErrors(new Set());
    if (!marked.has(i)) void say(r.words[i].he);
  };

  const check = () => {
    const wrong = new Set<number>();
    r.words.forEach((w, i) => {
      if (containsLetter(w.he, r.target) !== marked.has(i)) wrong.add(i);
    });
    if (wrong.size === 0) {
      setSolved(true);
      q.good();
      setTimeout(q.next, 1500);
    } else {
      setErrors(wrong);
      q.bad();
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gInWordTitle} onBack={onBack} accent={ACCENT}>
        <EndScreen
          stars={q.stars}
          correct={q.correct}
          total={TOTAL}
          onAgain={() => {
            q.reset();
            setSeed((s) => s + 1);
          }}
          onMenu={onBack}
        />
      </GameShell>
    );
  }

  return (
    <GameShell title={t.gInWordTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div key={q.round} className="anim-pop flex items-center justify-center gap-4">
        <div
          className="w-20 h-20 shrink-0 rounded-3xl text-white text-5xl font-bold font-hebrew flex items-center justify-center shadow-[0_6px_0_#6a3fd1]"
          style={{ background: ACCENT }}
        >
          {r.target}
        </div>
        <p className="text-lg sm:text-xl font-semibold">{t.inWordAsk} {r.target}</p>
        <SpeakButton text={[SAY.inWordAsk, letter.name]} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4" dir="rtl">
        {r.words.map((w, i) => {
          const on = marked.has(i);
          const err = errors.has(i);
          return (
            <div
              key={`${q.round}-${i}`}
              role="button"
              tabIndex={0}
              onClick={() => toggle(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(i)}
              className={`chunky cursor-pointer p-3 flex flex-col items-center gap-2 ${
                on ? 'bg-[#efe8ff] border-[#8b5cf6]' : 'bg-white border-[#e6defa]'
              } ${err ? 'anim-shake !border-rose-400 !bg-rose-50' : ''}`}
              style={{ ['--chunk' as string]: on ? '#6a3fd1' : '#ddd3f5' }}
            >
              {on && (
                <span className="absolute top-2 start-2 w-7 h-7 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center anim-pop">
                  <Check className="w-5 h-5" />
                </span>
              )}
              <div className={`text-6xl sm:text-7xl transition ${on ? '' : 'grayscale-[40%]'}`} aria-hidden>
                {w.emoji}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-hebrew border-2 border-[#8b5cf6]/40 rounded-lg px-2">
                  {w.he}
                </span>
                <SpeakButton text={w.he} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={check} disabled={solved} color={ACCENT} edge="#6a3fd1">
          <Check className="w-6 h-6" /> {t.check}
        </PrimaryButton>
      </div>
    </GameShell>
  );
}
