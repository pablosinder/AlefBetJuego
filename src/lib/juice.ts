// "Jugo" del juego: une sonido + partículas + vibración + gemas + racha en una sola llamada.
import { useSyncExternalStore } from 'react';
import { sfx } from './sfx';
import { fx, Point } from './fx';
import { rewards } from './rewards';

let combo = 0;
let collectStep = 0;
let collectAt = 0;
const subs = new Set<() => void>();
const setCombo = (n: number) => {
  combo = n;
  subs.forEach((f) => f());
};

/** Aciertos seguidos (para mostrar el contador de racha). */
export function useCombo(): number {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
    () => combo,
  );
}

const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // no disponible
  }
};

const gemTarget = () => document.querySelector('[data-gem-target]');

/** Rachas que se festejan con cartel grande. */
const isMilestone = (n: number) => n === 3 || n === 5 || n === 8 || (n >= 12 && n % 4 === 0);

export const juice = {
  /** Al entrar a un juego: la racha empieza de cero. */
  reset() {
    setCombo(0);
    collectStep = 0;
  },

  /** Acierto: campanita que sube con la racha, explosión, gemas que vuelan al contador. */
  correct(at?: Point) {
    const n = combo + 1;
    setCombo(n);
    collectStep = 0;
    const p = at ?? fx.origin();
    const heat = Math.min(n, 8);
    sfx.correct(n);
    fx.ring(p.x, p.y, '#ffcb2e', 80 + heat * 8);
    fx.burst(p.x, p.y, { count: 16 + heat * 3, power: 1 + heat * 0.07 });
    buzz(15);

    const gems = 1 + (n >= 3 ? 1 : 0) + (n >= 6 ? 1 : 0);
    rewards.addGems(gems);
    fx.floatText(p.x, p.y - 80, `+${gems} 💎`);
    let arrived = 0;
    fx.flyTo(p, gemTarget(), '💎', gems, () => {
      if (arrived++ === 0) sfx.gem();
    });

    if (isMilestone(n)) {
      setTimeout(() => {
        sfx.comboUp();
        fx.banner(`🔥 ×${n}`);
        fx.confetti(40);
      }, 250);
    }
  },

  /** Error: sonido suave y un sacudón cortito. La racha vuelve a empezar. */
  wrong(opts: { shake?: boolean } = {}) {
    setCombo(0);
    collectStep = 0;
    sfx.wrong();
    if (opts.shake !== false) fx.shake(5);
    buzz([25, 40, 25]);
  },

  /** Paso bien dado dentro de una ronda (encontrar una de varias letras): tono que va subiendo. */
  collect(at?: Point) {
    const now = performance.now();
    collectStep = now - collectAt > 4000 ? 0 : collectStep + 1;
    collectAt = now;
    const p = at ?? fx.origin();
    sfx.collect(collectStep);
    fx.burst(p.x, p.y, { count: 8, power: 0.6 });
    buzz(8);
  },

  /** Juego terminado: fanfarria, fuegos artificiales y papelitos. */
  win() {
    sfx.win();
    fx.fireworks(5);
    fx.confetti();
    buzz([20, 60, 20, 60, 40]);
  },
};
