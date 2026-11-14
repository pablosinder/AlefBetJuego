import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EndScreen, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { WORDS } from '../data/words';
import { LETTERS, LETTER_BY_CHAR, FINAL_LETTERS } from '../data/letters';
import { pick, sample, stripNiqqud } from '../lib/hebrew';
import { say } from '../lib/audio';
import { sfx } from '../lib/sfx';
import { cheer } from '../lib/cheer';
import { saveStars, starsFor } from '../lib/progress';

// Arcade: caen letras y hay que atraparlas con la canasta en el orden de la palabra.

const WORDS_PER_GAME = 5;
const ACCENT = '#7c3aed';
const BUBBLE_COLORS = ['#ff8a3d', '#4f7cff', '#ef5da8', '#2bb673', '#f5b014', '#14b8c4', '#8b5cf6'];

/** Palabras cortas (2–4 letras), ideales para una nena de 5 años. */
const SHORT_WORDS = WORDS.filter((w) => {
  const n = [...stripNiqqud(w.he)].length;
  return n >= 2 && n <= 4;
});

const ALL_CHARS = [...LETTERS.map((l) => l.char), ...FINAL_LETTERS.map((l) => l.char)];
const letterName = (c: string) =>
  LETTER_BY_CHAR[c]?.name ?? FINAL_LETTERS.find((f) => f.char === c)?.name ?? c;

interface Falling {
  id: number;
  char: string;
  x: number; // 0..1 (centro, fracción del ancho)
  y: number; // px desde arriba
  color: string;
  wobble: number;
  state: 'fall' | 'caught' | 'wrong';
  t: number; // tiempo desde que cambió de estado (ms)
}

export default function CatchLettersGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const words = useMemo(() => sample(SHORT_WORDS, WORDS_PER_GAME), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [wordIdx, setWordIdx] = useState(0);
  const [filled, setFilled] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [done, setDone] = useState(false);
  const [stars, setStars] = useState(0);
  const [, setFrame] = useState(0);

  const word = words[wordIdx];
  const letters = useMemo(() => [...stripNiqqud(word.he)], [word]);

  // Estado del juego en refs (se actualiza en cada cuadro sin re-crear el bucle).
  const arenaRef = useRef<HTMLDivElement>(null);
  const items = useRef<Falling[]>([]);
  const basketX = useRef(0.5);
  const nextId = useRef(1);
  const spawnIn = useRef(600);
  const filledRef = useRef(0);
  const lettersRef = useRef(letters);
  const pausedRef = useRef(true);
  const caughtOk = useRef(0);
  const caughtBad = useRef(0);
  const speedRef = useRef(1);

  lettersRef.current = letters;
  filledRef.current = filled;

  // Empezar cada palabra.
  useEffect(() => {
    if (done) return;
    items.current = [];
    setFilled(0);
    filledRef.current = 0;
    setCelebrating(false);
    speedRef.current = 1 + wordIdx * 0.12;
    pausedRef.current = true;
    void (wordIdx === 0 ? say(SAY.catchAsk, word.he) : say(word.he));
    // Empieza a caer enseguida; la explicación sigue sonando.
    const timer = setTimeout(() => (pausedRef.current = false), wordIdx === 0 ? 1200 : 600);
    return () => clearTimeout(timer);
  }, [wordIdx, seed, done]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishWord = useCallback(() => {
    pausedRef.current = true;
    setCelebrating(true);
    sfx.win();
    void say(word.he, cheer.praise());
    setTimeout(() => {
      if (wordIdx + 1 >= WORDS_PER_GAME) {
        const s = starsFor(caughtOk.current, caughtBad.current);
        setStars(s);
        saveStars('catch', s);
        setDone(true);
      } else {
        setWordIdx((i) => i + 1);
      }
    }, 2600);
  }, [word, wordIdx]);

  // Bucle principal.
  useEffect(() => {
    if (done) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const arena = arenaRef.current;
      if (arena && !document.hidden) {
        const H = arena.clientHeight;
        const W = arena.clientWidth;
        const bubble = Math.min(84, W * 0.17);
        const basketY = H - bubble * 1.15; // línea donde se atrapa
        const basketHalf = Math.max(bubble * 0.95, W * 0.12);
        const fallSpeed = (H / 5200) * speedRef.current; // px por ms

        if (!pausedRef.current) {
          // Nuevas letras
          spawnIn.current -= dt;
          const need = lettersRef.current[filledRef.current];
          const falling = items.current.filter((i) => i.state === 'fall');
          if (need && spawnIn.current <= 0 && falling.length < 4) {
            const needOnScreen = falling.some((i) => i.char === need);
            const char =
              !needOnScreen || Math.random() < 0.4
                ? need
                : pick(ALL_CHARS.filter((c) => c !== need));
            // Lejos de la última letra para que no se encimen.
            let x = 0.12 + Math.random() * 0.76;
            const prev = items.current[items.current.length - 1];
            if (prev && Math.abs(prev.x - x) < 0.2) x = x > 0.5 ? x - 0.3 : x + 0.3;
            items.current.push({
              id: nextId.current++,
              char,
              x,
              y: -bubble,
              color: pick(BUBBLE_COLORS),
              wobble: Math.random() * Math.PI * 2,
              state: 'fall',
              t: 0,
            });
            spawnIn.current = (1100 + Math.random() * 500) / speedRef.current;
          }
        }

        for (const it of items.current) {
          it.t += dt;
          if (it.state !== 'fall') continue;
          if (pausedRef.current) continue;
          it.y += fallSpeed * dt;
          // ¿Llegó a la canasta?
          if (it.y >= basketY - bubble * 0.5 && it.y <= basketY + bubble * 0.2) {
            const dx = Math.abs(it.x * W - basketX.current * W);
            if (dx < basketHalf) {
              const need = lettersRef.current[filledRef.current];
              if (it.char === need) {
                it.state = 'caught';
                it.t = 0;
                caughtOk.current++;
                const nf = filledRef.current + 1;
                filledRef.current = nf;
                setFilled(nf);
                sfx.correct();
                if (nf >= lettersRef.current.length) finishWord();
                else void say(letterName(it.char));
              } else {
                it.state = 'wrong';
                it.t = 0;
                caughtBad.current++;
                sfx.wrong();
              }
            }
          }
        }
        // Quitar las que salieron de la pantalla o terminaron su animación.
        items.current = items.current.filter(
          (it) => !(it.state === 'fall' && it.y > H + bubble) && !(it.state !== 'fall' && it.t > 450),
        );
      }
      setFrame((f) => (f + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [done, finishWord]);

  // Mover la canasta con el dedo o el mouse (en cualquier parte de la pantalla de juego).
  const moveTo = (clientX: number) => {
    const r = arenaRef.current?.getBoundingClientRect();
    if (!r) return;
    basketX.current = Math.min(0.94, Math.max(0.06, (clientX - r.left) / r.width));
  };

  // Teclado (flechas) para jugar en computadora.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') basketX.current = Math.max(0.06, basketX.current - 0.08);
      if (e.key === 'ArrowRight') basketX.current = Math.min(0.94, basketX.current + 0.08);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (done) {
    return (
      <GameShell title={t.gCatchTitle} onBack={onBack} accent={ACCENT}>
        <EndScreen
          stars={stars}
          correct={caughtOk.current}
          total={caughtOk.current + caughtBad.current}
          onAgain={() => {
            caughtOk.current = 0;
            caughtBad.current = 0;
            setWordIdx(0);
            setDone(false);
            setSeed((s) => s + 1);
          }}
          onMenu={onBack}
        />
      </GameShell>
    );
  }

  const arena = arenaRef.current;
  const W = arena?.clientWidth ?? 360;
  const H = arena?.clientHeight ?? 500;
  const bubble = Math.min(84, W * 0.17);

  return (
    <GameShell title={t.gCatchTitle} onBack={onBack} accent={ACCENT} progress={{ current: wordIdx, total: WORDS_PER_GAME }}>
      {/* La palabra a armar */}
      <div className="flex items-center justify-center gap-3 -mt-1 mb-3">
        <button onClick={() => void say(word.he)} className="text-5xl sm:text-6xl" aria-label={t.listen}>
          {word.emoji}
        </button>
        <div className="flex gap-1.5 sm:gap-2" dir="rtl">
          {letters.map((c, i) => {
            const got = i < filled;
            const next = i === filled && !celebrating;
            return (
              <div
                key={`${wordIdx}-${i}`}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-[3px] flex items-center justify-center text-4xl sm:text-5xl font-bold font-hebrew transition ${
                  got
                    ? 'bg-[#7c3aed] border-[#6d28d9] text-white anim-pop'
                    : next
                      ? 'bg-white border-[#7c3aed] border-dashed text-[#7c3aed]/45 animate-pulse'
                      : 'bg-white border-[#e4dcf7] text-[#7c3aed]/30'
                }`}
              >
                {c}
              </div>
            );
          })}
        </div>
        <SpeakButton text={[SAY.catchAsk, word.he]} size="sm" />
      </div>

      {/* Zona de juego */}
      <div
        ref={arenaRef}
        className="relative flex-1 min-h-[420px] rounded-3xl overflow-hidden touch-none select-none border-2 border-[#e4dcf7]"
        style={{ background: 'linear-gradient(180deg, #eef2ff 0%, #f5f0ff 55%, #fff7ed 100%)' }}
        onPointerDown={(e) => moveTo(e.clientX)}
        onPointerMove={(e) => moveTo(e.clientX)}
      >
        {/* nubes decorativas */}
        <div className="absolute top-6 left-6 text-4xl opacity-60 anim-floaty" aria-hidden>☁️</div>
        <div className="absolute top-16 right-10 text-3xl opacity-50 anim-floaty" style={{ animationDelay: '1s' }} aria-hidden>☁️</div>

        {items.current.map((it) => {
          const wob = Math.sin(it.wobble + it.y / 40) * 6;
          const style: React.CSSProperties = {
            width: bubble,
            height: bubble,
            left: it.x * W - bubble / 2 + wob,
            top: it.y - bubble / 2,
            background: it.color,
            fontSize: bubble * 0.62,
          };
          if (it.state === 'caught') {
            style.transform = `scale(${1 + it.t / 300})`;
            style.opacity = Math.max(0, 1 - it.t / 450);
          } else if (it.state === 'wrong') {
            style.transform = `translateY(${-it.t / 4}px) rotate(${it.t / 3}deg)`;
            style.opacity = Math.max(0, 1 - it.t / 450);
            style.filter = 'grayscale(0.7)';
          }
          return (
            <div
              key={it.id}
              className="absolute rounded-full text-white font-bold font-hebrew flex items-center justify-center shadow-[inset_0_-6px_0_rgba(0,0,0,0.15),0_4px_10px_rgba(0,0,0,0.12)] pointer-events-none"
              style={style}
            >
              {it.char}
            </div>
          );
        })}

        {/* Canasta */}
        <div
          className="absolute pointer-events-none flex items-end justify-center"
          style={{
            left: basketX.current * W - bubble * 1.1,
            top: H - bubble * 1.55,
            width: bubble * 2.2,
            height: bubble * 1.5,
            fontSize: bubble * 1.35,
            lineHeight: 1,
          }}
          aria-hidden
        >
          🧺
        </div>

        {celebrating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 anim-pop">
            <div className="text-8xl">{word.emoji}</div>
            <div className="text-6xl font-bold font-hebrew mt-2" style={{ color: ACCENT }} dir="rtl">
              {word.he}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
