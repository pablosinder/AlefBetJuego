import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { WORDS, Word } from '../data/words';
import { VOWELS, Vowel, firstVowel, pick, sample, shuffle } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';

const TOTAL = 8;
const ACCENT = '#2bb673';

interface Round {
  vowel: Vowel;
  options: Word[];
  answer: string;
}

const BY_VOWEL = new Map<Vowel, Word[]>();
for (const w of WORDS) {
  const v = firstVowel(w.he);
  if (v) BY_VOWEL.set(v, [...(BY_VOWEL.get(v) ?? []), w]);
}

// Basado en la hoja "אָ, אַ": elegir el dibujo cuyo nombre empieza con la vocal.
function makeRounds(): Round[] {
  const vowels = [...BY_VOWEL.keys()];
  return Array.from({ length: TOTAL }, () => {
    const vowel = pick(vowels);
    const answer = pick(BY_VOWEL.get(vowel)!);
    const others = sample(vowels.filter((v) => v !== vowel), 3).map((v) => pick(BY_VOWEL.get(v)!));
    return { vowel, answer: answer.he, options: shuffle([answer, ...others]) };
  });
}

export default function VowelsGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('vowels', TOTAL);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const r = rounds[q.round];
  const v = VOWELS.find((x) => x.id === r.vowel)!;

  useEffect(() => {
    setWrong([]);
    setSolved(false);
    if (!q.done) void say(SAY.vowelsAsk, v.sound);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (w: Word) => {
    if (solved || wrong.includes(w.he)) return void say(w.he);
    if (w.he === r.answer) {
      setSolved(true);
      q.good(w.he);
      setTimeout(q.next, 1500);
    } else {
      setWrong((x) => [...x, w.he]);
      q.bad(w.he);
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gVowelsTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gVowelsTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div key={q.round} className="anim-pop flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-3xl text-white text-6xl font-bold font-hebrew flex items-center justify-center shadow-[0_6px_0_#1f8f58]"
            style={{ background: ACCENT }}
          >
            {v.sample}
          </div>
          <span className="text-sm mt-2 font-semibold font-hebrew">{v.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg sm:text-xl font-semibold">{t.vowelsAsk}</p>
          <SpeakButton text={[SAY.vowelsAsk, v.sound]} size="sm" />
        </div>
      </div>

      <Feedback kind={q.feedback} id={q.fbId} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto w-full" dir="rtl">
        {r.options.map((w) => {
          const isWrong = wrong.includes(w.he);
          const isRight = solved && w.he === r.answer;
          return (
            <button
              key={`${q.round}-${w.he}`}
              onClick={() => choose(w)}
              className={`chunky p-4 flex flex-col items-center gap-2 ${
                isRight
                  ? 'bg-emerald-50 border-emerald-500 anim-pop'
                  : isWrong
                    ? 'bg-rose-50 border-rose-200 opacity-60 anim-shake'
                    : 'bg-white border-[#d6efe2]'
              }`}
              style={{ ['--chunk' as string]: isRight ? '#1f8f58' : '#c7e6d5' }}
            >
              <span className="text-6xl sm:text-7xl" aria-hidden>{w.emoji}</span>
              <span className="text-2xl sm:text-3xl font-bold font-hebrew">{w.he}</span>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
