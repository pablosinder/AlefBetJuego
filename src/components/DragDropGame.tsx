import { useState, useEffect, useRef } from 'react';
import { HebrewLetter } from '../lib/supabase';
import { generateGameImages, GameImage } from '../lib/gameUtils';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import FeedbackOverlay from './FeedbackOverlay';
import LetterCard from './LetterCard';

interface DragDropGameProps {
  letter: HebrewLetter;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  total: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  allLetters: HebrewLetter[];
}

export default function DragDropGame({
  letter,
  onNext,
  onPrevious,
  currentIndex,
  total,
  canGoNext,
  canGoPrevious,
  allLetters,
}: DragDropGameProps) {
  const [gameImages, setGameImages] = useState<GameImage[]>([]);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    show: boolean;
  } | null>(null);
  const [disabled, setDisabled] = useState(false);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);
  const letterDropZoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setGameImages(generateGameImages(allLetters, currentIndex));
    setFeedback(null);
    setDisabled(false);
    setDraggedImage(null);
  }, [letter, currentIndex, allLetters]);

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const playErrorSound = () => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (disabled) return;
    setDraggedImage(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || !draggedImage) return;
    e.preventDefault();

    const draggedImg = gameImages.find((img) => img.id === draggedImage);
    if (!draggedImg) return;

    setDisabled(true);

    if (draggedImg.isCorrect) {
      playSuccessSound();
      setFeedback({ isCorrect: true, show: true });
    } else {
      playErrorSound();
      setFeedback({ isCorrect: false, show: true });
    }

    setDraggedImage(null);
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    id: string
  ) => {
    if (disabled) return;
    setDraggedImage(id);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || !draggedImage) return;

    const touch = e.changedTouches[0];
    const dropZone = letterDropZoneRef.current;

    if (!dropZone) return;

    const rect = dropZone.getBoundingClientRect();
    const isInDropZone =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;

    if (isInDropZone) {
      const draggedImg = gameImages.find((img) => img.id === draggedImage);
      if (draggedImg) {
        setDisabled(true);

        if (draggedImg.isCorrect) {
          playSuccessSound();
          setFeedback({ isCorrect: true, show: true });
        } else {
          playErrorSound();
          setFeedback({ isCorrect: false, show: true });
        }
      }
    }

    setDraggedImage(null);
  };

  const handleFeedbackComplete = () => {
    setFeedback(null);
    setDisabled(false);
  };

  const [isPressed, setIsPressed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onPlayAudio = () => {
    const currentLetter = letter;
    if (!currentLetter?.audio_url) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = new Audio(currentLetter.audio_url);
    audioRef.current.play().catch((err) => {
      console.error('Error playing audio:', err);
    });
  };

  const handleClick = () => {
    setIsPressed(true);
    onPlayAudio();
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 ">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-4 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            {/* <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
              {letter.letter}
            </h1> */}
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Arrastra la imagen correcta hacia la letra
          </p>
        </header>

        <div className="space-y-8 sm:space-y-12">
          <div
            onClick={handleClick}
            ref={letterDropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 border-4 border-orange-200 transition-all hover:shadow-xl cursor-pointer min-h-40 flex items-center justify-center"
          >
              
            <button 
              className={`justify-items-center transition-all duration-200 active:scale-105 ${
              isPressed ? 'scale-90' : ''
              } `}>
              <div className="w-[5] top-4 right-4 sm:top-6 sm:right-6 bg-orange-500 text-white p-2 sm:p-3 rounded-full shadow-lg">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              
              <p className="text-gray-400 text-sm sm:text-base mb-2">
                Suelta aquí
              </p>
              <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-300">
                {letter.letter}
              </div>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {gameImages.map((img) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, img.id)}
                onTouchStart={(e) => handleTouchStart(e, img.id)}
                onTouchEnd={handleTouchEnd}
                className={`rounded-2xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 ${
                  draggedImage === img.id ? 'opacity-50 scale-95' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-32 sm:h-40 md:h-48 object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all sm:w-auto justify-center ${
                canGoPrevious
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="text-center flex-shrink-0">
              <p className="text-sm sm:text-lg font-semibold text-gray-700">
                {currentIndex + 1} de {total}
              </p>
              <div className="flex gap-1 mt-2 justify-center">
                {Array.from({ length: total }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'bg-orange-500 w-6'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={onNext}
              disabled={!canGoNext}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all sm:w-auto justify-center ${
                canGoNext
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <FeedbackOverlay
          isCorrect={feedback.isCorrect}
          onComplete={handleFeedbackComplete}
        />
      )}
    </div>
  );
}
