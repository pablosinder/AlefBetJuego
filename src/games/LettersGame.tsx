import { useState } from 'react';
import { GameShell, SpeakButton, Stars } from '../components/ui';
import { useI18n } from '../i18n';
import { LETTERS, FINAL_LETTERS } from '../data/letters';
import { firstClusterLength } from '../lib/hebrew';
import { speak } from '../lib/speech';
import { saveStars } from '../lib/progress';
import { sfx } from '../lib/sfx';

interface Card {
  char: string;
  name: string;
  nameEs: string;
  word: string;
  wordEs: string;
  emoji: string;
}

export default function LettersGame({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState<Card>(LETTERS[0]);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);

  const choose = (c: Card) => {
    setSelected(c);
    speak(c.name);
    const next = new Set(seen).add(c.char);
    setSeen(next);
    if (!rewarded && LETTERS.every((l) => next.has(l.char))) {
      saveStars('letters', 3);
      setRewarded(true);
      sfx.win();
    }
  };

  const seenCount = LETTERS.filter((l) => seen.has(l.char)).length;

  return (
    <GameShell title={t.gLettersTitle} onBack={onBack} accent="#ff8a3d">
      {/* Tarjeta de la letra elegida */}
      <section
        key={selected.char}
        className="anim-pop bg-white rounded-3xl border-2 border-[#f3e4cc] shadow-[0_6px_0_#f0dcbc] p-5 sm:p-6 flex items-center gap-4 sm:gap-8"
      >
        <div className="flex flex-col items-center">
          <div className="text-[7rem] sm:text-[9rem] leading-none font-bold text-[#ff8a3d] font-hebrew" dir="rtl">
            {selected.char}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold font-hebrew" dir="rtl">{selected.name}</span>
            <SpeakButton text={selected.name} size="sm" />
          </div>
          {lang === 'es' && <span className="text-sm opacity-60">{selected.nameEs}</span>}
        </div>
        <div className="flex-1 flex flex-col items-center gap-2 border-s-2 border-dashed border-[#f0dcbc] ps-4 sm:ps-8">
          <div className="text-6xl sm:text-7xl anim-floaty" aria-hidden>{selected.emoji}</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-hebrew" dir="rtl">
              <span className="text-[#ff8a3d]">{selected.word.slice(0, firstClusterLength(selected.word))}</span>
              {selected.word.slice(firstClusterLength(selected.word))}
            </span>
            <SpeakButton text={selected.word} size="sm" />
          </div>
          {lang === 'es' && <span className="text-sm opacity-60">{selected.wordEs}</span>}
        </div>
      </section>

      <div className="flex items-center justify-between mt-6 mb-3">
        <p className="opacity-70">{t.lettersHint}</p>
        <div className="flex items-center gap-2 text-sm font-semibold opacity-80">
          <span className="tabular-nums">{seenCount}/{LETTERS.length}</span>
          {rewarded && <Stars n={3} size="w-4 h-4" />}
        </div>
      </div>

      <LetterGrid cards={LETTERS} selected={selected.char} seen={seen} onPick={choose} />

      <h3 className="mt-6 mb-3 font-bold text-lg">{t.finalLetters}</h3>
      <LetterGrid cards={FINAL_LETTERS} selected={selected.char} seen={seen} onPick={choose} />
    </GameShell>
  );
}

function LetterGrid({
  cards,
  selected,
  seen,
  onPick,
}: {
  cards: Card[];
  selected: string;
  seen: Set<string>;
  onPick: (c: Card) => void;
}) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 sm:gap-3" dir="rtl">
      {cards.map((c) => {
        const isSel = c.char === selected;
        return (
          <button
            key={c.char}
            onClick={() => onPick(c)}
            className={`chunky aspect-square text-4xl sm:text-5xl font-bold font-hebrew flex items-center justify-center ${
              isSel
                ? 'bg-[#ff8a3d] border-[#e8702a] text-white'
                : seen.has(c.char)
                  ? 'bg-[#fff1e4] border-[#f6cfa8]'
                  : 'bg-white border-[#e8dcc6]'
            }`}
            style={isSel ? { ['--chunk' as string]: '#c85d1d' } : undefined}
          >
            {c.char}
          </button>
        );
      })}
    </div>
  );
}
