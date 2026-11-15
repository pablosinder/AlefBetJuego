import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { EndScreen, Feedback, GameShell, PrimaryButton, SpeakButton, Stars } from '../components/ui';
import { t, SAY } from '../strings';
import { LETTERS, Letter } from '../data/letters';
import { WORDS } from '../data/words';
import { LETTER_SHAPES } from '../data/sheets';
import { firstClusterLength, pick, sample, shuffle } from '../lib/hebrew';
import { startsWith } from '../lib/sounds';
import { loadProgress, saveStars } from '../lib/progress';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';
import { juice } from '../lib/juice';

const ACCENT = '#10b981';
const EDGE = '#047857';
const key = (c: string) => `path-${c}`;

// Las hojas siguen el orden del alefbet: cada letra tiene su hoja de lectura y su hoja de sonidos.
// Acá cada letra es una parada: se aprende, se busca y se escucha. La siguiente se abre al terminar.
export default function PathGame({ onBack }: { onBack: () => void }) {
  const [letter, setLetter] = useState<Letter | null>(null);
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    if (!letter) void say(SAY.pathAsk);
  }, [letter]);

  if (letter) {
    return (
      <Unit
        letter={letter}
        onBack={() => {
          const p = loadProgress();
          const done = LETTERS.filter((l) => (p[key(l.char)] ?? 0) > 0).length;
          if (done) saveStars('path', done >= LETTERS.length ? 3 : done >= LETTERS.length / 2 ? 2 : 1);
          setProgress(loadProgress());
          setLetter(null);
        }}
      />
    );
  }

  return (
    <GameShell title={t.gPathTitle} onBack={onBack} accent={ACCENT}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-lg sm:text-xl font-semibold">{t.pathAsk}</p>
        <SpeakButton text={SAY.pathAsk} size="sm" />
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3" dir="rtl">
        {LETTERS.map((l, i) => {
          const stars = progress[key(l.char)] ?? 0;
          const open = i === 0 || (progress[key(LETTERS[i - 1].char)] ?? 0) > 0 || stars > 0;
          const isNext = open && stars === 0;
          return (
            <button
              key={l.char}
              onClick={() => (open ? setLetter(l) : void say(SAY.pathAsk))}
              className={`chunky anim-pop relative aspect-square flex flex-col items-center justify-center gap-1 ${
                isNext ? 'card-next' : ''
              }`}
              style={{
                background: stars ? '#d1fae5' : open ? '#fff' : '#f3efe7',
                borderColor: isNext ? ACCENT : stars ? '#6ee7b7' : '#e8dcc6',
                ['--chunk' as string]: isNext ? EDGE : stars ? '#34d399' : '#dccfb8',
                ['--glow' as string]: ACCENT,
                animationDelay: `${i * 30}ms`,
              }}
            >
              <span className={`text-4xl sm:text-5xl font-bold font-hebrew ${open ? '' : 'opacity-30'}`}>{l.char}</span>
              {open ? <Stars n={stars} size="w-3.5 h-3.5" /> : <Lock className="w-4 h-4 opacity-40" />}
              {isNext && <span className="absolute -bottom-2 -start-2 text-2xl anim-tap-hint">👆</span>}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}

const FIND_CELLS = 12;
const PICS = 4;

function Unit({ letter, onBack }: { letter: Letter; onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const [learning, setLearning] = useState(true);
  const q = useQuiz(key(letter.char), 2);
  const shape = LETTER_SHAPES[letter.char];

  const cells = useMemo(() => {
    const n = 4;
    const fillers = Array.from({ length: FIND_CELLS - n }, () =>
      Math.random() < 0.5 ? pick(letter.similar) : pick(LETTERS.filter((x) => x.char !== letter.char)).char,
    ).map((c) => (c === letter.char ? (letter.char === 'א' ? 'ב' : 'א') : c));
    return shuffle([...Array(n).fill(letter.char), ...fillers]);
  }, [letter, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const pics = useMemo(() => {
    const yes = WORDS.filter((w) => startsWith(w.he, letter.char));
    const no = WORDS.filter((w) => !startsWith(w.he, letter.char));
    const nYes = Math.min(2, yes.length);
    return shuffle([...sample(yes, nYes), ...sample(no, PICS - nYes)]);
  }, [letter, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const [found, setFound] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState<number | null>(null);

  useEffect(() => {
    if (learning) void say(SAY.pathLearn, letter.name, letter.word, shape);
  }, [learning, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFound(new Set());
    if (learning || q.done) return;
    if (q.round === 0) void say(SAY.findAsk, letter.name);
    else void say(SAY.startAsk, letter.name);
  }, [q.round, learning, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const nTargets = q.round === 0 ? cells.filter((c) => c === letter.char).length : pics.filter((w) => startsWith(w.he, letter.char)).length;

  const hit = (i: number, ok: boolean, word?: string) => {
    if (found.has(i) || q.feedback === 'good') return;
    if (word) void say(word);
    if (ok) {
      const nf = new Set(found).add(i);
      setFound(nf);
      juice.collect();
      if (nf.size === nTargets) {
        q.good();
        setTimeout(q.next, 1400);
      }
    } else {
      setShake(i);
      setTimeout(() => setShake(null), 450);
      q.bad();
    }
  };

  const title = `${t.gPathTitle} · ${letter.char}`;

  if (q.done) {
    return (
      <GameShell title={title} onBack={onBack} accent={ACCENT}>
        <EndScreen
          stars={q.stars}
          correct={q.correct}
          total={2}
          onAgain={() => {
            q.reset();
            setLearning(true);
            setSeed((s) => s + 1);
          }}
          onMenu={onBack}
        />
      </GameShell>
    );
  }

  if (learning) {
    const n = firstClusterLength(letter.word);
    return (
      <GameShell title={title} onBack={onBack} accent={ACCENT} progress={{ current: 0, total: 3 }}>
        <section className="anim-pop bg-white rounded-3xl border-2 border-[#cdeedd] shadow-[0_6px_0_#b5e3cb] p-5 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-6" dir="rtl">
            <div className="text-[8rem] leading-none font-bold font-hebrew" style={{ color: ACCENT }}>
              {letter.char}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-7xl anim-floaty" aria-hidden>
                {letter.emoji}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-hebrew" dir="rtl">
                  <span style={{ color: ACCENT }}>{letter.word.slice(0, n)}</span>
                  {letter.word.slice(n)}
                </span>
                <SpeakButton text={letter.word} size="sm" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-hebrew">{letter.name}</span>
            <SpeakButton text={letter.name} size="sm" />
          </div>
          {shape && (
            <div className="flex items-center gap-2 bg-[#ecfdf5] rounded-2xl px-4 py-3">
              <p className="text-xl font-semibold font-hebrew" dir="rtl">
                {shape}
              </p>
              <SpeakButton text={shape} size="sm" />
            </div>
          )}
        </section>
        <div className="mt-6">
          <PrimaryButton onClick={() => setLearning(false)} color={ACCENT} edge={EDGE}>
            <ArrowLeft className="w-6 h-6" />
          </PrimaryButton>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title={title} onBack={onBack} accent={ACCENT} progress={{ current: q.round + 1, total: 3 }}>
      <div className="flex items-center justify-center gap-3">
        <div
          className="w-16 h-16 shrink-0 rounded-2xl text-white text-4xl font-bold font-hebrew flex items-center justify-center"
          style={{ background: ACCENT, boxShadow: `0 5px 0 ${EDGE}` }}
        >
          {letter.char}
        </div>
        <p className="text-lg sm:text-xl font-semibold">
          {q.round === 0 ? t.findAsk : t.startAsk} {letter.char}
        </p>
        <SpeakButton text={[q.round === 0 ? SAY.findAsk : SAY.startAsk, letter.name]} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      {q.round === 0 ? (
        <div key="find" className="anim-pop grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto w-full" dir="rtl">
          {cells.map((c, i) => (
            <button
              key={i}
              onClick={() => hit(i, c === letter.char)}
              className={`chunky aspect-square text-5xl font-bold font-hebrew flex items-center justify-center ${
                shake === i ? 'anim-shake bg-rose-100' : ''
              }`}
              style={{
                background: found.has(i) ? '#d1fae5' : '#fff',
                borderColor: found.has(i) ? ACCENT : '#e3efe8',
                ['--chunk' as string]: found.has(i) ? EDGE : '#cfe3d8',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <div key="pics" className="anim-pop grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto w-full" dir="rtl">
          {pics.map((w, i) => (
            <button
              key={w.he}
              onClick={() => hit(i, startsWith(w.he, letter.char), w.he)}
              className={`chunky p-3 flex flex-col items-center gap-1 ${shake === i ? 'anim-shake bg-rose-100' : ''}`}
              style={{
                background: found.has(i) ? '#d1fae5' : '#fff',
                borderColor: found.has(i) ? ACCENT : '#e3efe8',
                ['--chunk' as string]: found.has(i) ? EDGE : '#cfe3d8',
              }}
            >
              <span className="text-6xl" aria-hidden>
                {w.emoji}
              </span>
              <span className="text-2xl font-bold font-hebrew">{w.he}</span>
            </button>
          ))}
        </div>
      )}
    </GameShell>
  );
}
