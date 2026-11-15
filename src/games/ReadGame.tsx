import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { SYL_WORDS, SylWord, sylWord } from '../data/sheets';
import { clusters, sample, shuffle } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';
import { juice } from '../lib/juice';

const TOTAL = 8;
const ACCENT = '#6366f1';
const EDGE = '#4338ca';

type Round =
  | { kind: 'read'; word: SylWord; he: string; options: SylWord[] }
  | { kind: 'spell'; word: SylWord; he: string; parts: string[]; tiles: string[] };

// Hojas 35 y 50: "קוֹרְאִים מִיָּמִין לִשְׂמֹאל בִּשְׁלַבִּים" y "כִּתְבוּ אֶת הַמִּלָּה הַמַּתְאִימָה לְכׇל צִיּוּר".
// Se alternan: leer por partes y elegir el dibujo / armar la palabra del dibujo.
function makeRounds(): Round[] {
  const words = shuffle(SYL_WORDS);
  return words.slice(0, TOTAL).map((word, i) => {
    const he = sylWord(word);
    if (i % 2 === 0) {
      const others = sample(
        SYL_WORDS.filter((w) => w !== word && w.emoji !== word.emoji),
        2,
      );
      return { kind: 'read', word, he, options: shuffle([word, ...others]) };
    }
    const parts = clusters(he);
    const extra = shuffle(
      SYL_WORDS.filter((w) => w !== word)
        .flatMap((w) => clusters(sylWord(w)))
        .filter((c) => !parts.includes(c)),
    ).slice(0, 2);
    return { kind: 'spell', word, he, parts, tiles: shuffle([...parts.map((p, j) => `${j}|${p}`), ...extra.map((p, j) => `x${j}|${p}`)]) };
  });
}

export default function ReadGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('read', TOTAL);
  const r = rounds[q.round];

  if (q.done) {
    return (
      <GameShell title={t.gReadTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gReadTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      {r.kind === 'read' ? (
        <ReadRound key={`${seed}-${q.round}`} r={r} q={q} />
      ) : (
        <SpellRound key={`${seed}-${q.round}`} r={r} q={q} />
      )}
    </GameShell>
  );
}

type Q = ReturnType<typeof useQuiz>;

function ReadRound({ r, q }: { r: Extract<Round, { kind: 'read' }>; q: Q }) {
  const [lit, setLit] = useState(0); // sílabas ya leídas
  const [wrong, setWrong] = useState<SylWord[]>([]);
  const [solved, setSolved] = useState(false);
  const allRead = lit === r.word.syl.length;

  useEffect(() => {
    void say(SAY.readAsk);
  }, []);

  const tapSyl = (i: number) => {
    if (i !== lit) {
      if (i > lit) void say(SAY.readAsk);
      else void say(r.word.syl[i]);
      return;
    }
    const n = lit + 1;
    setLit(n);
    juice.collect();
    if (n === r.word.syl.length) void say(r.word.syl[i], r.he, SAY.readPick);
    else void say(r.word.syl[i]);
  };

  const pickPic = (w: SylWord) => {
    if (!allRead || solved || wrong.includes(w)) return;
    if (w === r.word) {
      setSolved(true);
      q.good(r.he);
      setTimeout(q.next, 1800);
    } else {
      setWrong((x) => [...x, w]);
      q.bad(sylWord(w));
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <p className="text-lg sm:text-xl font-semibold text-center">{allRead ? t.readPick : t.readAsk}</p>
        <SpeakButton text={allRead ? [r.he, SAY.readPick] : SAY.readAsk} size="sm" />
      </div>
      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div className="anim-pop flex justify-center gap-2 sm:gap-3" dir="rtl">
        {r.word.syl.map((s, i) => {
          const on = i < lit;
          const next = i === lit;
          return (
            <button
              key={i}
              onClick={() => tapSyl(i)}
              className={`chunky min-w-[4.5rem] px-3 py-3 text-5xl sm:text-6xl font-bold font-hebrew ${next ? 'anim-pulse-soft' : ''}`}
              style={{
                background: on ? ACCENT : '#fff',
                color: on ? '#fff' : undefined,
                borderColor: on ? EDGE : next ? ACCENT : '#e3defc',
                ['--chunk' as string]: on ? '#312e81' : '#d6d0f7',
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div
        className={`text-center mt-4 text-5xl font-bold font-hebrew transition-opacity ${allRead ? 'opacity-100' : 'opacity-0'}`}
        dir="rtl"
      >
        {r.he}
      </div>

      <div className={`grid grid-cols-3 gap-3 mt-5 transition-opacity ${allRead ? '' : 'opacity-30 pointer-events-none'}`}>
        {r.options.map((w) => {
          const isRight = solved && w === r.word;
          const isWrong = wrong.includes(w);
          return (
            <button
              key={w.emoji}
              onClick={() => pickPic(w)}
              className={`chunky aspect-square text-6xl sm:text-7xl flex items-center justify-center ${
                isWrong ? 'anim-shake opacity-40' : ''
              } ${isRight ? 'anim-pop' : ''}`}
              style={{
                background: isRight ? '#e0e7ff' : '#fff',
                borderColor: isRight ? ACCENT : '#e3defc',
                ['--chunk' as string]: isRight ? EDGE : '#d6d0f7',
              }}
              aria-label={sylWord(w)}
            >
              {w.emoji}
            </button>
          );
        })}
      </div>
    </>
  );
}

function SpellRound({ r, q }: { r: Extract<Round, { kind: 'spell' }>; q: Q }) {
  const [filled, setFilled] = useState(0);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState<string | null>(null);
  const solved = filled === r.parts.length;

  useEffect(() => {
    void say(SAY.spellAsk, r.he);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (tile: string) => {
    if (solved || used.has(tile)) return;
    const text = tile.split('|')[1];
    if (text === r.parts[filled]) {
      // Si hay dos fichas iguales, sirve cualquiera.
      setUsed(new Set(used).add(tile));
      const n = filled + 1;
      setFilled(n);
      if (n === r.parts.length) {
        q.good(r.he);
        setTimeout(q.next, 1800);
      } else juice.collect();
    } else {
      setShake(tile);
      setTimeout(() => setShake(null), 450);
      q.bad();
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <p className="text-lg sm:text-xl font-semibold text-center">{t.spellAsk}</p>
        <SpeakButton text={[SAY.spellAsk, r.he]} size="sm" />
      </div>
      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div className="anim-pop mx-auto bg-white rounded-3xl border-2 border-[#e3defc] shadow-[0_6px_0_#d6d0f7] w-full max-w-md p-5 flex flex-col items-center gap-4">
        <button onClick={() => void say(r.he)} className="text-8xl" aria-label={t.listen}>
          {r.word.emoji}
        </button>
        <div className="flex gap-1.5 flex-wrap justify-center" dir="rtl">
          {r.parts.map((p, i) => (
            <span
              key={i}
              className={`min-w-[3.2rem] h-[4.2rem] rounded-xl border-[3px] flex items-center justify-center text-4xl font-bold font-hebrew ${
                i < filled ? 'anim-pop' : 'border-dashed'
              }`}
              style={{
                borderColor: i < filled ? ACCENT : `${ACCENT}66`,
                background: i < filled ? '#eef0ff' : i === filled ? '#f7f6ff' : '#fff',
              }}
            >
              {i < filled ? p : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6" dir="rtl">
        {r.tiles.map((tile) => {
          const isUsed = used.has(tile);
          return (
            <button
              key={tile}
              onClick={() => tap(tile)}
              disabled={isUsed}
              className={`chunky w-16 h-16 sm:w-20 sm:h-20 text-4xl sm:text-5xl font-bold font-hebrew flex items-center justify-center ${
                shake === tile ? 'anim-shake bg-rose-50' : ''
              } ${isUsed ? 'opacity-20' : ''}`}
              style={{ background: '#fff', borderColor: '#e3defc', ['--chunk' as string]: '#d6d0f7' }}
            >
              {tile.split('|')[1]}
            </button>
          );
        })}
      </div>
    </>
  );
}
