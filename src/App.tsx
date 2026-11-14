import { useEffect, useRef, useState, ComponentType } from 'react';
import { Lock, Play, Star } from 'lucide-react';
import { t, SAY } from './strings';
import { Stars } from './components/ui';
import { loadProgress } from './lib/progress';
import { preload, say, stopAudio, unlockAudio } from './lib/audio';
import { allPhrases } from './audio/phrases';
import { enterFullscreen, exitFullscreen, lockDown } from './lib/kiosk';
import { sfx } from './lib/sfx';
import LettersGame from './games/LettersGame';
import FirstLetterGame from './games/FirstLetterGame';
import FindLetterGame from './games/FindLetterGame';
import InWordGame from './games/InWordGame';
import VowelsGame from './games/VowelsGame';
import WritingGame from './games/WritingGame';
import SpeechPartsGame from './games/SpeechPartsGame';

interface GameDef {
  id: string;
  title: string;
  glyph: string;
  color: string;
  edge: string;
  Component: ComponentType<{ onBack: () => void }>;
}

const GAMES: GameDef[] = [
  { id: 'letters', title: t.gLettersTitle, glyph: 'א', color: '#ff8a3d', edge: '#c85d1d', Component: LettersGame },
  { id: 'first', title: t.gFirstTitle, glyph: '🐫', color: '#4f7cff', edge: '#2b4fb8', Component: FirstLetterGame },
  { id: 'find', title: t.gFindTitle, glyph: 'ב', color: '#ef5da8', edge: '#c23f84', Component: FindLetterGame },
  { id: 'inword', title: t.gInWordTitle, glyph: '🔍', color: '#8b5cf6', edge: '#6a3fd1', Component: InWordGame },
  { id: 'vowels', title: t.gVowelsTitle, glyph: 'אַ', color: '#2bb673', edge: '#1f8f58', Component: VowelsGame },
  { id: 'write', title: t.gWriteTitle, glyph: '✏️', color: '#f5b014', edge: '#c98c00', Component: WritingGame },
  { id: 'parts', title: t.gPartsTitle, glyph: '📚', color: '#14b8c4', edge: '#0e8a93', Component: SpeechPartsGame },
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(loadProgress);
  const unlockRef = useRef<(() => void) | null>(null);

  const goMenu = () => {
    stopAudio();
    setProgress(loadProgress());
    setActive(null);
  };

  const start = () => {
    unlockAudio();
    preload(allPhrases().map((p) => p.text)); // ~1,5 MB: todas las voces listas sin demora
    enterFullscreen();
    unlockRef.current?.();
    unlockRef.current = lockDown(goMenu);
    setStarted(true);
    void say(SAY.welcome);
  };

  const parentExit = () => {
    unlockRef.current?.();
    unlockRef.current = null;
    stopAudio();
    exitFullscreen();
    setActive(null);
    setStarted(false);
  };

  useEffect(() => () => unlockRef.current?.(), []);

  if (!started) return <StartScreen onStart={start} />;

  const game = GAMES.find((g) => g.id === active);
  if (game) {
    const { Component } = game;
    return <Component onBack={goMenu} />;
  }

  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-full">
      <div className="max-w-4xl mx-auto px-4 pt-5 pb-10">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-bold text-amber-600 text-xl" dir="ltr">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
              <span className="tabular-nums">{totalStars}</span>
            </div>
            <ParentExit onExit={parentExit} />
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              onClick={() => {
                sfx.tap();
                setActive(g.id);
              }}
              className="chunky anim-pop bg-white p-4 flex flex-col items-center gap-3"
              style={{
                borderColor: '#efe3cf',
                ['--chunk' as string]: '#eadcc3',
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-6xl font-bold font-hebrew text-white"
                style={{ background: g.color, boxShadow: `0 5px 0 ${g.edge}` }}
                aria-hidden
              >
                {g.glyph}
              </div>
              <div className="text-lg sm:text-xl font-bold text-center leading-tight">{g.title}</div>
              <Stars n={progress[g.id] ?? 0} size="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="scale-150 mb-4">
        <Logo />
      </div>
      <div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">{t.appTitle}</h1>
        <p className="text-xl opacity-70 mt-2">{t.appSubtitle}</p>
      </div>
      <button
        onClick={onStart}
        aria-label={t.start}
        className="chunky anim-floaty w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#2bb673] border-[#1f8f58] text-white flex flex-col items-center justify-center gap-1"
        style={{ ['--chunk' as string]: '#1a7a4b' }}
      >
        <Play className="w-20 h-20 fill-white -scale-x-100" />
        <span className="text-xl font-bold">{t.start}</span>
      </button>
    </div>
  );
}

/** Botón para adultos: hay que mantenerlo apretado 3 segundos para salir. */
function ParentExit({ onExit }: { onExit: () => void }) {
  const HOLD = 3000;
  const [pct, setPct] = useState(0);
  const timer = useRef<number | null>(null);
  const startAt = useRef(0);

  const cancel = () => {
    if (timer.current) cancelAnimationFrame(timer.current);
    timer.current = null;
    setPct(0);
  };
  const tick = () => {
    const p = Math.min(1, (performance.now() - startAt.current) / HOLD);
    setPct(p);
    if (p >= 1) {
      cancel();
      onExit();
    } else timer.current = requestAnimationFrame(tick);
  };
  const begin = (e: React.PointerEvent) => {
    e.preventDefault();
    startAt.current = performance.now();
    timer.current = requestAnimationFrame(tick);
  };

  return (
    <button
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      aria-label={t.parentHold}
      title={t.parentHold}
      className="relative w-11 h-11 rounded-full flex items-center justify-center text-[#c9bba2] touch-none"
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r="19" fill="none" stroke="#efe3cf" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r="19"
          fill="none"
          stroke="#ff8a3d"
          strokeWidth="3"
          strokeDasharray={2 * Math.PI * 19}
          strokeDashoffset={(1 - pct) * 2 * Math.PI * 19}
        />
      </svg>
      <Lock className="w-5 h-5" />
    </button>
  );
}

function Logo() {
  return (
    <div className="relative w-16 h-16 shrink-0 me-2" aria-hidden dir="rtl">
      <div className="absolute inset-0 rotate-[-8deg] rounded-2xl bg-[#ff8a3d] shadow-[0_4px_0_#c85d1d] flex items-center justify-center text-4xl font-extrabold text-white font-hebrew">
        א
      </div>
      <div className="absolute -bottom-2 -start-2 w-9 h-9 rotate-[10deg] rounded-xl bg-[#4f7cff] shadow-[0_3px_0_#2b4fb8] flex items-center justify-center text-xl font-extrabold text-white font-hebrew">
        ב
      </div>
    </div>
  );
}
