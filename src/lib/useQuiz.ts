import { useCallback, useRef, useState } from 'react';
import { juice } from './juice';
import { say } from './audio';
import { cheer, STREAK_AT } from './cheer';
import { saveStars, starsFor } from './progress';

/** Estado común de los juegos por rondas: ronda actual, aciertos, errores y mensaje. */
export function useQuiz(gameId: string, total: number) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [fbId, setFbId] = useState(0);
  const [done, setDone] = useState(false);
  const [stars, setStars] = useState(0);
  // Si el primer intento de la ronda fue correcto, cuenta como acierto.
  const [missedThisRound, setMissedThisRound] = useState(false);
  // Rondas seguidas sin errores.
  const streak = useRef(0);
  const missedRef = useRef(false);

  /** Acierto: sonido + (frases opcionales) + un elogio (o festejo de racha). */
  const good = useCallback((...before: string[]) => {
    juice.correct();
    const s = missedRef.current ? 0 : streak.current + 1;
    const text = STREAK_AT.has(s) ? cheer.streak() : cheer.praise();
    void say(...before, text);
    setFeedbackText(text);
    setFeedback('good');
    setFbId((i) => i + 1);
  }, []);

  /** Error: sonido + (frases opcionales) + una frase de ánimo. */
  const bad = useCallback((...before: string[]) => {
    juice.wrong();
    const text = cheer.encourage();
    void say(...before, text);
    setFeedbackText(text);
    setFeedback('bad');
    setFbId((i) => i + 1);
    setMistakes((m) => m + 1);
    setMissedThisRound(true);
    missedRef.current = true;
  }, []);

  const next = useCallback(() => {
    const newCorrect = correct + (missedThisRound ? 0 : 1);
    streak.current = missedRef.current ? 0 : streak.current + 1;
    missedRef.current = false;
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
    streak.current = 0;
    missedRef.current = false;
  }, []);

  return { round, correct, mistakes, feedback, feedbackText, fbId, done, stars, good, bad, next, reset };
}
