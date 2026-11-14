// Piezas visuales de las recompensas: contador de gemas, nivel, caja de regalo, álbum de figuritas
// y la capa que festeja el nivel nuevo.
import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { t } from '../strings';
import { fx } from '../lib/fx';
import { sfx } from '../lib/sfx';
import { levelInfo, onRewardEvent, rewards, STICKERS, useRewards } from '../lib/rewards';

/** Contador de gemas; las gemas ganadas vuelan hasta acá. */
export function GemCounter({ className = '' }: { className?: string }) {
  const { gems } = useRewards();
  return (
    <div
      data-gem-target
      dir="ltr"
      className={`flex items-center gap-1 rounded-full bg-white/90 border-2 border-[#d8e6ff] px-2.5 py-1 font-extrabold text-[#3b63d9] shadow-[0_3px_0_#c9d5ff] ${className}`}
    >
      <span className="text-lg leading-none" aria-hidden>💎</span>
      <span className="tabular-nums">{gems}</span>
    </div>
  );
}

/** Medalla con el nivel y barra de avance hacia el siguiente. */
export function LevelBadge() {
  const { gems } = useRewards();
  const { level, have, need } = levelInfo(gems);
  return (
    <div className="flex items-center gap-2 basis-full min-w-0" aria-label={`${t.level} ${level}`}>
      <div
        key={level}
        className="anim-pop relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl font-extrabold text-white"
        style={{ background: 'linear-gradient(145deg,#ffd84a,#ff8a3d)', boxShadow: '0 4px 0 #c85d1d' }}
        dir="ltr"
      >
        <span className="absolute -top-2 text-base" aria-hidden>👑</span>
        {level}
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-4 rounded-full bg-white/80 border-2 border-[#f3dfb8] overflow-hidden" dir="ltr">
          <div
            className="h-full rounded-full candy-stripes transition-all duration-700"
            style={{ width: `${Math.max(6, (have / need) * 100)}%`, ['--stripe' as string]: '#ff8a3d' }}
          />
        </div>
      </div>
    </div>
  );
}

/** Caja de regalo: al tocarla tiembla, se abre y sale una figurita nueva (o gemas si ya están todas). */
export function GiftBox({ onOpened }: { onOpened?: () => void }) {
  const [phase, setPhase] = useState<'closed' | 'shaking' | 'open'>('closed');
  const [prize, setPrize] = useState<{ sticker: string | null; gems: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const open = () => {
    if (phase !== 'closed') return;
    setPhase('shaking');
    sfx.giftShake();
    setTimeout(() => sfx.giftShake(), 220);
    setTimeout(() => sfx.giftShake(), 440);
    setTimeout(() => {
      const sticker = rewards.grantSticker();
      const gems = sticker ? 5 : 15;
      rewards.addGems(gems);
      setPrize({ sticker, gems });
      setPhase('open');
      sfx.giftOpen();
      const r = ref.current?.getBoundingClientRect();
      if (r) {
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        fx.ring(x, y, '#ff5fa2', 160);
        fx.burst(x, y, { count: 44, power: 1.4 });
        fx.flyTo({ x, y }, document.querySelector('[data-gem-target]'), '💎', 3, () => {});
      }
      onOpened?.();
    }, 700);
  };

  return (
    <div ref={ref} className="relative w-40 h-40 flex items-center justify-center">
      {phase === 'open' && prize ? (
        <>
          <div className="rays absolute -inset-10" aria-hidden />
          <div className="relative flex flex-col items-center anim-prize">
            <div className="text-8xl drop-shadow-[0_6px_0_rgba(0,0,0,0.12)]">{prize.sticker ?? '💎'}</div>
            <div className="flex items-center gap-1 text-2xl mt-1" dir="ltr">
              <span className="candy-text">+{prize.gems}</span> 💎
            </div>
          </div>
        </>
      ) : (
        <button
          onClick={open}
          aria-label={t.gift}
          className={`text-8xl leading-none ${phase === 'shaking' ? 'anim-gift-shake' : 'anim-gift-idle'}`}
        >
          🎁
          {phase === 'closed' && <span className="absolute -bottom-1 left-1/2 text-4xl anim-tap-hint" aria-hidden>👆</span>}
        </button>
      )}
    </div>
  );
}

/** Álbum: todas las figuritas, las que faltan en silueta. */
export function StickerAlbum({ onClose }: { onClose: () => void }) {
  const { stickers } = useRewards();
  return (
    <div className="fixed inset-0 z-50 bg-[#2b2350]/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={t.album}
        className="anim-pop bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[88%] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-l from-[#ff8ac0] to-[#ffb35c] text-white">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span aria-hidden>📒</span> {t.album}
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-extrabold tabular-nums text-lg" dir="ltr">
              {stickers.length} / {STICKERS.length}
            </span>
            <button onClick={onClose} aria-label={t.back} className="p-2 rounded-full bg-white/25">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-4 overflow-y-auto" dir="ltr">
          {[...stickers, ...STICKERS.filter((x) => !stickers.includes(x))].map((s, i) => {
            const have = stickers.includes(s);
            return have ? (
              <button
                key={s}
                onClick={(e) => {
                  sfx.collect(i % 8);
                  e.currentTarget.animate(
                    [
                      { transform: 'scale(1) rotate(0)' },
                      { transform: 'scale(1.4) rotate(-10deg)' },
                      { transform: 'scale(0.9) rotate(8deg)' },
                      { transform: 'scale(1) rotate(0)' },
                    ],
                    { duration: 450, easing: 'ease-out' },
                  );
                }}
                className="aspect-square rounded-2xl bg-[#fff4d6] border-2 border-[#ffd98a] text-4xl sm:text-5xl flex items-center justify-center anim-pop"
                style={{ animationDelay: `${i * 18}ms` }}
              >
                {s}
              </button>
            ) : (
              <div
                key={s}
                className="aspect-square rounded-2xl bg-[#f3eee4] border-2 border-dashed border-[#ded3bf] text-3xl font-extrabold text-[#d3c7b0] flex items-center justify-center"
              >
                ?
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Capa global: cartel de nivel nuevo y regalo para los juegos sin pantalla final. */
export function RewardLayer() {
  const [level, setLevel] = useState<number | null>(null);
  const [gift, setGift] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);

  useEffect(
    () =>
      onRewardEvent((e) => {
        if (e.type === 'levelup') {
          setLevel(e.level);
          setTimeout(() => {
            sfx.levelUp();
            fx.fireworks(4);
          }, 500);
          setTimeout(() => setLevel(null), 3200);
        } else {
          setGiftOpened(false);
          setGift(true);
        }
      }),
    [],
  );

  const closeGift = () => giftOpened && setGift(false);

  return (
    <>
      {level !== null && (
        <div className="fixed inset-x-0 top-[14%] z-[65] flex justify-center pointer-events-none" aria-hidden>
          <div className="anim-levelup flex items-center gap-3 rounded-full bg-white px-6 py-3 border-4 border-[#ffcb2e] shadow-[0_8px_0_#e0a800]">
            <span className="text-5xl">👑</span>
            <span className="candy-text text-4xl">
              {t.level} <span dir="ltr">{level}</span>
            </span>
            <span className="text-5xl">⭐</span>
          </div>
        </div>
      )}
      {gift && (
        <div className="fixed inset-0 z-[60] bg-[#2b2350]/55 flex items-center justify-center" onClick={closeGift}>
          <div className="anim-pop flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
            <GiftBox
              onOpened={() => {
                setGiftOpened(true);
                setTimeout(() => setGift(false), 3200);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Fondo animado: letras y burbujas de colores que suben despacito. */
export function Backdrop() {
  const items = useMemo(() => {
    const glyphs = ['א', 'ב', 'ג', 'ד', 'ה', 'ש', 'ל', 'מ', '⭐', '♥', '●', '✦', '●', '✦'];
    const colors = ['#ff8a3d', '#4f7cff', '#ef5da8', '#8b5cf6', '#2bb673', '#ffcb2e', '#22d3ee'];
    return glyphs.map((g, i) => ({
      g,
      color: colors[i % colors.length],
      left: (i * 37 + 5) % 96,
      size: 28 + ((i * 13) % 44),
      dur: 16 + ((i * 7) % 14),
      delay: -((i * 5) % 20),
    }));
  }, []);
  return (
    <div className="backdrop" aria-hidden>
      {items.map((it, i) => (
        <span
          key={i}
          className="backdrop-item font-hebrew"
          style={{
            left: `${it.left}%`,
            fontSize: it.size,
            color: it.color,
            animationDuration: `${it.dur}s`,
            animationDelay: `${it.delay}s`,
          }}
        >
          {it.g}
        </span>
      ))}
    </div>
  );
}
