import { ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowRight, Volume2, Star, RotateCcw, Home } from 'lucide-react';
import { t } from '../strings';
import { cheer } from '../lib/cheer';
import { say } from '../lib/audio';
import { sfx } from '../lib/sfx';
import { fx } from '../lib/fx';
import { juice, useCombo } from '../lib/juice';
import { rewards } from '../lib/rewards';
import { GemCounter, GiftBox } from './rewards';

export function GameShell({
  title,
  onBack,
  accent,
  progress,
  children,
}: {
  title: string;
  onBack: () => void;
  accent: string; // color CSS
  progress?: { current: number; total: number };
  children: ReactNode;
}) {
  const combo = useCombo();
  // Cada juego empieza con la racha en cero.
  useEffect(() => juice.reset(), []);
  const pct = progress ? (progress.current / progress.total) * 100 : 0;
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 bg-[#fff8ee]/85 backdrop-blur border-b border-[#efe3cf]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label={t.back}
            className="chunky bg-white border-[#e8dcc6] p-2"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex-1 truncate">{title}</h1>
          {combo >= 2 && (
            <div
              key={combo}
              dir="ltr"
              className="anim-combo rounded-full px-2.5 py-1 font-extrabold text-white tabular-nums"
              style={{ background: 'linear-gradient(145deg,#ff8a3d,#ff3d77)', boxShadow: '0 3px 0 #c2255c' }}
              aria-hidden
            >
              🔥×{combo}
            </div>
          )}
          <GemCounter />
        </div>
        {progress && (
          <div className="max-w-3xl mx-auto px-4 pb-2.5" dir="ltr">
            <div className="relative h-4 rounded-full bg-[#efe3cf] border-2 border-white shadow-inner">
              <div
                className="h-full rounded-full candy-stripes transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, ['--stripe' as string]: accent }}
              />
              <span
                className="absolute top-1/2 text-xl transition-all duration-700 ease-out"
                style={{ left: `${pct}%`, transform: 'translate(-50%, -55%)' }}
                aria-hidden
              >
                ⭐
              </span>
              <span className="absolute top-1/2 -right-1 text-xl" style={{ transform: 'translateY(-55%)' }} aria-hidden>
                🏁
              </span>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5 flex flex-col">{children}</main>
    </div>
  );
}

export function SpeakButton({
  text,
  size = 'md',
  className = '',
}: {
  text: string | string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims = { sm: 'w-9 h-9', md: 'w-12 h-12', lg: 'w-16 h-16' }[size];
  const icon = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <button
      type="button"
      aria-label={t.listen}
      onClick={(e) => {
        e.stopPropagation();
        void say(...(Array.isArray(text) ? text : [text]));
      }}
      className={`chunky ${dims} shrink-0 rounded-full bg-[#ff8a3d] border-[#e8702a] text-white flex items-center justify-center ${className}`}
      style={{ ['--chunk' as string]: '#c85d1d' }}
    >
      <Volume2 className={icon} />
    </button>
  );
}

export function Stars({ n, size = 'w-6 h-6' }: { n: number; size?: string }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`${size} ${i < n ? 'fill-amber-400 text-amber-500' : 'text-[#e2d5bd]'}`}
        />
      ))}
    </div>
  );
}

export function EndScreen({
  stars,
  correct,
  total,
  onAgain,
  onMenu,
}: {
  stars: number;
  correct: number;
  total: number;
  onAgain: () => void;
  onMenu: () => void;
}) {
  const [text] = useState(cheer.finished);
  const [shown, setShown] = useState(0); // estrellas ya entregadas
  const [score, setScore] = useState(0); // el puntaje sube contando
  const [giftReady, setGiftReady] = useState(false);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    juice.win();
    void say(text);
    // Las estrellas caen de a una, cada una con su campanita.
    for (let i = 0; i < stars; i++) {
      setTimeout(() => {
        setShown(i + 1);
        sfx.star(i);
        const r = starRefs.current[i]?.getBoundingClientRect();
        if (r) {
          const x = r.left + r.width / 2;
          const y = r.top + r.height / 2;
          fx.ring(x, y, '#ffcb2e', 70);
          fx.burst(x, y, { count: 16, colors: ['#ffcb2e', '#ffe58a', '#ff8a3d', '#ffffff'] });
        }
      }, 700 + i * 480);
    }
    const after = 700 + stars * 480;
    // Premio en gemas por las estrellas.
    setTimeout(() => {
      if (stars > 0) {
        const r = starRefs.current[1]?.getBoundingClientRect();
        const p = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : fx.origin();
        rewards.addGems(stars * 5);
        fx.floatText(p.x, p.y + 50, `+${stars * 5} 💎`, { size: 34 });
        fx.flyTo(p, document.querySelector('[data-gem-target]'), '💎', 4, () => sfx.gem());
      }
      if (correct > 0) {
        setGiftReady(true);
        sfx.whoosh();
      }
    }, after + 250);
    // Contador de aciertos.
    const steps = Math.max(1, correct);
    for (let i = 1; i <= steps; i++) {
      setTimeout(() => setScore(Math.round((correct * i) / steps)), 300 + (i * 900) / steps);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-6">
      <div className="relative">
        <div className="rays absolute -inset-12" aria-hidden />
        <div className="relative text-7xl anim-trophy">🏆</div>
      </div>
      <h2 className="candy-text text-4xl sm:text-5xl anim-pop px-4">{text}</h2>
      <div className="flex gap-2 items-end" dir="ltr">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => (starRefs.current[i] = el)}
            className={i === 1 ? 'mb-3' : ''}
          >
            <Star
              className={`${i === 1 ? 'w-20 h-20' : 'w-16 h-16'} ${
                i < shown ? 'fill-amber-400 text-amber-500 anim-star-slam' : 'text-[#e2d5bd] fill-[#f3eada]'
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-2xl font-extrabold opacity-70 tabular-nums" dir="ltr">{score} / {total}</p>
      <div className="h-44 flex items-center justify-center">
        {giftReady && (
          <div className="anim-pop">
            <GiftBox />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onAgain}
          className="chunky anim-pulse-soft bg-[#4f7cff] border-[#3d66e0] text-white px-7 py-4 text-xl font-bold flex items-center gap-2"
          style={{ ['--chunk' as string]: '#2b4fb8' }}
        >
          <RotateCcw className="w-6 h-6" /> {t.playAgain}
        </button>
        <button
          onClick={onMenu}
          className="chunky bg-white border-[#e8dcc6] px-6 py-4 text-lg font-bold flex items-center gap-2"
        >
          <Home className="w-5 h-5" /> {t.toMenu}
        </button>
      </div>
    </div>
  );
}

/** Mensaje breve de acierto / error. */
export function Feedback({ kind, id, text }: { kind: 'good' | 'bad' | null; id: number; text?: string }) {
  if (!kind) return <div className="h-10" />;
  return (
    <div
      key={id}
      className={`h-10 flex items-center justify-center font-extrabold ${
        kind === 'good' ? 'candy-text text-3xl anim-praise' : 'text-xl text-rose-500 anim-pop'
      }`}
      role="status"
    >
      {text || (kind === 'good' ? t.great : t.tryAgain)}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  color = '#2bb673',
  edge = '#1f8f58',
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  edge?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="chunky text-white px-8 py-3 text-xl font-bold mx-auto flex items-center gap-2"
      style={{ background: color, borderColor: edge, ['--chunk' as string]: edge }}
    >
      {children}
    </button>
  );
}
