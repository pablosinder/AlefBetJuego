// Juego genérico de "marcar los dibujos que cumplen": lo usan "מתחילה או מסתיימת" y "שומעים או לא".
import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { EndScreen, Feedback, GameShell, PrimaryButton, SpeakButton } from '../components/ui';
import { t } from '../strings';
import { Word } from '../data/words';
import { LETTER_BY_CHAR } from '../data/letters';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';

export interface MarkRound {
  target: string; // letra
  ask: string; // frase de la consigna (se dice antes del nombre de la letra)
  badge?: string; // etiqueta corta en pantalla (p. ej. "בַּהַתְחָלָה")
  words: Word[];
  isYes: (w: Word) => boolean;
}

export default function PicMarkGame({
  id,
  title,
  accent,
  edge,
  soft,
  total,
  showText,
  makeRounds,
  onBack,
}: {
  id: string;
  title: string;
  accent: string;
  edge: string;
  soft: string;
  total: number;
  /** Mostrar la palabra escrita (false = solo con el oído). */
  showText: boolean;
  makeRounds: () => MarkRound[];
  onBack: () => void;
}) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz(id, total);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);

  const r = rounds[q.round];
  const letterName = LETTER_BY_CHAR[r.target]?.name ?? r.target;

  useEffect(() => {
    setMarked(new Set());
    setErrors(new Set());
    setSolved(false);
    if (!q.done) void say(r.ask, letterName);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (i: number) => {
    if (solved) return;
    const m = new Set(marked);
    if (m.has(i)) m.delete(i);
    else m.add(i);
    setMarked(m);
    setErrors(new Set());
    if (!marked.has(i)) void say(r.words[i].he);
  };

  const check = () => {
    const wrong = new Set<number>();
    r.words.forEach((w, i) => {
      if (r.isYes(w) !== marked.has(i)) wrong.add(i);
    });
    if (wrong.size === 0) {
      setSolved(true);
      q.good();
      setTimeout(q.next, 1500);
    } else {
      setErrors(wrong);
      q.bad();
    }
  };

  if (q.done) {
    return (
      <GameShell title={title} onBack={onBack} accent={accent}>
        <EndScreen
          stars={q.stars}
          correct={q.correct}
          total={total}
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
    <GameShell title={title} onBack={onBack} accent={accent} progress={{ current: q.round, total }}>
      <div key={q.round} className="anim-pop flex items-center justify-center gap-4">
        <div
          className="w-20 h-20 shrink-0 rounded-3xl text-white text-5xl font-bold font-hebrew flex items-center justify-center"
          style={{ background: accent, boxShadow: `0 6px 0 ${edge}` }}
        >
          {r.target}
        </div>
        <div className="flex flex-col items-start gap-1">
          {r.badge && (
            <span className="rounded-full px-3 py-0.5 text-white font-bold text-lg" style={{ background: edge }}>
              {r.badge}
            </span>
          )}
          <p className="text-lg sm:text-xl font-semibold">
            {r.ask} {r.target}
          </p>
        </div>
        <SpeakButton text={[r.ask, letterName]} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4" dir="rtl">
        {r.words.map((w, i) => {
          const on = marked.has(i);
          const err = errors.has(i);
          return (
            <div
              key={`${q.round}-${i}`}
              role="button"
              tabIndex={0}
              onClick={() => toggle(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(i)}
              className={`chunky relative cursor-pointer p-3 flex flex-col items-center gap-2 ${
                err ? 'anim-shake !border-rose-400 !bg-rose-50' : ''
              }`}
              style={{
                background: on ? soft : '#fff',
                borderColor: on ? accent : '#eadfcf',
                ['--chunk' as string]: on ? edge : '#e2d6c2',
              }}
            >
              {on && (
                <span
                  className="absolute top-2 start-2 w-7 h-7 rounded-full text-white flex items-center justify-center anim-pop"
                  style={{ background: accent }}
                >
                  <Check className="w-5 h-5" />
                </span>
              )}
              <div className={`text-6xl sm:text-7xl transition ${on ? '' : 'grayscale-[30%]'}`} aria-hidden>
                {w.emoji}
              </div>
              {showText ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-hebrew rounded-lg px-2 border-2" style={{ borderColor: `${accent}66` }}>
                    {w.he}
                  </span>
                  <SpeakButton text={w.he} size="sm" />
                </div>
              ) : (
                <SpeakButton text={w.he} size="md" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={check} disabled={solved} color={accent} edge={edge}>
          <Check className="w-6 h-6" /> {t.check}
        </PrimaryButton>
      </div>
    </GameShell>
  );
}
