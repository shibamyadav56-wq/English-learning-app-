import { useState, useEffect } from 'react';
import VocabularyQuiz from './VocabularyQuiz';
import { WORD_LIST } from '../constants/wordList';
import { ChevronRight } from 'lucide-react';
import Notification from './Notification';

export default function WordMeaning({ setDiamonds }: { setDiamonds: (d: number | ((prev: number) => number)) => void }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [unlockedWords, setUnlockedWords] = useState(() => {
    const saved = localStorage.getItem('unlockedWords');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    localStorage.setItem('unlockedWords', unlockedWords.toString());
  }, [unlockedWords]);

  const levelWords = WORD_LIST.slice((currentLevel - 1) * 100, currentLevel * 100);
  const totalLevels = Math.ceil(WORD_LIST.length / 100);

  const handleQuizComplete = (points: number) => {
    setShowQuiz(false);
    if (points === 10) {
      setUnlockedWords(prev => Math.min(prev + 10, WORD_LIST.length));
      setDiamonds(prev => prev + 5); // Award 5 diamonds
      setNotification({
        isOpen: true,
        message: 'Shabash! Aapne quiz poori kar li hai. 10 naye shabd unlock ho gaye hain aur aapko 5 diamonds mile hain!',
        type: 'success',
        title: 'Quiz Complete! 💎'
      });
    } else {
      setNotification({
        isOpen: true,
        message: 'Quiz poori ho gayi. Agli baar naye shabd unlock karne ke liye sabhi sawal sahi karein!',
        type: 'info',
        title: 'Koshish Jari Rakhein'
      });
    }
  };

  return (
    <div className="p-4 bg-warm-bg min-h-screen pb-20">
      <h1 className="text-3xl font-bold mb-6 text-center font-display text-gray-900">Word Meaning</h1>
      
      {/* Level Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
        {Array.from({ length: totalLevels }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentLevel(i + 1)}
            className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
              currentLevel === i + 1
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            Level {i + 1}
          </button>
        ))}
      </div>

      <button 
        onClick={() => setShowQuiz(true)}
        className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold mb-6 shadow-lg hover:bg-green-700 transition flex justify-between items-center"
      >
        <div className="flex flex-col items-start">
          <span>Vocabulary Quiz</span>
          <span className="text-xs font-normal opacity-80">Unlock 10 more words</span>
        </div>
        <ChevronRight />
      </button>
      
      <div className="space-y-4">
        {levelWords.map((word, index) => {
          const absoluteIndex = (currentLevel - 1) * 100 + index;
          const isUnlocked = absoluteIndex < unlockedWords;
          
          return (
            <div 
              key={absoluteIndex} 
              className={`relative overflow-hidden p-4 rounded-2xl shadow-sm transition-all duration-500 ${
                isUnlocked 
                  ? 'bg-white border border-gray-100' 
                  : 'bg-white/50 border border-gray-50'
              }`}
            >
              {isUnlocked ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="font-bold text-lg text-gray-900">{word.english} - {word.hindi}</p>
                  <p className="text-gray-600 italic">{word.example}</p>
                  <p className="text-gray-500 text-sm">{word.exampleHindi}</p>
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center">
                    <div className="flex gap-1 opacity-20">
                      {[1, 2, 3].map((n) => (
                        <div 
                          key={n} 
                          className="w-8 h-8 bg-gray-400 rounded-full blur-md animate-pulse" 
                          style={{ animationDelay: `${n * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span className="absolute font-bold text-gray-400 tracking-widest uppercase text-xs">Locked</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showQuiz && <VocabularyQuiz unlockedCount={unlockedWords} onClose={() => setShowQuiz(false)} onComplete={handleQuizComplete} />}
      <Notification 
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        message={notification.message}
        type={notification.type}
        title={notification.title}
      />
    </div>
  );
}
