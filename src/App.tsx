import { useEffect, useState, useRef } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { supabase, HebrewLetter } from './lib/supabase';
import { mockHebrewLetters } from './lib/mockData';
import DragDropGame from './components/DragDropGame';

function App() {
  const [letters, setLetters] = useState<HebrewLetter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLetters();
  }, []);


  const loadLetters = async () => {
    // try {
    //   setLoading(true);
    //   setError(null);

      
    //   const { data, error: fetchError } = await supabase
    //   .from('hebrew_letters')
    //   .select('*')
    //   .order('order_index', { ascending: true });
      
    //   if (fetchError) throw fetchError;
      
        
    //   if (data && data.length > 0) {
    //     setLetters(data);
    //   } else {
    //     setLetters(mockHebrewLetters);
    //     setError('No se encontraron letras. Por favor, agrega contenido a la base de datos.');
    //   }
    // } catch (err) {
    //   console.error('Error loading letters:', err);
    //   setError('Error al cargar las letras del alfabeto');
    // } finally {
    //   setLoading(false);
    // }
      console.log('MockData:', mockHebrewLetters);
      setLetters(mockHebrewLetters);
      setLoading(false);

  };


  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < letters.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando alfabeto hebreo...</p>
        </div>
      </div>
    );
  }

  if (error || letters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sin contenido
          </h2>
          <p className="text-gray-600">
            {error || 'No hay letras disponibles en este momento.'}
          </p>
        </div>
      </div>
    );
  }

  const currentLetter = letters[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-800">
              Alfabeto Hebreo
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Aprende las letras del Alef Bet
          </p>
        </header>

        <DragDropGame
          letter={currentLetter}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentIndex={currentIndex}
          total={letters.length}
          canGoNext={currentIndex < letters.length - 1}
          canGoPrevious={currentIndex > 0}
          allLetters={letters}
        />
      </div>
    </div>
  );
}

export default App;
