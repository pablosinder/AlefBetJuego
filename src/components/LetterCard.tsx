import { Volume2 } from 'lucide-react';
import { HebrewLetter } from '../lib/supabase';
import { useState } from 'react';

interface LetterCardProps {
  letter: HebrewLetter;
  onPlayAudio: () => void;
}

export default function LetterCard({ letter, onPlayAudio }: LetterCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onPlayAudio();
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <button
        onClick={handleClick}
        className={`relative bg-white rounded-3xl shadow-2xl p-12 transition-all duration-200 hover:scale-105 active:scale-95 ${
          isPressed ? 'scale-95' : ''
        } border-4 border-orange-200`}
      >
        <div className="absolute top-6 right-6 bg-orange-500 text-white p-3 rounded-full shadow-lg">
          <Volume2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-8">
          <div className="text-9xl font-bold text-gray-800 leading-none">
            {letter.letter}
          </div>

          <div className="space-y-2">
            <p className="text-4xl font-semibold text-orange-600">
              {letter.letter_name_hebrew}
            </p>
            <p className="text-2xl text-gray-600">{letter.letter_name}</p>
          </div>

          <div className="border-t-2 border-orange-200 pt-6 space-y-2">
            <p className="text-3xl font-semibold text-blue-600">
              {letter.object_name_hebrew}
            </p>
            <p className="text-xl text-gray-600">{letter.object_name}</p>
          </div>
        </div>
      </button>

      <p className="mt-6 text-gray-500 text-sm flex items-center gap-2">
        <Volume2 className="w-4 h-4" />
        Haz click en la tarjeta para escuchar
      </p>
    </div>
  );
}
