import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { useI18n } from '../i18n';
import { LETTERS, LETTER_BY_CHAR } from '../data/letters';
import { pick, sample, shuffle } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { speak } from '../lib/speech';

const TOTAL = 6;
const CELLS = 20;
const ACCENT = '#ef5da8';

interface Round {
  target: string;
  cells: string[];
}

// Como en la hoja: "הַקִּיפוּ כׇּל אוֹת א" en una fila de letras mezcladas.
function makeRounds(): Round[] {
  return sample(LETTERS, TOTAL).map((l) => {
    const nTargets = 5 + Math.floor(Math.random() * 3);
    const similar = l.similar.filter((c) => LETTER_BY_CHAR[c]);
    const fillers: string[] = [];
    while (fillers.length < CELLS - nTargets) {
      fillers.push(Math.random() < 0.5 && similar.length ? pick(similar) : pick(LETTERS).char);
    }
    const cells = shuffle([
      ...Array(nTargets).fill(l.char),
      ...fillers.map((c) => (c === l.char ? pick(LETTERS.filter((x) => x.char !== l.char)).char : c)),
    ]);
    return { target: l.char, cells };
  });
}

export default function FindLetterGame({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('find', TOTAL);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);

  const r = rounds[q.round];
  const totalTargets = r.cells.filter((c) => c === r.target).length;
  const letter = LETTER_BY_CHAR[r.target];

  useEffect(() => {
    setFound(new Set());
    if (!q.done) speak(letter.name);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (i: number) => {
    if (found.has(i) || found.size === totalTargets) return;
    if (r.cells[i] === r.target) {
      const nf = new Set(found).add(i);
      setFound(nf);
      if (nf.size === totalTargets) {
        q.good();
        setTimeout(q.next, 1300);
      }
    } else {
      setShakeIdx(i);
      setTimeout(() => setShakeIdx(null), 450);
      q.bad();
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gFindTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gFindTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div key={q.round} className="anim-pop flex items-center justify-center gap-4 mb-2">
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl text-white text-6xl sm:text-7xl font-bold font-hebrew flex items-center justify-center shadow-[0_6px_0_#c23f84]"
          style={{ background: ACCENT }}
        >
          {r.target}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg sm:text-xl font-semibold">{t.findAsk(r.target)}</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-hebrew" dir="rtl">{letter.name}</span>
            <SpeakButton text={letter.name} size="sm" />
          </div>
          <p className="text-sm opacity-70">
            {t.left}: <span className="font-bold tabular-nums">{totalTargets - found.size}</span>
          </p>
        </div>
      </div>

      <Feedback kind={q.feedback} id={q.fbId} />

      <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-lg mx-auto w-full" dir="rtl">
        {r.cells.map((c, i) => {
          const isFound = found.has(i);
          return (
            <button
              key={`${q.round}-${i}`}
              onClick={() => tap(i)}
              className={`chunky aspect-square text-4xl sm:text-5xl font-bold font-hebrew flex items-center justify-center ${
                isFound ? 'bg-[#ffe6f2] border-[#ef5da8]' : 'bg-white border-[#f3dbe7]'
              } ${shakeIdx === i ? 'anim-shake bg-rose-100' : ''}`}
              style={{ ['--chunk' as string]: isFound ? '#c23f84' : '#efd3e1' }}
            >
              <span className="relative">
                {c}
                {isFound && (
                  <span
                    className="absolute -inset-3 sm:-inset-4 rounded-full border-[3px] anim-pop"
                    style={{ borderColor: ACCENT }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
