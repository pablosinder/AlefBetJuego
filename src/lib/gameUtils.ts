import { HebrewLetter } from './supabase';

export interface GameImage {
  id: string;
  letter : string;
  letter_name : string;
  letter_name_hebrew : string;
  object_name : string;
  object_name_hebrew : string;
  audio_url : string;
  image_url : string;
  created_at : string;
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
    letter: currentLetter.letter,
    letter_name: currentLetter.letter_name,
    letter_name_hebrew: currentLetter.letter_name_hebrew,
    object_name: currentLetter.object_name,
    object_name_hebrew: currentLetter.object_name_hebrew,
    audio_url: currentLetter.audio_url,
    image_url: currentLetter.image_url,
    created_at: currentLetter.created_at,
    isCorrect: true
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
      letter: letter.letter,
      letter_name: letter.letter_name,
      letter_name_hebrew: letter.letter_name_hebrew,
      object_name: letter.object_name,
      object_name_hebrew: letter.object_name_hebrew,
      audio_url: letter.audio_url,
      image_url: letter.image_url,
      created_at: letter.created_at,
      isCorrect: false
    }));

  const allImages = [correctImage, ...selectedWrong];
  return allImages.sort(() => Math.random() - 0.5);
}
