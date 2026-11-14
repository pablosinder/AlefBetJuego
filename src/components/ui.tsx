import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Volume2, Star, RotateCcw, Home } from 'lucide-react';
import { t } from '../strings';
import { cheer } from '../lib/cheer';
import { say } from '../lib/audio';
import { sfx } from '../lib/sfx';

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
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 bg-[#fff8ee]/90 backdrop-blur border-b border-[#efe3cf]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label={t.back}
            className="chunky bg-white border-[#e8dcc6] p-2"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex-1 truncate">{title}</h1>
          {progress && (
            <div className="text-sm font-semibold tabular-nums opacity-70" dir="ltr">
              {Math.min(progress.current + 1, progress.total)} / {progress.total}
            </div>
          )}
        </div>
        {progress && (
          <div className="h-1.5 bg-[#efe3cf]">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
                background: accent,
              }}
            />
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

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.4,
        dx: (Math.random() - 0.5) * 30,
        color: ['#ff8a3d', '#4f7cff', '#2bb673', '#ffcb2e', '#ef5da8', '#8b5cf6'][i % 6],
        w: 6 + Math.random() * 6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.w * 1.6,
            background: p.color,
            ['--dx' as string]: `${p.dx}vw`,
            animation: `confetti ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
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
  useEffect(() => {
    sfx.win();
    void say(text);
  }, [text]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-10">
      <Confetti />
      <div className="text-7xl anim-floaty">🏆</div>
      <h2 className="text-3xl sm:text-4xl font-extrabold anim-pop px-4">{text}</h2>
      <Stars n={stars} size="w-12 h-12" />
      <p className="text-2xl font-bold opacity-70 tabular-nums" dir="ltr">{correct} / {total}</p>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        <button
          onClick={onAgain}
          className="chunky bg-[#4f7cff] border-[#3d66e0] text-white px-6 py-3 text-lg font-bold flex items-center gap-2"
          style={{ ['--chunk' as string]: '#2b4fb8' }}
        >
          <RotateCcw className="w-5 h-5" /> {t.playAgain}
        </button>
        <button
          onClick={onMenu}
          className="chunky bg-white border-[#e8dcc6] px-6 py-3 text-lg font-bold flex items-center gap-2"
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
      className={`h-10 flex items-center justify-center text-xl font-bold anim-pop ${
        kind === 'good' ? 'text-emerald-600' : 'text-rose-600'
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
