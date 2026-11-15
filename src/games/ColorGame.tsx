import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { COLORS, PAINT_PICTURES, PaintPicture } from '../data/sheets';
import { LETTER_BY_CHAR } from '../data/letters';
import { sample } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';
import { juice } from '../lib/juice';
import { sfx } from '../lib/sfx';

const TOTAL = 3;
const ACCENT = '#14b86a';


// Casi todas las hojas terminan con "צִבְעוּ לְפִי הַהוֹרָאוֹת": cada zona tiene una letra
// y los crayones dicen qué color va con cada letra.
export default function ColorGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const pictures = useMemo(() => sample(PAINT_PICTURES, TOTAL), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('color', TOTAL);
  const pic = pictures[q.round];
  const [brush, setBrush] = useState<string | null>(null); // clave de la zona elegida
  const [painted, setPainted] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState<number | null>(null);

  const width = pic.rows[0].length;
  const cells = useMemo(() => pic.rows.join('').split(''), [pic]);
  const toPaint = cells.filter((c) => c !== '.').length;
  const keys = Object.keys(pic.key);

  useEffect(() => {
    setBrush(null);
    setPainted(new Set());
    if (!q.done) void say(SAY.colorAsk);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (k: string) => {
    setBrush(k);
    sfx.tap();
    const info = pic.key[k];
    void say(LETTER_BY_CHAR[info.letter].name, COLORS[info.color].name);
  };

  const tapCell = (i: number) => {
    const k = cells[i];
    if (k === '.' || painted.has(i) || q.feedback === 'good') return;
    if (!brush) {
      void say(SAY.colorAsk);
      return;
    }
    if (brush !== k) {
      setShake(i);
      setTimeout(() => setShake(null), 450);
      q.bad(LETTER_BY_CHAR[pic.key[k].letter].name);
      return;
    }
    const next = new Set(painted);
    for (const j of region(pic, i)) next.add(j);
    setPainted(next);
    juice.collect();
    if (next.size === toPaint) {
      q.good();
      setTimeout(q.next, 2200);
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gColorTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gColorTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-2">
        <p className="text-lg sm:text-xl font-semibold text-center">{t.colorAsk}</p>
        <SpeakButton text={SAY.colorAsk} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div key={q.round} className="anim-pop flex flex-col sm:flex-row-reverse items-center justify-center gap-5">
        {/* Crayones: letra → color */}
        <div className="flex sm:flex-col flex-wrap justify-center gap-2" dir="rtl">
          {keys.map((k) => {
            const info = pic.key[k];
            const color = COLORS[info.color];
            const on = brush === k;
            return (
              <button
                key={k}
                onClick={() => choose(k)}
                aria-label={`${info.letter} ${color.name}`}
                aria-pressed={on}
                className={`chunky flex items-center gap-2 ps-2 pe-3 py-1.5 ${on ? 'scale-110' : ''}`}
                style={{
                  background: on ? '#fffbe8' : '#fff',
                  borderColor: on ? color.hex : '#eadfcf',
                  ['--chunk' as string]: on ? '#d8c690' : '#e2d6c2',
                }}
              >
                <span className="text-3xl font-bold font-hebrew w-8 text-center">{info.letter}</span>
                <Crayon hex={color.hex} />
                <span className="font-bold text-base">{color.name}</span>
              </button>
            );
          })}
        </div>

        {/* El dibujo */}
        <div
          className="grid gap-[2px] p-2 bg-white rounded-2xl border-2 border-[#e5d9c4] shadow-[0_6px_0_#e9dbc2] w-full max-w-[min(96vw,28rem)]"
          style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
          dir="ltr"
        >
          {cells.map((k, i) => {
            if (k === '.') return <div key={i} className="aspect-square" />;
            const info = pic.key[k];
            const done = painted.has(i);
            return (
              <button
                key={i}
                onClick={() => tapCell(i)}
                aria-label={info.letter}
                className={`aspect-square rounded-[4px] flex items-center justify-center font-hebrew font-bold text-[clamp(0.8rem,3.6vw,1.15rem)] transition-colors duration-300 ${
                  shake === i ? 'anim-shake' : ''
                }`}
                style={{
                  background: done ? COLORS[info.color].hex : '#fbf7ef',
                  color: done ? 'transparent' : '#8a7a63',
                  border: done ? 'none' : '1px solid #e7dccb',
                }}
              >
                {info.letter}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center mt-4 font-bold opacity-60 tabular-nums" dir="ltr">
        {painted.size} / {toPaint}
      </p>
    </GameShell>
  );
}

/** Zona conectada (arriba, abajo, izquierda, derecha) con la misma letra. */
function region(pic: PaintPicture, start: number): number[] {
  const w = pic.rows[0].length;
  const h = pic.rows.length;
  const flat = pic.rows.join('');
  const k = flat[start];
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = Math.floor(i / w);
    const near = [
      x > 0 ? i - 1 : -1,
      x < w - 1 ? i + 1 : -1,
      y > 0 ? i - w : -1,
      y < h - 1 ? i + w : -1,
    ];
    for (const j of near) {
      if (j >= 0 && !seen.has(j) && flat[j] === k) {
        seen.add(j);
        stack.push(j);
      }
    }
  }
  return [...seen];
}

function Crayon({ hex }: { hex: string }) {
  return (
    <svg width="44" height="18" viewBox="0 0 44 18" aria-hidden>
      <path d="M2 5 L10 1 L10 17 L2 13 Z" fill={hex} stroke="#00000033" />
      <rect x="10" y="1" width="30" height="16" rx="3" fill={hex} stroke="#00000033" />
      <rect x="18" y="1" width="3" height="16" fill="#ffffff66" />
      <rect x="30" y="1" width="3" height="16" fill="#ffffff66" />
    </svg>
  );
}
