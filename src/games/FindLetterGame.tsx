import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { FINAL_LETTERS, LETTERS, LETTER_BY_CHAR } from '../data/letters';
import { DAGESH_PAIRS, KAMATZ, PATACH, VOWEL_SYL_LETTERS, vowelSylName } from '../data/sheets';
import { pick, sample, shuffle } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { juice } from '../lib/juice';
import { say } from '../lib/audio';

const TOTAL = 6;
const CELLS = 20;
const ACCENT = '#ef5da8';

interface Round {
  target: string;
  name: string; // lo que se dice: nombre de la letra, "בֵּית דְּגוּשָׁה", "גִּימֶל קָמָץ"…
  cells: string[];
}

function fill(target: string, nTargets: number, filler: () => string): Round['cells'] {
  const fillers: string[] = [];
  while (fillers.length < CELLS - nTargets) {
    const c = filler();
    if (c !== target) fillers.push(c);
  }
  return shuffle([...Array(nTargets).fill(target), ...fillers]);
}

// Como en la hoja: "הַקִּיפוּ כׇּל אוֹת א" en una fila de letras mezcladas.
function letterRound(l: (typeof LETTERS)[number]): Round {
  const similar = l.similar.filter((c) => LETTER_BY_CHAR[c]);
  return {
    target: l.char,
    name: l.name,
    cells: fill(l.char, 5 + Math.floor(Math.random() * 3), () =>
      Math.random() < 0.5 && similar.length ? pick(similar) : pick(LETTERS).char,
    ),
  };
}

// Hojas 5, 37, 39: "הַקִּיפוּ כׇּל אוֹת בֵּית דְּגוּשָׁה / בֵּית רָפָה".
function dageshRound(): Round {
  const d = pick(DAGESH_PAIRS);
  const withDagesh = Math.random() < 0.5;
  const others = DAGESH_PAIRS.filter((x) => x !== d).flatMap((x) => [x.with, x.without]);
  return {
    target: withDagesh ? d.with : d.without,
    name: withDagesh ? d.withName : d.withoutName,
    cells: fill(withDagesh ? d.with : d.without, 5 + Math.floor(Math.random() * 2), () =>
      Math.random() < 0.6 ? (withDagesh ? d.without : d.with) : pick(others),
    ),
  };
}

// Hoja 37: "הַקִּיפוּ כׇּל אוֹת ך" entre letras parecidas.
const FINAL_LOOKALIKE: Record<string, string[]> = {
  'ך': ['כ', 'ר', 'ד', 'ן'],
  'ם': ['מ', 'ס', 'ט'],
  'ן': ['נ', 'ו', 'ז', 'ך'],
  'ף': ['פ', 'כ', 'ך'],
  'ץ': ['צ', 'ע', 'ג'],
};
function finalRound(): Round {
  const f = pick(FINAL_LETTERS);
  return {
    target: f.char,
    name: f.name,
    cells: fill(f.char, 5 + Math.floor(Math.random() * 2), () => pick(FINAL_LOOKALIKE[f.char])),
  };
}

// Hojas 8, 12, 16, 18: "הַקִּיפוּ כׇּל בָּ בְּכָחֹל וְכׇל בַּ בְּיָרֹק" — letra con קָמָץ o פַּתָּח.
function vowelRound(): Round {
  const l = pick(VOWEL_SYL_LETTERS);
  const mark = Math.random() < 0.5 ? KAMATZ : PATACH;
  const other = mark === KAMATZ ? PATACH : KAMATZ;
  const target = l.char + mark;
  const near = VOWEL_SYL_LETTERS.filter((x) => x !== l).map((x) => x.char);
  return {
    target,
    name: vowelSylName(l.name, mark),
    cells: fill(target, 5 + Math.floor(Math.random() * 2), () => {
      const r = Math.random();
      if (r < 0.45) return l.char + other;
      return pick(near) + (r < 0.75 ? mark : other);
    }),
  };
}

function makeRounds(): Round[] {
  const letters = sample(LETTERS, 3).map(letterRound);
  return [letters[0], letters[1], dageshRound(), letters[2], finalRound(), vowelRound()];
}

export default function FindLetterGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('find', TOTAL);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);

  const r = rounds[q.round];
  const totalTargets = r.cells.filter((c) => c === r.target).length;

  useEffect(() => {
    setFound(new Set());
    if (!q.done) void say(SAY.findAsk, r.name);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (i: number) => {
    if (found.has(i) || found.size === totalTargets) return;
    if (r.cells[i] === r.target) {
      const nf = new Set(found).add(i);
      setFound(nf);
      juice.collect();
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
          <p className="text-lg sm:text-xl font-semibold">{t.findAsk} {r.target}</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-hebrew" dir="rtl">{r.name}</span>
            <SpeakButton text={[SAY.findAsk, r.name]} size="sm" />
          </div>
          <div className="flex gap-1.5 mt-1" aria-hidden>
            {Array.from({ length: totalTargets }, (_, i) => (
              <span
                key={i}
                className="w-3.5 h-3.5 rounded-full border-2 transition"
                style={{ borderColor: ACCENT, background: i < found.size ? ACCENT : 'transparent' }}
              />
            ))}
          </div>
        </div>
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

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
