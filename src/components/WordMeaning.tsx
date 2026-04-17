import { useState, useEffect } from 'react';
import VocabularyQuiz from './VocabularyQuiz';
import { WORD_LIST } from '../constants/wordList';
import { ChevronRight } from 'lucide-react';

export default function WordMeaning({ setDiamonds }: { setDiamonds: (d: number | ((prev: number) => number)) => void }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [unlockedWords, setUnlockedWords] = useState(() => {
    const saved = localStorage.getItem('unlockedWords');
    return saved ? parseInt(saved, 10) : 10;
  });

  useEffect(() => {
    localStorage.setItem('unlockedWords', unlockedWords.toString());
  }, [unlockedWords]);

  const handleQuizComplete = (points: number) => {
    setShowQuiz(false);
    if (points === 10) {
      setUnlockedWords(prev => prev + 10);
      setDiamonds(prev => prev + 5); // Award 5 diamonds
      alert('Quiz completed! 10 new words unlocked and 5 diamonds awarded!');
    } else {
      alert('Quiz completed! Try again to unlock more words!');
    }
  };

  return (
    <div className="p-4 bg-warm-bg min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center font-display text-gray-900">Word Meaning</h1>
      <button 
        onClick={() => setShowQuiz(true)}
        className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold mb-6 shadow-lg hover:bg-green-700 transition flex justify-between items-center"
      >
        <span>Vocabulary Quiz</span>
        <ChevronRight />
      </button>
      
      <div className="space-y-4">
        {WORD_LIST.map((word, i) => (
          <div 
            key={i} 
            className={`relative overflow-hidden p-4 rounded-2xl shadow-sm transition-all duration-500 ${
              i < unlockedWords 
                ? 'bg-white border border-gray-100' 
                : 'bg-white border border-gray-50'
            }`}
          >
            {i < unlockedWords ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="font-bold text-lg text-gray-900">{word.english} - {word.hindi}</p>
                <p className="text-gray-600 italic">{word.example}</p>
                <p className="text-gray-500 text-sm">{word.exampleHindi}</p>
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center">
                {/* Cloud/Fog Effect Overlay */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <div 
                        key={n} 
                        className="w-8 h-8 bg-gray-100 rounded-full blur-md animate-pulse" 
                        style={{ animationDelay: `${n * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <span className="absolute font-bold text-gray-300 tracking-widest uppercase text-xs">Locked</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showQuiz && <VocabularyQuiz unlockedCount={unlockedWords} onClose={() => setShowQuiz(false)} onComplete={handleQuizComplete} />}
    </div>
  );
}
