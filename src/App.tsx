import { useEffect, useRef, useState, ComponentType } from 'react';
import { Lock, LogOut, Music, Play, RotateCcw, Star, VolumeX, X } from 'lucide-react';
import { t, SAY } from './strings';
import { Stars } from './components/ui';
import { loadProgress, resetProgress } from './lib/progress';
import { preload, say, stopAudio, unlockAudio } from './lib/audio';
import { allPhrases } from './audio/phrases';
import { enterFullscreen, exitFullscreen, lockDown } from './lib/kiosk';
import { sfx } from './lib/sfx';
import { fx } from './lib/fx';
import { music } from './lib/music';
import { rewards, STICKERS, useRewards } from './lib/rewards';
import { Backdrop, GemCounter, LevelBadge, RewardLayer, StickerAlbum } from './components/rewards';
import LettersGame from './games/LettersGame';
import FirstLetterGame from './games/FirstLetterGame';
import FindLetterGame from './games/FindLetterGame';
import InWordGame from './games/InWordGame';
import VowelsGame from './games/VowelsGame';
import WritingGame from './games/WritingGame';
import SpeechPartsGame from './games/SpeechPartsGame';
import CompleteWordGame from './games/CompleteWordGame';
import ConnectGame from './games/ConnectGame';
import CatchLettersGame from './games/CatchLettersGame';

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
  { id: 'complete', title: t.gCompleteTitle, glyph: 'אַ_', color: '#e8590c', edge: '#b8460a', Component: CompleteWordGame },
  { id: 'connect', title: t.gConnectTitle, glyph: '🔗', color: '#0ea5e9', edge: '#0369a1', Component: ConnectGame },
  { id: 'catch', title: t.gCatchTitle, glyph: '🧺', color: '#7c3aed', edge: '#5b21b6', Component: CatchLettersGame },
  { id: 'parts', title: t.gPartsTitle, glyph: '📚', color: '#14b8c4', edge: '#0e8a93', Component: SpeechPartsGame },
];

// Chispitas y "pop" en cada botón que se toca.
fx.init(() => sfx.tap());

export default function App() {
  return (
    <>
      <Backdrop />
      <Screens />
      <RewardLayer />
    </>
  );
}

function Screens() {
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(loadProgress);
  const [parentOpen, setParentOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(music.isEnabled);
  const rw = useRewards();
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
    rewards.touchDay();
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

  // Música solo en el menú: dentro de los juegos mandan las voces.
  useEffect(() => {
    music.want(started && !active);
    return () => music.want(false);
  }, [started, active]);

  if (!started) return <StartScreen onStart={start} />;

  const game = GAMES.find((g) => g.id === active);
  if (game) {
    const { Component } = game;
    return <Component onBack={goMenu} />;
  }

  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
  // Próximo juego sugerido: el primero que todavía no tiene las 3 estrellas.
  const suggested = GAMES.find((g) => (progress[g.id] ?? 0) < 3)?.id;

  return (
    <div className="min-h-full">
      <div className="max-w-4xl mx-auto px-4 pt-5 pb-10">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo />
            <h1 className="candy-text text-3xl sm:text-4xl tracking-tight truncate">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMusicOn(music.toggle())}
              aria-label={t.music}
              aria-pressed={musicOn}
              className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${
                musicOn ? 'bg-[#ef5da8] border-[#c23f84] text-white' : 'bg-white border-[#e8dcc6] text-[#c9bba2]'
              }`}
            >
              {musicOn ? <Music className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <ParentLock onOpen={() => setParentOpen(true)} />
          </div>
        </header>

        {/* Tablero de premios: nivel, gemas, estrellas, días seguidos y álbum */}
        <div className="anim-pop mt-4 rounded-3xl bg-white/80 backdrop-blur border-2 border-[#f3e4cc] shadow-[0_5px_0_#f0dcbc] p-3 flex items-center gap-3 flex-wrap">
          <LevelBadge />
          <GemCounter />
          <div
            className="flex items-center gap-1 rounded-full bg-white/90 border-2 border-[#fde9a8] px-2.5 py-1 font-extrabold text-amber-600 shadow-[0_3px_0_#f6dc8a]"
            dir="ltr"
          >
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <span className="tabular-nums">{totalStars}</span>
          </div>
          {rw.dayStreak >= 2 && (
            <div
              className="flex items-center gap-1 rounded-full bg-white/90 border-2 border-[#ffd3bf] px-2.5 py-1 font-extrabold text-[#e8590c] shadow-[0_3px_0_#ffc2a6]"
              dir="ltr"
            >
              <span className="anim-flame" aria-hidden>🔥</span>
              <span className="tabular-nums">{rw.dayStreak}</span>
            </div>
          )}
          <button
            onClick={() => setAlbumOpen(true)}
            aria-label={t.album}
            className="chunky bg-[#fff4d6] border-[#ffd98a] px-3 py-1.5 font-extrabold flex items-center gap-1.5"
            style={{ ['--chunk' as string]: '#f0c668' }}
            dir="ltr"
          >
            <span className="text-2xl anim-wiggle" aria-hidden>📒</span>
            <span className="tabular-nums text-[#b77700]">
              {rw.stickers.length}/{STICKERS.length}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {GAMES.map((g, i) => {
            const stars = progress[g.id] ?? 0;
            const isNext = g.id === suggested;
            return (
              <button
                key={g.id}
                onClick={() => {
                  sfx.whoosh();
                  setActive(g.id);
                }}
                className={`chunky card-shine anim-pop bg-white p-4 flex flex-col items-center gap-3 ${isNext ? 'card-next' : ''}`}
                style={{
                  borderColor: isNext ? g.color : '#efe3cf',
                  ['--chunk' as string]: isNext ? g.edge : '#eadcc3',
                  ['--glow' as string]: g.color,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div
                  className="glyph-bob relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-6xl font-bold font-hebrew text-white"
                  style={{
                    background: `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.55) 0 10%, rgba(255,255,255,0) 34%), ${g.color}`,
                    boxShadow: `0 6px 0 ${g.edge}`,
                    animationDelay: `${-i * 0.37}s`,
                  }}
                  aria-hidden
                >
                  {g.glyph}
                  {stars === 3 && <span className="absolute -top-3 -end-3 text-3xl anim-wiggle">👑</span>}
                  {isNext && <span className="absolute -bottom-3 -start-3 text-3xl anim-tap-hint">👆</span>}
                </div>
                <div className="text-lg sm:text-xl font-bold text-center leading-tight">{g.title}</div>
                <Stars n={stars} size="w-6 h-6" />
              </button>
            );
          })}
        </div>
      </div>
      {albumOpen && <StickerAlbum onClose={() => setAlbumOpen(false)} />}
      {parentOpen && (
        <ParentMenu
          onClose={() => setParentOpen(false)}
          onExit={() => {
            setParentOpen(false);
            parentExit();
          }}
          onReset={() => {
            rewards.reset();
            setProgress(resetProgress());
          }}
        />
      )}
    </div>
  );
}

/** Menú de padres: salir del juego o borrar las estrellas (con confirmación). */
function ParentMenu({ onClose, onExit, onReset }: { onClose: () => void; onExit: () => void; onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={t.parentMenu}
        className="anim-pop bg-white rounded-3xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6" /> {t.parentMenu}
          </h2>
          <button onClick={onClose} aria-label={t.parentBack} className="p-2 rounded-full hover:bg-black/5">
            <X className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={() => {
            if (!confirming) return setConfirming(true);
            onReset();
            setConfirming(false);
            setResetDone(true);
          }}
          className={`chunky px-4 py-3 text-lg font-bold flex items-center gap-3 ${
            confirming ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-[#e8dcc6]'
          }`}
          style={{ ['--chunk' as string]: confirming ? '#be123c' : '#d9cdb8' }}
        >
          <RotateCcw className="w-6 h-6 shrink-0" />
          <span className="text-start">{confirming ? t.parentResetConfirm : t.parentReset}</span>
        </button>
        {resetDone && <p className="text-emerald-600 font-semibold text-center anim-pop">{t.parentResetDone} ✓</p>}

        <button
          onClick={onExit}
          className="chunky bg-white border-[#e8dcc6] px-4 py-3 text-lg font-bold flex items-center gap-3"
        >
          <LogOut className="w-6 h-6 shrink-0 -scale-x-100" /> {t.parentExit}
        </button>

        <button
          onClick={onClose}
          className="chunky bg-[#2bb673] border-[#1f8f58] text-white px-4 py-3 text-lg font-bold"
          style={{ ['--chunk' as string]: '#1a7a4b' }}
        >
          {t.parentBack}
        </button>
      </div>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  const deco = ['⭐', '🎈', '💎', '🍭', '🌈', '🎁'];
  return (
    <div className="relative min-h-full flex flex-col items-center justify-center gap-8 p-6 text-center overflow-hidden">
      {deco.map((d, i) => (
        <span
          key={d}
          className="absolute text-4xl sm:text-5xl anim-floaty"
          style={{
            top: `${[10, 18, 68, 78, 8, 60][i]}%`,
            left: `${[8, 80, 6, 84, 45, 48][i]}%`,
            animationDelay: `${-i * 0.6}s`,
            opacity: 0.85,
          }}
          aria-hidden
        >
          {d}
        </span>
      ))}
      <div className="scale-150 mb-4 anim-pop">
        <Logo />
      </div>
      <div>
        <h1 className="candy-text text-6xl sm:text-7xl tracking-tight anim-title">{t.appTitle}</h1>
        <p className="text-xl font-semibold opacity-70 mt-3">{t.appSubtitle}</p>
      </div>
      <div className="relative">
        <span className="pulse-ring" aria-hidden />
        <span className="pulse-ring" style={{ animationDelay: '0.9s' }} aria-hidden />
        <button
          onClick={onStart}
          aria-label={t.start}
          className="chunky anim-play relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[#1f8f58] text-white flex flex-col items-center justify-center gap-1"
          style={{
            background:
              'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.5) 0 9%, rgba(255,255,255,0) 32%), linear-gradient(160deg,#4fdc94,#1fa565)',
            ['--chunk' as string]: '#1a7a4b',
          }}
        >
          <Play className="w-20 h-20 fill-white -scale-x-100" />
          <span className="text-xl font-bold">{t.start}</span>
        </button>
      </div>
    </div>
  );
}

/** Botón para adultos: hay que mantenerlo apretado 3 segundos para abrir el menú de padres. */
function ParentLock({ onOpen }: { onOpen: () => void }) {
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
      onOpen();
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
