import { HebrewLetter } from './supabase';

export interface GameImage {
  id: string;
  url: string;
  name: string;
  isCorrect: boolean;
}

export function getFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase();
}

export function generateGameImages(
  letters: HebrewLetter[],
  currentLetterIndex: number
): GameImage[] {
  const currentLetter = letters[currentLetterIndex];
  const targetFirstLetter = getFirstLetter(currentLetter.object_name);

  const correctImage: GameImage = {
    id: currentLetter.id,
    url: currentLetter.image_url,
    name: currentLetter.object_name,
    isCorrect: true,
  };

  const wrongLetters = letters.filter(
    (letter, idx) =>
      idx !== currentLetterIndex &&
      getFirstLetter(letter.object_name) !== targetFirstLetter &&
      letter.image_url
  );

  const selectedWrong = wrongLetters
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((letter): GameImage => ({
      id: letter.id,
      url: letter.image_url,
      name: letter.object_name,
      isCorrect: false,
    }));

  const allImages = [correctImage, ...selectedWrong];
  return allImages.sort(() => Math.random() - 0.5);
}
