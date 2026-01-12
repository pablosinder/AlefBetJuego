import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  onComplete: () => void;
}

export default function FeedbackOverlay({
  isCorrect,
  onComplete,
}: FeedbackOverlayProps) {
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    setScale(1);
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-none">
      <div
        className={`transform transition-all duration-300 ${
          isCorrect
            ? 'animate-bounce'
            : 'animate-pulse'
        }`}
        style={{
          transform: `scale(${scale})`,
          animation: isCorrect ? 'bounce 0.6s ease-in-out' : 'pulse 1s ease-in-out',
        }}
      >
        {isCorrect ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-24 h-24 sm:w-32 sm:h-32 text-green-500" />
            <p className="text-2xl sm:text-3xl font-bold text-green-600 text-center px-4">
              ¡Correcto!
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-4"
            style={{
              animation: 'shake 0.5s ease-in-out',
            }}
          >
            <XCircle className="w-24 h-24 sm:w-32 sm:h-32 text-red-500" />
            <p className="text-2xl sm:text-3xl font-bold text-red-600 text-center px-4">
              Intenta de nuevo
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
