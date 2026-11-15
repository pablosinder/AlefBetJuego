import { useEffect, useMemo, useState } from 'react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { GENDER_PAIRS, GenderPair } from '../data/sheets';
import { clusters, pick, sample, shuffle } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';
import { say } from '../lib/audio';
import { juice } from '../lib/juice';

const TOTAL = 6;
const ACCENT = '#ec4899';


interface Round {
  pair: GenderPair;
  options: string[];
}

// Hoja 25: "ה בְּסוֹף מִלָּה מְצַיֶּנֶת מִין נְקֵבָה" — unir זָכָר con נְקֵבָה y marcar la ה del final.
function makeRounds(): Round[] {
  return sample(GENDER_PAIRS, TOTAL).map((pair) => {
    const other = pick(GENDER_PAIRS.filter((p) => p !== pair));
    return { pair, options: shuffle([pair.female, pair.male, other.female]) };
  });
}

export default function GenderGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('gender', TOTAL);
  const r = rounds[q.round];
  const [step, setStep] = useState<'pick' | 'heh' | 'done'>('pick');
  const [wrong, setWrong] = useState<string[]>([]);
  const [wrongCl, setWrongCl] = useState<number[]>([]);
  const parts = clusters(r.pair.female);
  const hehIdx = parts.length - 1;

  useEffect(() => {
    setStep('pick');
    setWrong([]);
    setWrongCl([]);
    if (q.done) return;
    if (q.round === 0) void say(SAY.genderRule, SAY.genderAsk, r.pair.male);
    else void say(SAY.genderAsk, r.pair.male);
  }, [q.round, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (w: string) => {
    if (step !== 'pick' || wrong.includes(w)) return;
    if (w === r.pair.female) {
      juice.collect();
      setStep('heh');
      void say(r.pair.female, SAY.genderTapH);
    } else {
      setWrong((x) => [...x, w]);
      q.bad(w);
    }
  };

  const tapCluster = (i: number) => {
    if (step !== 'heh' || wrongCl.includes(i)) return;
    if (i === hehIdx) {
      setStep('done');
      q.good(r.pair.male, r.pair.female);
      setTimeout(q.next, 2600);
    } else {
      setWrongCl((x) => [...x, i]);
      q.bad();
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gGenderTitle} onBack={onBack} accent={ACCENT}>
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
    <GameShell title={t.gGenderTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-center gap-2">
        <p className="text-lg sm:text-xl font-semibold text-center">{step === 'pick' ? t.genderAsk : t.genderTapH}</p>
        <SpeakButton text={step === 'pick' ? [SAY.genderAsk, r.pair.male] : SAY.genderTapH} size="sm" />
      </div>

      <Feedback kind={q.feedback} id={q.fbId} text={q.feedbackText} />

      <div key={q.round} className="anim-pop grid grid-cols-2 gap-4" dir="rtl">
        {/* זָכָר */}
        <Card emoji={r.pair.emoji} tag={t.male} tagColor="#3b82f6">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold font-hebrew">{r.pair.male}</span>
            <SpeakButton text={r.pair.male} size="sm" />
          </div>
        </Card>

        {/* נְקֵבָה */}
        <Card emoji={r.pair.emoji} tag={t.female} tagColor={ACCENT} bow>
          {step === 'pick' ? (
            <span className="text-5xl font-bold opacity-30">?</span>
          ) : (
            <div className="text-5xl font-bold font-hebrew leading-[1.5] flex" dir="rtl">
              {parts.map((c, i) => {
                const isH = step === 'done' && i === hehIdx;
                return (
                  <button
                    key={i}
                    onClick={() => tapCluster(i)}
                    className={`rounded-xl px-0.5 transition ${wrongCl.includes(i) ? 'anim-shake text-rose-300' : ''} ${
                      isH ? 'anim-pop' : ''
                    }`}
                    style={isH ? { color: '#fff', background: ACCENT, boxShadow: `0 0 0 4px ${ACCENT}55` } : undefined}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {step === 'pick' && (
        <div className="grid grid-cols-3 gap-3 mt-6" dir="rtl">
          {r.options.map((w) => {
            const isWrong = wrong.includes(w);
            return (
              <div
                key={w}
                role="button"
                tabIndex={0}
                onClick={() => choose(w)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && choose(w)}
                className={`chunky cursor-pointer flex flex-col items-center gap-2 p-3 ${isWrong ? 'anim-shake opacity-50' : ''}`}
                style={{ background: '#fff', borderColor: '#f5d0e4', ['--chunk' as string]: '#efbcd6' }}
              >
                <span className="text-3xl sm:text-4xl font-bold font-hebrew px-2 py-1">{w}</span>
                <SpeakButton text={w} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </GameShell>
  );
}

function Card({
  emoji,
  tag,
  tagColor,
  bow,
  children,
}: {
  emoji: string;
  tag: string;
  tagColor: string;
  bow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border-2 border-[#f3e4cc] shadow-[0_6px_0_#f0dcbc] p-4 flex flex-col items-center gap-3">
      <span className="rounded-full px-3 py-0.5 text-white font-bold" style={{ background: tagColor }}>
        {tag}
      </span>
      <div className="relative text-7xl sm:text-8xl" aria-hidden>
        {emoji}
        {bow && <span className="absolute -top-2 -end-3 text-4xl">🎀</span>}
      </div>
      <div className="min-h-[4.5rem] flex items-center">{children}</div>
    </div>
  );
}
