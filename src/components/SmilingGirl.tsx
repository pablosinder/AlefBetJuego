import { useState } from 'react';

export default function SmilingGirl() {
  const [isSmiling, setIsSmiling] = useState(false);

  const handleClick = () => {
    setIsSmiling(!isSmiling);
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-pink-100 to-purple-100">
      <button
        onClick={handleClick}
        className="focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        {/* Face */}
        <div className="relative w-48 h-48 bg-yellow-100 rounded-full shadow-2xl border-4 border-yellow-300 flex items-center justify-center">
          {/* Left Eye */}
          <div className="absolute top-16 left-12 flex flex-col items-center">
            <div className="w-6 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
              <div className="w-3 h-4 bg-gray-800 rounded-full"></div>
            </div>
          </div>

          {/* Right Eye */}
          <div className="absolute top-16 right-12 flex flex-col items-center">
            <div className="w-6 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
              <div className="w-3 h-4 bg-gray-800 rounded-full"></div>
            </div>
          </div>

          {/* Nose */}
          <div className="absolute top-28 w-4 h-6 bg-yellow-200 border-2 border-yellow-300 rounded-full"></div>

          {/* Mouth */}
          <div className="absolute bottom-12">
            {isSmiling ? (
              // Smile
              <svg width="80" height="50" viewBox="0 0 80 50" className="animate-pulse">
                <path
                  d="M 20 20 Q 40 50 60 20"
                  stroke="#FF6B6B"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            ) : (
              // Neutral mouth
              <svg width="80" height="30" viewBox="0 0 80 30">
                <line
                  x1="20"
                  y1="15"
                  x2="60"
                  y2="15"
                  stroke="#FF6B6B"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            )}
          </div>

          {/* Rosy Cheeks */}
          <div className="absolute top-24 left-4 w-8 h-8 bg-pink-300 rounded-full opacity-40 blur-md"></div>
          <div className="absolute top-24 right-4 w-8 h-8 bg-pink-300 rounded-full opacity-40 blur-md"></div>

          {/* Hair */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-56 h-24 bg-purple-400 rounded-t-full rounded-b-3xl -z-10 shadow-lg"></div>
        </div>

        {/* Instructions */}
        <p className="text-center mt-8 text-gray-700 font-semibold text-lg">
          ¡Haz clic para hacerla sonreír!
        </p>
      </button>
    </div>
  );
}
