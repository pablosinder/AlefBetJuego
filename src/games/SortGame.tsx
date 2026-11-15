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

const TOTAL = 5;
const PER = 3; // dibujos por canasta
const ACCENT = '#0891b2';
const EDGE = '#0e6f86';
const BASKET_COLORS = [
  { bg: '#e0f2fe', border: '#38bdf8', edge: '#0284c7' },
  { bg: '#fef3c7', border: '#fbbf24', edge: '#d97706' },
];

interface Round {
  where: Where;
  letters: [string, string];
  cards: { word: Word; basket: 0 | 1 }[];
}

// Hojas 7, 10, 15: "חַבְּרוּ לְפִי הַהֲבָרָה הַנִּשְׁמַעַת" — cada dibujo va a la canasta de su sonido.
function makeRounds(): Round[] {
  return Array.from({ length: TOTAL }, (_, i) => {
    const where: Where = i % 2 === 0 ? 'start' : 'end';
    const f = test(where);
    const [a, b] = sample(lettersWith(where, PER), 2);
    const pickFor = (c: string) =>
      sample(
        WORDS.filter((w) => f(w.he, c) && !f(w.he, c === a ? b : a)),
        PER,
      );
    return {
      where,
      letters: [a, b],
      cards: shuffle([
        ...pickFor(a).map((word) => ({ word, basket: 0 as const })),
        ...pickFor(b).map((word) => ({ word, basket: 1 as const })),
      ]),
    };
  });
}

export default function SortGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('sort', TOTAL);
  const r = rounds[q.round];
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const ask = r.where === 'start' ? SAY.sortStartAsk : SAY.sortEndAsk;

  useEffect(() => {
    setPlaced(new Set());
    setSelected(null);
    if (!q.done) void say(ask);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickCard = (i: number) => {
    if (placed.has(i)) return;
    setSelected(i);
    void say(r.cards[i].word.he);
  };

  const drop = (b: 0 | 1) => {
    if (selected === null) {
      void say(LETTER_BY_CHAR[r.letters[b]].name);
      return;
    }
    const card = r.cards[selected];
    if (card.basket === b) {
      const next = new Set(placed).add(selected);
      setPlaced(next);
      setSelected(null);
      juice.collect();
      if (next.size === r.cards.length) {
        q.good();
        setTimeout(q.next, 1500);
      }
    } else {
      const i = selected;
      setShake(i);
      setTimeout(() => setShake(null), 450);
      setSelected(null);
      q.bad(card.word.he);
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gSortTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gSortTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-full px-3 py-0.5 text-white font-bold text-lg" style={{ background: EDGE }}>
          {r.where === 'start' ? t.atStart : t.atEnd}
        </span>
        <p className="text-lg sm:text-xl font-semibold">{ask}</p>
        <SpeakButton text={ask} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      {/* Dibujos por clasificar */}
      <div key={q.round} className="anim-pop grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 min-h-[7rem]" dir="rtl">
        {r.cards.map((c, i) =>
          placed.has(i) ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => pickCard(i)}
              className={`chunky p-2 flex flex-col items-center gap-1 ${shake === i ? 'anim-shake' : ''} ${
                selected === i ? 'scale-110' : ''
              }`}
              style={{
                background: selected === i ? '#ecfeff' : '#fff',
                borderColor: selected === i ? ACCENT : '#eadfcf',
                ['--chunk' as string]: selected === i ? EDGE : '#e2d6c2',
              }}
            >
              <span className="text-5xl" aria-hidden>
                {c.word.emoji}
              </span>
              <span className="text-xl font-bold font-hebrew">{c.word.he}</span>
            </button>
          ),
        )}
      </div>

      {/* Canastas */}
      <div className="grid grid-cols-2 gap-4 mt-6" dir="rtl">
        {r.letters.map((l, b) => {
          const col = BASKET_COLORS[b];
          const inside = r.cards.filter((c, i) => placed.has(i) && c.basket === b);
          return (
            <button
              key={l}
              onClick={() => drop(b as 0 | 1)}
              className={`chunky p-3 flex flex-col items-center gap-2 min-h-[12rem] ${selected !== null ? 'anim-pulse-soft' : ''}`}
              style={{ background: col.bg, borderColor: col.border, ['--chunk' as string]: col.edge }}
            >
              <div className="flex items-center gap-2">
                <span className="text-4xl" aria-hidden>
                  🧺
                </span>
                <span className="text-6xl font-bold font-hebrew" style={{ color: col.edge }}>
                  {l}
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {inside.map((c) => (
                  <span key={c.word.he} className="text-4xl anim-pop" aria-label={c.word.he}>
                    {c.word.emoji}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
