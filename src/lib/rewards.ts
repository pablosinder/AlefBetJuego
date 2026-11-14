// Recompensas guardadas en el navegador: gemas (suben el nivel), figuritas y días seguidos jugando.
// Todo es en positivo: nunca se pierde nada por equivocarse o por no jugar.
import { useSyncExternalStore } from 'react';

const KEY = 'alefbet.rewards.v1';

export const STICKERS = [
  '🦁', '🐯', '🐼', '🦊', '🐨', '🐵', '🦄', '🐸', '🐧', '🦉', '🦋', '🐬',
  '🐳', '🐙', '🦖', '🐢', '🐝', '🐞', '🦒', '🐘', '🦜', '🐿️', '🦔', '🐰',
  '🌈', '🚀', '🎈', '🍭', '🍉', '🍓', '🧁', '🍦', '⚽', '🎸', '🏰', '👑',
];

export interface Rewards {
  gems: number;
  stickers: string[];
  day: string; // último día jugado (AAAA-MM-DD, hora local)
  dayStreak: number;
}

const EMPTY: Rewards = { gems: 0, stickers: [], day: '', dayStreak: 0 };

function read(): Rewards {
  try {
    return { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Rewards>) };
  } catch {
    return EMPTY;
  }
}

let state: Rewards = read();
const subs = new Set<() => void>();

function set(next: Rewards) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // sin almacenamiento: sigue funcionando en memoria
  }
  subs.forEach((f) => f());
}

function subscribe(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

export function useRewards(): Rewards {
  return useSyncExternalStore(subscribe, () => state);
}

/** Nivel según las gemas: cada nivel pide un poco más que el anterior. */
export function levelInfo(gems: number): { level: number; have: number; need: number } {
  let level = 1;
  let left = gems;
  for (;;) {
    const need = 20 + level * 10;
    if (left < need) return { level, have: left, need };
    left -= need;
    level++;
  }
}

// ——— Avisos para la capa de festejos (nivel nuevo, regalo) ———
export type RewardEvent = { type: 'levelup'; level: number } | { type: 'gift' };
const listeners = new Set<(e: RewardEvent) => void>();
export function onRewardEvent(f: (e: RewardEvent) => void) {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}
const emit = (e: RewardEvent) => listeners.forEach((f) => f(e));

export const rewards = {
  get: () => state,

  addGems(n: number) {
    if (n <= 0) return;
    const before = levelInfo(state.gems).level;
    set({ ...state, gems: state.gems + n });
    const after = levelInfo(state.gems).level;
    if (after > before) emit({ type: 'levelup', level: after });
  },

  /** Figurita nueva al azar; null si ya están todas. */
  grantSticker(): string | null {
    const missing = STICKERS.filter((s) => !state.stickers.includes(s));
    if (!missing.length) return null;
    const s = missing[Math.floor(Math.random() * missing.length)];
    set({ ...state, stickers: [...state.stickers, s] });
    return s;
  },

  /** Muestra una caja de regalo sobre la pantalla actual (juegos sin pantalla final). */
  offerGift() {
    emit({ type: 'gift' });
  },

  /** Anota que hoy se jugó y actualiza los días seguidos. */
  touchDay() {
    const key = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const today = key(new Date());
    if (state.day === today) return;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    set({ ...state, day: today, dayStreak: state.day === key(y) ? state.dayStreak + 1 : 1 });
  },

  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignorar
    }
    state = EMPTY;
    subs.forEach((f) => f());
  },
};
