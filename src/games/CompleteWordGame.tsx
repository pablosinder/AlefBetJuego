import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { WORDS, Word } from '../data/words';
import { LETTERS, LETTER_BY_CHAR } from '../data/letters';
import { clusters, hasVowel, pick, sample, shuffle, swapLetter } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';

const TOTAL = 8;
const ACCENT = '#e8590c';

interface Round {
  word: Word;
  parts: string[];
  missing: number;
  options: string[];
  answer: string;
}

// Basado en "הַשְׁלִימוּ אֶת הַמִּלָּה עִם אָ אוֹ בָּ": falta una letra (con su vocal) y hay que elegirla.
function makeRound(word: Word): Round | null {
  const parts = clusters(word.he);
  const ok = parts
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => {
      const l = c[0];
      if (!LETTER_BY_CHAR[l]) return false; // letras finales no
      if (!hasVowel(c)) return false; // tiene que sonar
      if (i > 0 && (l === 'ו' || l === 'י')) return false; // evitar vocales escritas
      return true;
    });
  if (!ok.length) return null;
  // Más fácil: casi siempre la primera letra.
  const first = ok.find((x) => x.i === 0);
  const chosen = first && Math.random() < 0.65 ? first : pick(ok);
  const letter = chosen.c[0];
  const similar = LETTER_BY_CHAR[letter].similar.filter((c) => LETTER_BY_CHAR[c] && c !== letter);
  const others = shuffle(LETTERS.map((l) => l.char).filter((c) => c !== letter && !similar.includes(c)));
  const distractors = [...sample(similar, 1), ...others].slice(0, 3).map((l) => swapLetter(chosen.c, l));
  return {
    word,
    parts,
    missing: chosen.i,
    answer: chosen.c,
    options: shuffle([chosen.c, ...distractors]),
  };
}

function makeRounds(): Round[] {
  const rounds: Round[] = [];
  for (const w of shuffle(WORDS)) {
    const r = makeRound(w);
    if (r) rounds.push(r);
    if (rounds.length === TOTAL) break;
  }
  return rounds;
}

export default function CompleteWordGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('complete', TOTAL);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const r = rounds[q.round];

  useEffect(() => {
    setWrong([]);
    setSolved(false);
    if (!q.done) void (q.round === 0 ? say(SAY.completeAsk, r.word.he) : say(r.word.he));
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (c: string) => {
    if (solved || wrong.includes(c)) return;
    if (c === r.answer) {
      setSolved(true);
      q.good(r.word.he);
      setTimeout(q.next, 1600);
    } else {
      setWrong((w) => [...w, c]);
      q.bad();
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gCompleteTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gCompleteTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-lg sm:text-xl font-semibold">{t.completeAsk}</p>
        <SpeakButton text={[SAY.completeAsk, r.word.he]} size="sm" />
      </div>

      <div
        key={q.round}
        className="anim-pop mx-auto bg-white rounded-3xl border-2 border-[#fde0cc] shadow-[0_6px_0_#f8cba9] w-full max-w-sm p-6 flex flex-col items-center gap-4"
      >
        <button onClick={() => void say(r.word.he)} className="text-8xl sm:text-9xl" aria-label={t.listen}>
          {r.word.emoji}
        </button>
        <div className="text-5xl sm:text-6xl font-bold font-hebrew leading-[1.6]" dir="rtl">
          {r.parts.map((c, i) =>
            i === r.missing && solved ? (
              <span key={i} className="anim-pop inline-block" style={{ color: ACCENT }}>
                {c}
              </span>
            ) : i === r.missing ? (
              <span
                key={i}
                className={`inline-block min-w-[1.1em] text-center align-middle rounded-xl border-[3px] border-dashed mx-0.5 border-[#e8590c]/60 bg-[#fff3ea]`}
              >
                {'\u00A0'}
              </span>
            ) : (
              <span key={i}>{c}</span>
            ),
          )}
        </div>
      </div>

      <Feedback kind={q.feedback} id={q.fbId} />

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
                    : 'bg-white border-[#fde0cc]'
              }`}
              style={{ ['--chunk' as string]: isRight ? '#047857' : '#f8cba9' }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
