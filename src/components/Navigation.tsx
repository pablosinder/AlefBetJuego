import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  total: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export default function Navigation({
  onPrevious,
  onNext,
  currentIndex,
  total,
  canGoPrevious,
  canGoNext,
}: NavigationProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
          canGoPrevious
            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
        Anterior
      </button>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">
          {currentIndex + 1} de {total}
        </p>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: total }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-orange-500 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
          canGoNext
            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Siguiente
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
