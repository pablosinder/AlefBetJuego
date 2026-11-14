import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, Check } from 'lucide-react';
import { Confetti, Feedback, GameShell, PrimaryButton, SpeakButton } from '../components/ui';
import { t, SAY } from '../strings';
import { LETTERS, FINAL_LETTERS } from '../data/letters';
import { saveStars } from '../lib/progress';
import { sfx } from '../lib/sfx';
import { cheer } from '../lib/cheer';
import { say } from '../lib/audio';

const ACCENT = '#f5b014';
const EDGE = '#c98c00';
const FONT = "700 {size}px Rubik, 'Arial Hebrew', sans-serif";

// Grupos como en las hojas de caligrafía: א–י, כ–ר, ש–ת + finales.
const GROUPS: { id: 1 | 2 | 3; items: { char: string; name: string }[] }[] = [
  { id: 1, items: LETTERS.filter((l) => l.group === 1) },
  { id: 2, items: LETTERS.filter((l) => l.group === 2) },
  { id: 3, items: [...LETTERS.filter((l) => l.group === 3), ...FINAL_LETTERS] },
];

const LETTER_SCALE = 1.1; // tamaño de la letra respecto del lienzo
const STEP = 3; // muestreo en píxeles para comparar

/** Configura la fuente y devuelve dónde dibujar la letra para que quede centrada. */
function placeLetter(ctx: CanvasRenderingContext2D, char: string, size: number) {
  ctx.font = FONT.replace('{size}', String(Math.round(size * LETTER_SCALE)));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'rtl';
  const m = ctx.measureText(char);
  const asc = m.actualBoundingBoxAscent;
  const desc = m.actualBoundingBoxDescent;
  return { x: size / 2, y: size / 2 + (asc - desc) / 2 };
}

export default function WritingGame({ onBack }: { onBack: () => void }) {
  const [groupId, setGroupId] = useState<1 | 2 | 3>(1);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [fbId, setFbId] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [praise, setPraise] = useState('');
  const [party, setParty] = useState(false);

  const group = GROUPS.find((g) => g.id === groupId)!;
  const item = group.items[idx];

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef(0);
  const hasInk = useRef(false);

  const brush = () => sizeRef.current * 0.075;

  /** Dibuja la letra guía (gris claro) y borra el trazo. */
  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(wrap.clientWidth, 420);
    sizeRef.current = size;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    hasInk.current = false;
  }, []);

  const guideRef = useRef<HTMLCanvasElement>(null);
  const drawGuide = useCallback(() => {
    const g = guideRef.current;
    const size = sizeRef.current;
    if (!g || !size) return;
    const dpr = window.devicePixelRatio || 1;
    g.width = size * dpr;
    g.height = size * dpr;
    g.style.width = `${size}px`;
    g.style.height = `${size}px`;
    const ctx = g.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    // renglones
    ctx.strokeStyle = '#f3e3bf';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    for (const y of [0.12, 0.88]) {
      ctx.beginPath();
      ctx.moveTo(10, size * y);
      ctx.lineTo(size - 10, size * y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = '#ece6da';
    const at = placeLetter(ctx, item.char, size);
    ctx.fillText(item.char, at.x, at.y);
  }, [item.char]);

  useEffect(() => {
    let alive = true;
    const run = () => {
      if (!alive) return;
      resetCanvas();
      drawGuide();
    };
    // Esperar a que cargue la fuente para que la guía y la máscara coincidan.
    document.fonts?.load(FONT.replace('{size}', '100')).then(run, run);
    run();
    window.addEventListener('resize', run);
    return () => {
      alive = false;
      window.removeEventListener('resize', run);
    };
  }, [resetCanvas, drawGuide]);

  const firstSay = useRef(true);
  useEffect(() => {
    setHint(null);
    setFeedback(null);
    // La primera vez se explica qué hacer; después solo se dice la letra.
    void (firstSay.current ? say(SAY.writeAsk, item.name) : say(item.name));
    firstSay.current = false;
  }, [item.char]); // eslint-disable-line react-hooks/exhaustive-deps

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    stroke(last.current, last.current);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = pos(e);
    stroke(last.current!, p);
    last.current = p;
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const stroke = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = '#4f7cff';
    ctx.lineWidth = brush();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    hasInk.current = true;
  };

  /** Compara el trazo con la forma de la letra. */
  const evaluate = () => {
    const canvas = canvasRef.current!;
    const size = sizeRef.current;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width;
    const H = canvas.height;

    const mk = () => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const x = c.getContext('2d')!;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      return x;
    };
    // Máscara estricta (la letra) y tolerante (la letra engrosada).
    const strict = mk();
    const at = placeLetter(strict, item.char, size);
    strict.fillText(item.char, at.x, at.y);
    const loose = mk();
    placeLetter(loose, item.char, size);
    loose.lineWidth = brush() * 1.6;
    loose.lineJoin = 'round';
    loose.fillText(item.char, at.x, at.y);
    loose.strokeText(item.char, at.x, at.y);

    const ink = canvas.getContext('2d')!.getImageData(0, 0, W, H).data;
    const sd = strict.getImageData(0, 0, W, H).data;
    const ld = loose.getImageData(0, 0, W, H).data;

    // Cobertura: qué parte de la letra quedó tapada por el trazo (con margen).
    // Para tolerar trazos finos, se considera cubierto un píxel de la letra si hay tinta cerca.
    const r = Math.max(1, Math.round(brush() * dpr * 0.6));
    let letterPx = 0;
    let covered = 0;
    let inkPx = 0;
    let outside = 0;
    const step = STEP * Math.round(dpr);
    const inkAt = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < W && y < H && ink[(y * W + x) * 4 + 3] > 40;

    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const i = (y * W + x) * 4 + 3;
        if (ink[i] > 40) {
          inkPx++;
          if (ld[i] < 40) outside++;
        }
        if (sd[i] > 120) {
          letterPx++;
          if (inkAt(x, y) || inkAt(x + r, y) || inkAt(x - r, y) || inkAt(x, y + r) || inkAt(x, y - r)) covered++;
        }
      }
    }
    const coverage = letterPx ? covered / letterPx : 0;
    const outRatio = inkPx ? outside / inkPx : 1;
    return { coverage, outRatio };
  };

  const check = () => {
    if (!hasInk.current) return;
    const { coverage, outRatio } = evaluate();
    setFbId((i) => i + 1);
    if (coverage >= 0.6 && outRatio <= 0.3) {
      sfx.correct();
      const praise = cheer.praise();
      void say(item.name, praise);
      setPraise(praise);
      setFeedback('good');
      setHint(null);
      const nd = new Set(done).add(item.char);
      setDone(nd);
      const groupDone = group.items.every((x) => nd.has(x.char));
      if (groupDone) {
        saveStars('write', 3);
        sfx.win();
        setParty(true);
        setTimeout(() => setParty(false), 3500);
      }
      setTimeout(() => {
        const nextIdx = group.items.findIndex((x, i) => i > idx && !nd.has(x.char));
        const anyIdx = group.items.findIndex((x) => !nd.has(x.char));
        const target = nextIdx >= 0 ? nextIdx : anyIdx;
        if (target >= 0) setIdx(target);
        else {
          resetCanvas();
          drawGuide();
        }
      }, 2000);
    } else {
      sfx.wrong();
      setFeedback('bad');
      const h = outRatio > 0.3 ? t.writeOutside : t.writeMore;
      setHint(h);
      void say(h);
    }
  };

  const clear = () => {
    resetCanvas();
    setFeedback(null);
    setHint(null);
  };

  return (
    <GameShell title={t.gWriteTitle} onBack={onBack} accent={ACCENT}>
      {party && <Confetti />}
      {/* Grupos */}
      <div className="flex gap-2 justify-center mb-3">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setGroupId(g.id);
              setIdx(0);
            }}
            className={`chunky px-4 py-2 font-bold font-hebrew ${
              g.id === groupId ? 'text-white' : 'bg-white border-[#efe1bf]'
            }`}
            style={g.id === groupId ? { background: ACCENT, borderColor: EDGE, ['--chunk' as string]: EDGE } : undefined}
          >
            {g.id === 1 ? t.writeGroup1 : g.id === 2 ? t.writeGroup2 : t.writeGroup3}
          </button>
        ))}
      </div>

      {/* Letras del grupo */}
      <div className="flex flex-wrap gap-2 justify-center mb-4" dir="rtl">
        {group.items.map((x, i) => (
          <button
            key={x.char}
            onClick={() => setIdx(i)}
            className={`w-11 h-11 rounded-xl border-2 text-2xl font-bold font-hebrew transition ${
              i === idx
                ? 'border-[#f5b014] bg-[#fff4d6] scale-110'
                : done.has(x.char)
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-[#efe1bf] bg-white'
            }`}
          >
            {x.char}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <p className="font-semibold">{t.writeAsk}</p>
        <span className="text-xl font-bold font-hebrew" dir="rtl">{item.name}</span>
        <SpeakButton text={[SAY.writeAsk, item.name]} size="sm" />
      </div>

      <div ref={wrapRef} className="w-full max-w-[420px] mx-auto">
        <div className="relative mx-auto bg-white rounded-3xl border-2 border-[#efe1bf] shadow-[0_6px_0_#efd9a6] overflow-hidden" style={{ width: 'fit-content' }}>
          <canvas ref={guideRef} className="block" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none cursor-crosshair"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={onUp}
          />
        </div>
      </div>

      <Feedback kind={feedback} id={fbId} text={feedback === 'good' ? praise : undefined} />
      {hint && <p className="text-center text-rose-600 -mt-1 mb-2">{hint}</p>}

      <div className="flex gap-3 justify-center">
        <button onClick={clear} className="chunky bg-white border-[#e8dcc6] px-5 py-3 font-bold flex items-center gap-2">
          <Eraser className="w-5 h-5" /> {t.clear}
        </button>
        <PrimaryButton onClick={check}>
          <Check className="w-6 h-6" /> {t.check}
        </PrimaryButton>
      </div>
    </GameShell>
  );
}
