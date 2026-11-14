import { useMemo, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { EndScreen, Feedback, GameShell, SpeakButton } from '../components/ui';
import { useI18n } from '../i18n';
import { PART_WORDS, SPEECH_PARTS, PartId } from '../data/speechParts';
import { sample } from '../lib/hebrew';
import { useQuiz } from '../lib/useQuiz';

const TOTAL = 12;
const ACCENT = '#14b8c4';

export default function SpeechPartsGame({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => sample(PART_WORDS, TOTAL), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useQuiz('parts', TOTAL);
  const [wrong, setWrong] = useState<PartId[]>([]);
  const [solved, setSolved] = useState(false);
  const [showDefs, setShowDefs] = useState(false);

  const w = rounds[q.round];

  const choose = (p: PartId) => {
    if (solved || wrong.includes(p)) return;
    if (p === w.part) {
      setSolved(true);
      q.good();
      setTimeout(() => {
        setWrong([]);
        setSolved(false);
        q.next();
      }, 1200);
    } else {
      setWrong((x) => [...x, p]);
      q.bad();
    }
  };

  if (q.done) {
    return (
      <GameShell title={t.gPartsTitle} onBack={onBack} accent={ACCENT}>
        <EndScreen
          stars={q.stars}
          correct={q.correct}
          total={TOTAL}
          onAgain={() => {
            q.reset();
            setWrong([]);
            setSolved(false);
            setSeed((s) => s + 1);
          }}
          onMenu={onBack}
        />
      </GameShell>
    );
  }

  return (
    <GameShell title={t.gPartsTitle} onBack={onBack} accent={ACCENT} progress={{ current: q.round, total: TOTAL }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg sm:text-xl font-semibold">{t.partsAsk}</p>
        <button
          onClick={() => setShowDefs((s) => !s)}
          className={`chunky px-3 py-1.5 flex items-center gap-1 font-semibold ${
            showDefs ? 'bg-[#e0f7f9] border-[#14b8c4]' : 'bg-white border-[#d4ecee]'
          }`}
        >
          <HelpCircle className="w-5 h-5" /> {t.showDefs}
        </button>
      </div>

      <div
        key={q.round}
        className="anim-pop mx-auto my-5 bg-white rounded-3xl border-2 border-[#d4ecee] shadow-[0_6px_0_#bfe3e6] px-10 py-8 flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-5xl sm:text-6xl font-bold font-hebrew" dir="rtl">{w.he}</span>
          <SpeakButton text={w.he} />
        </div>
        {lang === 'es' && <span className="opacity-60">{w.es}</span>}
      </div>

      <Feedback kind={q.feedback} id={q.fbId} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {SPEECH_PARTS.map((p) => {
          const isWrong = wrong.includes(p.id);
          const isRight = solved && p.id === w.part;
          return (
            <button
              key={p.id}
              onClick={() => choose(p.id)}
              disabled={isWrong}
              className={`chunky p-4 text-start flex flex-col gap-1 ${p.color} ${isRight ? 'anim-pop ring-4 ring-emerald-400' : ''} ${
                isWrong ? 'anim-shake' : ''
              }`}
            >
              <span className="text-2xl font-bold font-hebrew">{lang === 'he' ? p.he : `${p.es} · ${p.he}`}</span>
              {showDefs && (
                <span className="text-sm opacity-80 font-hebrew">{lang === 'he' ? p.defHe : p.defEs}</span>
              )}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
