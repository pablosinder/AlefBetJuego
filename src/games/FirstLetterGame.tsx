import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { WORDS, Word } from '../data/words';
import { LETTERS, LETTER_BY_CHAR } from '../data/letters';
import { firstClusterLength, firstLetter, sample, shuffle } from '../lib/hebrew';
import { say } from '../lib/audio';
import { useQuiz } from '../lib/useQuiz';

const TOTAL = 10;
const ACCENT = '#4f7cff';

interface Round {
  word: Word;
  answer: string;
  options: string[];
}

function makeRounds(): Round[] {
  // Una palabra por letra inicial distinta, para variar.
  const byLetter = new Map<string, Word[]>();
  for (const w of WORDS) {
    const f = firstLetter(w.he);
    if (!LETTER_BY_CHAR[f]) continue;
    byLetter.set(f, [...(byLetter.get(f) ?? []), w]);
  }
  const letters = sample([...byLetter.keys()], TOTAL);
  return letters.map((answer) => {
    const word = sample(byLetter.get(answer)!, 1)[0];
    const similar = LETTER_BY_CHAR[answer].similar.filter((c) => LETTER_BY_CHAR[c]);
    const others = shuffle(LETTERS.map((l) => l.char).filter((c) => c !== answer && !similar.includes(c)));
    const distractors = [...sample(similar, 1), ...others].slice(0, 3);
    return { word, answer, options: shuffle([answer, ...distractors]) };
  });
}

export default function FirstLetterGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('first', TOTAL);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const r = rounds[q.round];

  useEffect(() => {
    setWrong([]);
    setSolved(false);
    if (!q.done) void (q.round === 0 ? say(SAY.firstAsk, r.word.he) : say(r.word.he));
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (c: string) => {
    if (solved || wrong.includes(c)) return;
    if (c === r.answer) {
      setSolved(true);
      q.good(r.word.he);
      setTimeout(q.next, 1500);
    } else {
      setWrong((w) => [...w, c]);
      q.bad();
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gFirstTitle} onBack={onBack} accent={ACCENT}>
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

  const cut = firstClusterLength(r.word.he);

  return (
    <GameShell title={t.gFirstTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-lg sm:text-xl font-semibold">{t.firstAsk}</p>
        <SpeakButton text={[SAY.firstAsk, r.word.he]} size="sm" />
      </div>

      <div key={q.round} className="anim-pop mx-auto bg-white rounded-3xl border-2 border-[#dfe6ff] shadow-[0_6px_0_#c9d5ff] w-full max-w-sm p-6 flex flex-col items-center gap-3">
        <div className="text-8xl sm:text-9xl" aria-hidden>{r.word.emoji}</div>
        <div className="flex items-center gap-3 min-h-[3rem]">
          <span className="text-3xl sm:text-4xl font-bold font-hebrew" dir="rtl">
            {solved ? (
              <>
                <span style={{ color: ACCENT }}>{r.word.he.slice(0, cut)}</span>
                {r.word.he.slice(cut)}
              </>
            ) : (
              <span className="tracking-widest opacity-30">? ? ?</span>
            )}
          </span>
          <SpeakButton text={r.word.he} />
        </div>
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto w-full" dir="rtl">
        {r.options.map((c) => {
          const isWrong = wrong.includes(c);
          const isRight = solved && c === r.answer;
          return (
            <button
              key={c}
              onClick={() => choose(c)}
              disabled={isWrong}
              className={`chunky aspect-square text-5xl sm:text-6xl font-bold font-hebrew flex items-center justify-center ${
                isRight
                  ? 'bg-emerald-500 border-emerald-600 text-white anim-pop'
                  : isWrong
                    ? 'bg-rose-50 border-rose-200 text-rose-300 anim-shake'
                    : 'bg-white border-[#dfe6ff]'
              }`}
              style={{ ['--chunk' as string]: isRight ? '#047857' : '#c9d5ff' }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
