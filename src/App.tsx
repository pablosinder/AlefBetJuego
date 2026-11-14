import { useState, ComponentType } from 'react';
import { Languages, Star, VolumeX } from 'lucide-react';
import { useI18n, Strings } from './i18n';
import { Stars } from './components/ui';
import { loadProgress } from './lib/progress';
import { hasHebrewVoice } from './lib/speech';
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
  title: (t: Strings) => string;
  desc: (t: Strings) => string;
  glyph: string;
  color: string;
  edge: string;
  Component: ComponentType<{ onBack: () => void }>;
}

const GAMES: GameDef[] = [
  { id: 'letters', title: (t) => t.gLettersTitle, desc: (t) => t.gLettersDesc, glyph: 'א', color: '#ff8a3d', edge: '#c85d1d', Component: LettersGame },
  { id: 'first', title: (t) => t.gFirstTitle, desc: (t) => t.gFirstDesc, glyph: '🐫', color: '#4f7cff', edge: '#2b4fb8', Component: FirstLetterGame },
  { id: 'find', title: (t) => t.gFindTitle, desc: (t) => t.gFindDesc, glyph: 'ב', color: '#ef5da8', edge: '#c23f84', Component: FindLetterGame },
  { id: 'inword', title: (t) => t.gInWordTitle, desc: (t) => t.gInWordDesc, glyph: '🔍', color: '#8b5cf6', edge: '#6a3fd1', Component: InWordGame },
  { id: 'vowels', title: (t) => t.gVowelsTitle, desc: (t) => t.gVowelsDesc, glyph: 'אַ', color: '#2bb673', edge: '#1f8f58', Component: VowelsGame },
  { id: 'write', title: (t) => t.gWriteTitle, desc: (t) => t.gWriteDesc, glyph: '✏️', color: '#f5b014', edge: '#c98c00', Component: WritingGame },
  { id: 'parts', title: (t) => t.gPartsTitle, desc: (t) => t.gPartsDesc, glyph: '📚', color: '#14b8c4', edge: '#0e8a93', Component: SpeechPartsGame },
];

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(loadProgress);

  const game = GAMES.find((g) => g.id === active);
  if (game) {
    const { Component } = game;
    return (
      <Component
        onBack={() => {
          setProgress(loadProgress());
          setActive(null);
        }}
      />
    );
  }

  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-full">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-12">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t.appTitle}</h1>
              <p className="opacity-70">{t.appSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setLang(lang === 'he' ? 'es' : 'he')}
            className="chunky bg-white border-[#e8dcc6] px-3 py-2 flex items-center gap-2 font-semibold shrink-0"
          >
            <Languages className="w-5 h-5" />
            <span>{t.lang}</span>
          </button>
        </header>

        {!hasHebrewVoice() && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2 text-amber-900">
            <VolumeX className="w-5 h-5 shrink-0" />
            <span className="text-sm">{t.noVoice}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-xl font-bold">{t.chooseGame}</h2>
          <div className="flex items-center gap-1 font-bold text-amber-600" dir="ltr">
            <span className="tabular-nums">{totalStars}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              onClick={() => {
                sfx.tap();
                setActive(g.id);
              }}
              className="chunky anim-pop bg-white text-start p-4 flex items-center gap-4 hover:-translate-y-0.5"
              style={{
                borderColor: '#efe3cf',
                ['--chunk' as string]: '#eadcc3',
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold font-hebrew text-white"
                style={{ background: g.color, boxShadow: `0 4px 0 ${g.edge}` }}
                aria-hidden
              >
                {g.glyph}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold">{g.title(t)}</div>
                <div className="text-sm opacity-70 leading-snug">{g.desc(t)}</div>
                <div className="mt-1.5">
                  <Stars n={progress[g.id] ?? 0} size="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
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
