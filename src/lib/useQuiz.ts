import { useCallback, useState } from 'react';
import { sfx } from './sfx';
import { saveStars, starsFor } from './progress';

/** Estado común de los juegos por rondas: ronda actual, aciertos, errores y mensaje. */
export function useQuiz(gameId: string, total: number) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [fbId, setFbId] = useState(0);
  const [done, setDone] = useState(false);
  const [stars, setStars] = useState(0);
  // Si el primer intento de la ronda fue correcto, cuenta como acierto.
  const [missedThisRound, setMissedThisRound] = useState(false);

  const good = useCallback(() => {
    sfx.correct();
    setFeedback('good');
    setFbId((i) => i + 1);
  }, []);

  const bad = useCallback(() => {
    sfx.wrong();
    setFeedback('bad');
    setFbId((i) => i + 1);
    setMistakes((m) => m + 1);
    setMissedThisRound(true);
  }, []);

  const next = useCallback(() => {
    const newCorrect = correct + (missedThisRound ? 0 : 1);
    setCorrect(newCorrect);
    setFeedback(null);
    setMissedThisRound(false);
    if (round + 1 >= total) {
      const s = starsFor(newCorrect, total - newCorrect);
      setStars(s);
      saveStars(gameId, s);
      setDone(true);
    } else {
      setRound((r) => r + 1);
    }
  }, [correct, missedThisRound, round, total, gameId]);

  const reset = useCallback(() => {
    setRound(0);
    setCorrect(0);
    setMistakes(0);
    setFeedback(null);
    setDone(false);
    setStars(0);
    setMissedThisRound(false);
  }, []);

  return { round, correct, mistakes, feedback, fbId, done, stars, good, bad, next, reset };
}
