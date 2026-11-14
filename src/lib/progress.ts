// Mejor puntaje (estrellas 0–3) por juego, guardado en el navegador.

const KEY = 'alefbet.progress.v1';

export type Progress = Record<string, number>;

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Progress;
  } catch {
    return {};
  }
}

export function saveStars(gameId: string, stars: number): Progress {
  const p = loadProgress();
  p[gameId] = Math.max(p[gameId] ?? 0, stars);
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // sin almacenamiento: el juego sigue funcionando
  }
  return p;
}

export function starsFor(correct: number, mistakes: number): number {
  if (correct === 0) return 0;
  const ratio = correct / (correct + mistakes);
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  return 1;
}
