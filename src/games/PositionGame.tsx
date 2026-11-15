import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { SYL_WORDS, SylWord, sylWord } from '../data/sheets';
import { LETTER_BY_CHAR } from '../data/letters';
import { lettersOf, pick, shuffle } from '../lib/hebrew';
import { AUDIBLE_LETTERS } from '../lib/sounds';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';

const TOTAL = 8;
const ACCENT = '#f97316';
const EDGE = '#c2560c';

interface Round {
  word: SylWord;
  he: string;
  target: string;
  index: number; // sílaba donde está la letra
}

// Hojas 10, 15, 20, 38, 43: "צִבְעוּ אֶת הָעִגּוּל הַמַּתְאִים לִמְקוֹם הַהֲבָרָה בַּמִּלָּה".
// Un círculo por sílaba; hay que tocar el de la sílaba donde se oye la letra.
function makeRounds(): Round[] {
  const options: Round[] = [];
  for (const w of SYL_WORDS) {
    if (w.syl.length < 2) continue;
    const per = w.syl.map((s) => new Set(lettersOf(s)));
    for (const c of AUDIBLE_LETTERS) {
      const at = per.flatMap((set, i) => (set.has(c) ? [i] : []));
      if (at.length === 1) options.push({ word: w, he: sylWord(w), target: c, index: at[0] });
    }
  }
  // Variar: no repetir palabra y mezclar posiciones (principio, medio, final).
  const rounds: Round[] = [];
  const usedWords = new Set<string>();
  const wantIdx = shuffle([0, 0, 0, 1, 1, 1, 2, 2]);
  for (const want of wantIdx) {
    const pool = options.filter(
      (o) => !usedWords.has(o.he) && (want < 2 ? o.index === want : o.index === o.word.syl.length - 1 && o.index > 0),
    );
    const r = pool.length ? pick(pool) : pick(options.filter((o) => !usedWords.has(o.he)));
    usedWords.add(r.he);
    rounds.push(r);
  }
  return rounds;
}

export default function PositionGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('position', TOTAL);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const r = rounds[q.round];
  const letterName = LETTER_BY_CHAR[r.target].name;

  useEffect(() => {
    setWrong([]);
    setSolved(false);
    if (!q.done) void say(SAY.posAsk, letterName, r.he);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (i: number) => {
    if (solved || wrong.includes(i)) return;
    if (i === r.index) {
      setSolved(true);
      q.good(r.he);
      setTimeout(q.next, 2600);
    } else {
      setWrong((w) => [...w, i]);
      q.bad(r.he);
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gPosTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gPosTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-3">
        <div
          className="w-16 h-16 shrink-0 rounded-2xl text-white text-4xl font-bold font-hebrew flex items-center justify-center"
          style={{ background: ACCENT, boxShadow: `0 5px 0 ${EDGE}` }}
        >
          {r.target}
        </div>
        <p className="text-lg sm:text-xl font-semibold">
          {t.posAsk} {r.target}?
        </p>
        <SpeakButton text={[SAY.posAsk, letterName, r.he]} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div
        key={q.round}
        className="anim-pop mx-auto bg-white rounded-3xl border-2 border-[#fde0cc] shadow-[0_6px_0_#f8cba9] w-full max-w-md p-6 flex flex-col items-center gap-5"
      >
        <button onClick={() => void say(r.he)} className="text-8xl sm:text-9xl" aria-label={t.listen}>
          {r.word.emoji}
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-3 sm:gap-4" dir="rtl">
            {r.word.syl.map((s, i) => {
              const isRight = solved && i === r.index;
              const isWrong = wrong.includes(i);
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => tap(i)}
                    aria-label={`${i + 1}`}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 transition ${
                      isWrong ? 'anim-shake bg-rose-100 border-rose-300' : ''
                    } ${isRight ? 'anim-pop' : ''}`}
                    style={{
                      background: isRight ? ACCENT : isWrong ? undefined : '#fff7f0',
                      borderColor: isRight ? EDGE : isWrong ? undefined : `${ACCENT}99`,
                    }}
                  />
                  <span
                    className={`text-3xl font-bold font-hebrew h-10 transition-opacity ${solved ? 'opacity-100' : 'opacity-0'}`}
                    style={{ color: i === r.index ? ACCENT : undefined }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <ArrowLeft className="w-8 h-8 opacity-50" aria-hidden />
        </div>
      </div>
    </GameShell>
  );
}
