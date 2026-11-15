import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { WORDS, Word } from '../data/words';
import { LETTER_BY_CHAR } from '../data/letters';
import { sample, shuffle } from '../lib/hebrew';
import { lettersWith, test, Where } from '../lib/sounds';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';
import { juice } from '../lib/juice';

const TOTAL = 4;
const ROWS = 4;
const COLS = 4;
const ACCENT = '#ca8a04';
const EDGE = '#a16207';
const POOL = WORDS.filter((w) => w.emoji !== '🐭' && w.emoji !== '🧀');

interface Round {
  where: Where;
  target: string;
  cells: (Word | null)[]; // null = inicio o queso
  path: Set<number>;
  start: number;
  end: number;
}

// Hoja 41: "צִבְעוּ מַסְלוּל שֶׁיְּאַפְשֵׁר לְעַכְבָּר לְהַגִּיעַ לַגְּבִינָה" — se pasa solo por
// dibujos que terminan (o empiezan) con la letra.
function makeRound(where: Where, avoid: Set<string>): Round {
  const need = ROWS + COLS - 3; // casillas del camino sin contar inicio y fin
  const f = test(where);
  const options = lettersWith(where, need, POOL).filter((c) => !avoid.has(c));
  const target = shuffle(options)[0];
  // Camino: desde arriba a la derecha hasta abajo a la izquierda, moviéndose a la izquierda o abajo.
  const at = (r: number, c: number) => r * COLS + c;
  let r = 0;
  let c = COLS - 1;
  const order = [at(r, c)];
  while (r < ROWS - 1 || c > 0) {
    if (r === ROWS - 1) c--;
    else if (c === 0) r++;
    else if (Math.random() < 0.5) c--;
    else r++;
    order.push(at(r, c));
  }
  const start = order[0];
  const end = order[order.length - 1];
  const middle = order.slice(1, -1);
  const yes = sample(
    POOL.filter((w) => f(w.he, target)),
    middle.length,
  );
  const no = sample(
    POOL.filter((w) => !test('start')(w.he, target) && !test('end')(w.he, target)),
    ROWS * COLS - order.length,
  );
  const cells: (Word | null)[] = Array(ROWS * COLS).fill(null);
  middle.forEach((i, j) => (cells[i] = yes[j]));
  let k = 0;
  for (let i = 0; i < cells.length; i++) if (i !== start && i !== end && !middle.includes(i)) cells[i] = no[k++];
  return { where, target, cells, path: new Set(order), start, end };
}

function makeRounds(): Round[] {
  const used = new Set<string>();
  return Array.from({ length: TOTAL }, (_, i) => {
    const where: Where = i % 2 === 0 ? 'start' : 'end';
    const canEnd = lettersWith('end', ROWS + COLS - 3, POOL).some((c) => !used.has(c));
    const r = makeRound(where === 'end' && !canEnd ? 'start' : where, used);
    used.add(r.target);
    return r;
  });
}

export default function MazeGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('maze', TOTAL);
  const r = rounds[q.round];
  const [pos, setPos] = useState(r.start);
  const [trail, setTrail] = useState<number[]>([r.start]);
  const [shake, setShake] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const ask = r.where === 'start' ? SAY.mazeStartAsk : SAY.mazeEndAsk;
  const letterName = LETTER_BY_CHAR[r.target].name;
  const f = test(r.where);

  useEffect(() => {
    setPos(r.start);
    setTrail([r.start]);
    setWon(false);
    if (!q.done) void say(ask, letterName);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const near = (a: number, b: number) => {
    const [ar, ac] = [Math.floor(a / COLS), a % COLS];
    const [br, bc] = [Math.floor(b / COLS), b % COLS];
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
  };

  const tap = (i: number) => {
    if (won || trail.includes(i)) return;
    const w = r.cells[i];
    if (!near(pos, i)) {
      if (w) void say(w.he);
      return;
    }
    if (i === r.end) {
      setPos(i);
      setTrail((tr) => [...tr, i]);
      setWon(true);
      q.good();
      setTimeout(q.next, 2000);
      return;
    }
    if (w && f(w.he, r.target)) {
      setPos(i);
      setTrail((tr) => [...tr, i]);
      juice.collect();
      void say(w.he);
    } else if (w) {
      setShake(i);
      setTimeout(() => setShake(null), 450);
      q.bad(w.he);
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gMazeTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gMazeTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-3">
        <div
          className="w-16 h-16 shrink-0 rounded-2xl text-white text-4xl font-bold font-hebrew flex items-center justify-center"
          style={{ background: ACCENT, boxShadow: `0 5px 0 ${EDGE}` }}
        >
          {r.target}
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="rounded-full px-3 py-0.5 text-white font-bold" style={{ background: EDGE }}>
            {r.where === 'start' ? t.atStart : t.atEnd}
          </span>
          <p className="text-base sm:text-lg font-semibold">{ask}</p>
        </div>
        <SpeakButton text={[ask, letterName]} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div
        key={q.round}
        className="anim-pop grid gap-2 sm:gap-3 mx-auto w-full max-w-md p-3 rounded-3xl bg-[#fdf6e3] border-2 border-[#eedcae]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        dir="ltr"
      >
        {r.cells.map((w, i) => {
          const here = pos === i;
          const been = trail.includes(i);
          const canGo = !won && near(pos, i) && !been;
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              className={`chunky relative aspect-square flex flex-col items-center justify-center ${
                shake === i ? 'anim-shake !bg-rose-100' : ''
              }`}
              style={{
                background: been ? '#fde68a' : '#fff',
                borderColor: canGo ? ACCENT : been ? '#f59e0b' : '#eadfcf',
                ['--chunk' as string]: been ? '#d97706' : '#e2d6c2',
              }}
            >
              {i === r.end ? (
                <span className="text-5xl" aria-hidden>
                  🧀
                </span>
              ) : w ? (
                <>
                  <span className={`text-4xl sm:text-5xl ${been ? 'opacity-40' : ''}`} aria-hidden>
                    {w.emoji}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-hebrew leading-tight">{w.he}</span>
                </>
              ) : null}
              {here && <span className="absolute inset-0 flex items-center justify-center text-5xl anim-pop">🐭</span>}
              {been && !here && i !== r.start && (
                <span className="absolute top-0.5 end-1 text-lg" aria-hidden>
                  🐾
                </span>
              )}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
