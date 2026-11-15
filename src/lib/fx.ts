// Efectos visuales: partículas en un <canvas> a pantalla completa y textos/emojis voladores en el DOM.
// No depende de React: cualquier juego puede llamar fx.burst(x, y) y listo.

type Shape = 'dot' | 'star' | 'rect' | 'ring';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number; // gravedad (px/s²)
  drag: number;
  life: number;
  max: number;
  size: number;
  color: string;
  shape: Shape;
  rot: number;
  vr: number;
}

export const CANDY = ['#ff5fa2', '#ffcb2e', '#4f7cff', '#2bb673', '#ff8a3d', '#8b5cf6', '#22d3ee'];

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let parts: Particle[] = [];
let raf = 0;
let lastT = 0;
let dpr = 1;

function resize() {
  if (!canvas) return;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}

function ensureCanvas(): boolean {
  if (canvas) return true;
  if (typeof document === 'undefined') return false;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:70';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  return !!ctx;
}

function starPath(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  c.closePath();
}

function frame(now: number) {
  if (!ctx || !canvas) return;
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const H = window.innerHeight;
  parts = parts.filter((p) => p.life < p.max && p.y < H + 60);
  for (const p of parts) {
    p.life += dt;
    if (p.life < 0) continue; // todavía no arrancó (retraso)
    const k = p.life / p.max;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.shape === 'ring') {
      ctx.globalAlpha = (1 - k) * 0.8;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 6 * (1 - k) + 1;
      ctx.beginPath();
      ctx.arc(0, 0, p.size + p.vr * k, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    p.vx *= 1 - p.drag * dt;
    p.vy = p.vy * (1 - p.drag * dt) + p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    ctx.fillStyle = p.color;
    ctx.rotate(p.rot);
    if (p.shape === 'dot') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * (1 - k * 0.5), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'star') {
      starPath(ctx, p.size * (1 - k * 0.3));
      ctx.fill();
    } else {
      // papelito que gira: se "aplasta" para simular la vuelta
      ctx.scale(1, Math.cos(p.life * 9 + p.rot));
      ctx.fillRect(-p.size / 2, -p.size * 0.8, p.size, p.size * 1.6);
    }
    ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(frame) : 0;
  if (!raf) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function add(p: Particle) {
  if (!ensureCanvas()) return;
  if (parts.length > 700) return;
  parts.push(p);
  if (!raf) {
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
  }
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

// ——— Último toque: sirve de origen para los efectos sin que cada juego pase coordenadas ———
let lastPoint: { x: number; y: number; at: number } | null = null;

export interface Point {
  x: number;
  y: number;
}

let inited = false;

export const fx = {
  /** Empieza a seguir el dedo y dibuja chispitas al tocar botones. */
  init(onButtonDown?: () => void) {
    if (inited || typeof window === 'undefined') return;
    inited = true;
    const track = (e: PointerEvent) => {
      lastPoint = { x: e.clientX, y: e.clientY, at: performance.now() };
    };
    window.addEventListener('pointermove', track, { passive: true, capture: true });
    window.addEventListener(
      'pointerdown',
      (e) => {
        track(e);
        const btn = (e.target as Element | null)?.closest?.('button');
        if (btn && !(btn as HTMLButtonElement).disabled) {
          fx.sparkle(e.clientX, e.clientY);
          onButtonDown?.();
        }
      },
      { passive: true, capture: true },
    );
  },

  /** Dónde tocó el usuario por última vez (o el centro de la pantalla). */
  origin(): Point {
    if (lastPoint && performance.now() - lastPoint.at < 5000) return { x: lastPoint.x, y: lastPoint.y };
    return { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
  },

  /** Explosión de estrellas y bolitas. */
  burst(x: number, y: number, opts: { count?: number; power?: number; colors?: string[] } = {}) {
    const scale = reduced() ? 0.35 : 1;
    const count = Math.round((opts.count ?? 18) * scale);
    const power = opts.power ?? 1;
    const colors = opts.colors ?? CANDY;
    for (let i = 0; i < count; i++) {
      const a = rnd(0, Math.PI * 2);
      const v = rnd(120, 420) * power;
      add({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 80,
        g: 620,
        drag: 1.6,
        life: 0,
        max: rnd(0.6, 1.1),
        size: rnd(4, 9) * (i % 3 === 0 ? 1.5 : 1),
        color: pick(colors),
        shape: i % 3 === 0 ? 'star' : i % 3 === 1 ? 'dot' : 'rect',
        rot: rnd(0, 6),
        vr: rnd(-8, 8),
      });
    }
  },

  /** Onda expansiva. */
  ring(x: number, y: number, color = '#ffcb2e', radius = 90) {
    if (reduced()) return;
    add({ x, y, vx: 0, vy: 0, g: 0, drag: 0, life: 0, max: 0.45, size: 8, color, shape: 'ring', rot: 0, vr: radius });
  },

  /** Chispitas chicas al tocar. */
  sparkle(x: number, y: number) {
    if (reduced()) return;
    for (let i = 0; i < 6; i++) {
      const a = rnd(0, Math.PI * 2);
      const v = rnd(60, 170);
      add({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        g: 150,
        drag: 3,
        life: 0,
        max: rnd(0.3, 0.5),
        size: rnd(2.5, 5),
        color: pick(CANDY),
        shape: i % 2 ? 'star' : 'dot',
        rot: rnd(0, 6),
        vr: rnd(-6, 6),
      });
    }
  },

  /** Lluvia de papelitos desde arriba. */
  confetti(count = 110) {
    const n = Math.round(count * (reduced() ? 0.25 : 1));
    const W = window.innerWidth;
    for (let i = 0; i < n; i++) {
      add({
        x: rnd(0, W),
        y: rnd(-40, -10),
        vx: rnd(-60, 60),
        vy: rnd(120, 320),
        g: 160,
        drag: 0.4,
        life: -rnd(0, 0.9),
        max: rnd(2.4, 3.6),
        size: rnd(6, 11),
        color: pick(CANDY),
        shape: i % 5 === 0 ? 'star' : 'rect',
        rot: rnd(0, 6),
        vr: rnd(-5, 5),
      });
    }
  },

  /** Fuegos artificiales repartidos por la pantalla. */
  fireworks(n = 5) {
    const shots = reduced() ? 1 : n;
    for (let i = 0; i < shots; i++) {
      setTimeout(() => {
        const x = rnd(0.15, 0.85) * window.innerWidth;
        const y = rnd(0.15, 0.5) * window.innerHeight;
        const color = pick(CANDY);
        fx.ring(x, y, color, 130);
        fx.burst(x, y, { count: 30, power: 1.25, colors: [color, '#ffffff', pick(CANDY)] });
      }, i * 260);
    }
  },

  /** Texto o emoji que sube y se desvanece ("+1 💎"). */
  floatText(x: number, y: number, text: string, opts: { color?: string; size?: number } = {}) {
    const el = document.createElement('div');
    el.className = 'fx-float';
    el.textContent = text;
    el.setAttribute('aria-hidden', 'true');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    if (opts.color) el.style.color = opts.color;
    if (opts.size) el.style.fontSize = `${opts.size}px`;
    document.body.appendChild(el);
    const anim = el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
        { transform: 'translate(-50%, -110%) scale(1.25)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%, -190%) scale(1)', opacity: 1, offset: 0.7 },
        { transform: 'translate(-50%, -260%) scale(0.9)', opacity: 0 },
      ],
      { duration: 1000, easing: 'ease-out' },
    );
    anim.onfinish = () => el.remove();
  },

  /** Cartel grande al centro (rachas, nivel nuevo). */
  banner(text: string) {
    const el = document.createElement('div');
    el.className = 'fx-banner candy-text';
    el.textContent = text;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    const anim = el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.2) rotate(-12deg)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1.25) rotate(4deg)', opacity: 1, offset: 0.22 },
        { transform: 'translate(-50%, -50%) scale(1) rotate(-2deg)', opacity: 1, offset: 0.4 },
        { transform: 'translate(-50%, -50%) scale(1.05) rotate(2deg)', opacity: 1, offset: 0.75 },
        { transform: 'translate(-50%, -90%) scale(1.5)', opacity: 0 },
      ],
      { duration: 1300, easing: 'ease-out' },
    );
    anim.onfinish = () => el.remove();
  },

  /** Emojis que vuelan desde un punto hasta un elemento (gemas al contador). */
  flyTo(from: Point, target: Element | null, emoji: string, count: number, onArrive?: () => void) {
    if (!target || reduced()) {
      onArrive?.();
      return;
    }
    const r = target.getBoundingClientRect();
    const tx = r.left + r.width / 2;
    const ty = r.top + r.height / 2;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'fx-fly';
      el.textContent = emoji;
      el.setAttribute('aria-hidden', 'true');
      el.style.left = `${from.x}px`;
      el.style.top = `${from.y}px`;
      document.body.appendChild(el);
      const sx = rnd(-70, 70);
      const sy = rnd(-90, -20);
      const anim = el.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 },
          { transform: `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px)) scale(1.3)`, opacity: 1, offset: 0.3 },
          {
            transform: `translate(calc(-50% + ${tx - from.x}px), calc(-50% + ${ty - from.y}px)) scale(0.6)`,
            opacity: 1,
          },
        ],
        { duration: 650 + i * 110, easing: 'cubic-bezier(.5,0,.3,1)' },
      );
      anim.onfinish = () => {
        el.remove();
        (target as HTMLElement).animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
          { duration: 260, easing: 'ease-out' },
        );
        onArrive?.();
      };
    }
  },

  /** Sacudón corto de la pantalla. */
  shake(strength = 6) {
    if (reduced()) return;
    const root = document.getElementById('root');
    root?.animate(
      [
        { transform: 'translate(0,0)' },
        { transform: `translate(${-strength}px, ${strength * 0.3}px)` },
        { transform: `translate(${strength}px, ${-strength * 0.3}px)` },
        { transform: `translate(${-strength * 0.6}px, 0)` },
        { transform: `translate(${strength * 0.6}px, 0)` },
        { transform: 'translate(0,0)' },
      ],
      { duration: 280, easing: 'ease-out' },
    );
  },
};
