import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { WORDS, Word } from '../data/words';
import { LETTER_BY_CHAR } from '../data/letters';
import { firstLetter, sample, shuffle } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';
import { sfx } from '../lib/sfx';

const TOTAL = 5;
const PAIRS = 4;
const ACCENT = '#0ea5e9';

interface Round {
  words: Word[]; // columna de dibujos
  letters: string[]; // columna de letras (mezcladas)
}

// Basado en "חַבְּרוּ לְפִי הַהֲבָרָה הַנִּשְׁמַעַת": se une cada dibujo con su letra inicial.
function makeRounds(): Round[] {
  const byLetter = new Map<string, Word[]>();
  for (const w of WORDS) {
    const f = firstLetter(w.he);
    if (LETTER_BY_CHAR[f]) byLetter.set(f, [...(byLetter.get(f) ?? []), w]);
  }
  return Array.from({ length: TOTAL }, () => {
    const letters = sample([...byLetter.keys()], PAIRS);
    const words = letters.map((l) => sample(byLetter.get(l)!, 1)[0]);
    return { words, letters: shuffle(letters) };
  });
}

type Side = 'pic' | 'let';
interface Item {
  side: Side;
  idx: number;
}
interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function ConnectGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('connect', TOTAL);
  const r = rounds[q.round];

  // matched[picIdx] = letIdx
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<Item | null>(null);
  const [drag, setDrag] = useState<{ from: Item; x: number; y: number } | null>(null);
  const [badLine, setBadLine] = useState<Line | null>(null);
  const [, setLayoutTick] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const picRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const letRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const downAt = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMatched({});
    setSelected(null);
    setDrag(null);
    if (!q.done) void (q.round === 0 ? say(SAY.connectAsk) : Promise.resolve());
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recalcular líneas al cambiar el tamaño de la pantalla.
  useLayoutEffect(() => {
    const on = () => setLayoutTick((n) => n + 1);
    window.addEventListener('resize', on);
    on();
    return () => window.removeEventListener('resize', on);
  }, [q.round]);

  /** Punto de anclaje: el borde de cada tarjeta que mira hacia la otra columna. */
  const anchor = useCallback((it: Item) => {
    const box = boxRef.current?.getBoundingClientRect();
    const el = (it.side === 'pic' ? picRefs : letRefs).current[it.idx];
    if (!box || !el) return { x: 0, y: 0 };
    const b = el.getBoundingClientRect();
    // RTL: los dibujos están a la derecha, las letras a la izquierda.
    const x = it.side === 'pic' ? b.left - box.left : b.right - box.left;
    return { x, y: b.top - box.top + b.height / 2 };
  }, []);

  const lineBetween = (a: Item, b: Item): Line => {
    const p = anchor(a);
    const s = anchor(b);
    return { x1: p.x, y1: p.y, x2: s.x, y2: s.y };
  };

  const isDone = (it: Item) =>
    it.side === 'pic' ? it.idx in matched : Object.values(matched).includes(it.idx);

  const tryMatch = (a: Item, b: Item) => {
    if (a.side === b.side) return;
    const pic = a.side === 'pic' ? a : b;
    const let_ = a.side === 'let' ? a : b;
    if (isDone(pic) || isDone(let_)) return;
    const word = r.words[pic.idx];
    if (firstLetter(word.he) === r.letters[let_.idx]) {
      const nm = { ...matched, [pic.idx]: let_.idx };
      setMatched(nm);
      setSelected(null);
      if (Object.keys(nm).length === PAIRS) {
        q.good(word.he);
        setTimeout(q.next, 1800);
      } else {
        sfx.correct();
        void say(word.he);
      }
    } else {
      setBadLine(lineBetween(pic, let_));
      setTimeout(() => setBadLine(null), 650);
      setSelected(null);
      q.bad();
    }
  };

  const itemAt = (x: number, y: number): Item | null => {
    const el = document.elementFromPoint(x, y)?.closest('[data-side]') as HTMLElement | null;
    if (!el) return null;
    return { side: el.dataset.side as Side, idx: Number(el.dataset.idx) };
  };

  const onDown = (it: Item) => (e: React.PointerEvent) => {
    if (isDone(it)) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    downAt.current = { x: e.clientX, y: e.clientY };
    const box = boxRef.current!.getBoundingClientRect();
    setDrag({ from: it, x: e.clientX - box.left, y: e.clientY - box.top });
    if (it.side === 'pic') void say(r.words[it.idx].he);
    else void say(LETTER_BY_CHAR[r.letters[it.idx]].name);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const box = boxRef.current!.getBoundingClientRect();
    setDrag({ ...drag, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const onUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const from = drag.from;
    setDrag(null);
    const moved = downAt.current ? Math.hypot(e.clientX - downAt.current.x, e.clientY - downAt.current.y) : 0;
    const target = itemAt(e.clientX, e.clientY);
    if (moved > 12 && target && target.side !== from.side) return tryMatch(from, target);
    // Toque simple: seleccionar, o unir con lo ya seleccionado.
    if (selected && selected.side !== from.side) return tryMatch(selected, from);
    setSelected(selected && selected.side === from.side && selected.idx === from.idx ? null : from);
  };

  if (q.done) {
    return (
      <GameShell title={t.gConnectTitle} onBack={onBack} accent={ACCENT}>
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

  const lines = Object.entries(matched).map(([p, l]) =>
    lineBetween({ side: 'pic', idx: Number(p) }, { side: 'let', idx: l }),
  );
  const dragStart = drag ? anchor(drag.from) : null;

  const cardCls = (it: Item) => {
    const done = isDone(it);
    const sel = (selected && selected.side === it.side && selected.idx === it.idx) || (drag && drag.from.side === it.side && drag.from.idx === it.idx);
    return `chunky w-full h-full flex items-center justify-center touch-none ${
      done ? 'bg-emerald-50 border-emerald-400' : sel ? 'bg-[#e0f4fe] border-[#0ea5e9] scale-105' : 'bg-white border-[#d6ecf8]'
    }`;
  };

  return (
    <GameShell title={t.gConnectTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <p className="text-lg sm:text-xl font-semibold text-center">{t.connectAsk}</p>
        <SpeakButton text={SAY.connectAsk} size="sm" />
      </div>
      <Feedback kind={q.feedback} id={q.fbId} />

      <div
        ref={boxRef}
        key={q.round}
        className="anim-pop relative grid grid-cols-[1fr_1fr] gap-x-16 sm:gap-x-32 gap-y-3 max-w-lg mx-auto w-full select-none touch-none"
        dir="rtl"
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDrag(null)}
      >
        {r.words.map((w, i) => (
          <div key={`row-${i}`} className="contents">
            <div className="h-24 sm:h-28">
              <button
                ref={(el) => (picRefs.current[i] = el)}
                data-side="pic"
                data-idx={i}
                onPointerDown={onDown({ side: 'pic', idx: i })}
                className={cardCls({ side: 'pic', idx: i })}
                style={{ ['--chunk' as string]: '#c6e3f3' }}
              >
                <span className="text-6xl sm:text-7xl pointer-events-none">{w.emoji}</span>
              </button>
            </div>
            <div className="h-24 sm:h-28">
              <button
                ref={(el) => (letRefs.current[i] = el)}
                data-side="let"
                data-idx={i}
                onPointerDown={onDown({ side: 'let', idx: i })}
                className={cardCls({ side: 'let', idx: i })}
                style={{ ['--chunk' as string]: '#c6e3f3' }}
              >
                <span className="text-6xl sm:text-7xl font-bold font-hebrew pointer-events-none">{r.letters[i]}</span>
              </button>
            </div>
          </div>
        ))}

        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden>
          {lines.map((l, i) => (
            <g key={i}>
              <line {...l} stroke="#10b981" strokeWidth={7} strokeLinecap="round" />
              <circle cx={l.x1} cy={l.y1} r={7} fill="#10b981" />
              <circle cx={l.x2} cy={l.y2} r={7} fill="#10b981" />
            </g>
          ))}
          {badLine && <line {...badLine} stroke="#f43f5e" strokeWidth={7} strokeLinecap="round" strokeDasharray="10 10" />}
          {drag && dragStart && (
            <line x1={dragStart.x} y1={dragStart.y} x2={drag.x} y2={drag.y} stroke={ACCENT} strokeWidth={6} strokeLinecap="round" />
          )}
        </svg>
      </div>
    </GameShell>
  );
}
