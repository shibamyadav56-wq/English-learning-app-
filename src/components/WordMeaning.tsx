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
    <div className="bg-orange-50/30 min-h-screen pb-40">
      <div className="pt-8 px-6 mb-4">
        <h1 className="text-4xl font-black text-orange-900 tracking-tight leading-none">Vocabulary</h1>
        <p className="text-orange-600 font-bold mt-2 opacity-80 uppercase tracking-widest text-[10px]">Learn 1000+ Words</p>
      </div>
      
      {/* Level Tabs */}
      <div className="flex gap-2 overflow-x-auto px-6 py-4 scrollbar-hide">
        {Array.from({ length: totalLevels }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentLevel(i + 1)}
            className={`px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all bounce-click ${
              currentLevel === i + 1
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white text-slate-400 border border-slate-100 font-bold'
            }`}
          >
            Level {i + 1}
          </button>
        ))}
      </div>

      <div className="px-6 mb-8">
        <button 
          onClick={() => setShowQuiz(true)}
          className="w-full bg-slate-900 text-white p-6 rounded-[32px] font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition flex justify-between items-center bounce-click group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex flex-col items-start relative z-10">
            <span className="text-xl font-black">Vocabulary Quiz</span>
            <span className="text-xs font-medium opacity-60">Unlock next 10 words</span>
          </div>
          <div className="bg-white/10 p-2 rounded-xl relative z-10 transition-transform group-hover:translate-x-1">
             <ChevronRight size={24} strokeWidth={3} />
          </div>
        </button>
      </div>
      
      <div className="px-6 space-y-4">
        {levelWords.map((word, index) => {
          const absoluteIndex = (currentLevel - 1) * 100 + index;
          const isUnlocked = absoluteIndex < unlockedWords;
          
          return (
            <div 
              key={absoluteIndex} 
              className={`relative overflow-hidden p-6 rounded-[32px] transition-all duration-500 ${
                isUnlocked 
                  ? 'bg-white border border-slate-100 shadow-sm' 
                  : 'bg-slate-100/50 border border-slate-200/50 border-dashed'
              }`}
            >
              {isUnlocked ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex justify-between items-start mb-2">
                     <p className="font-black text-2xl text-slate-900 tracking-tight">{word.english}</p>
                     <span className="text-[10px] font-black bg-slate-100 text-slate-400 p-1 px-2 rounded-lg">#{absoluteIndex + 1}</span>
                  </div>
                  <p className="text-xl font-bold text-orange-600 mb-3">{word.hindi}</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 border-l-4 border-l-primary">
                    <p className="text-slate-600 font-medium italic text-sm">"{word.example}"</p>
                    <p className="text-slate-400 text-xs mt-1 font-bold">{word.exampleHindi}</p>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center">
                   <Lock className="text-slate-300" size={32} />
                   <span className="ml-3 font-black text-slate-300 uppercase tracking-widest text-xs">Locked</span>
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
