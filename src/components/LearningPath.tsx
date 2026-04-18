import { useState, useEffect } from 'react';
import { Skull, Lock, Star, Zap, Trophy } from 'lucide-react';
import ExerciseQuiz from './ExerciseQuiz';
import { EXERCISES } from '../constants/exercises';
import Notification from './Notification';

export default function LearningPath({ setDiamonds }: { setDiamonds: (d: number | ((prev: number) => number)) => void }) {
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseToLoad, setExerciseToLoad] = useState<number>(0);
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info',
  });
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [completedExercises, setCompletedExercises] = useState<number[]>(() => {
    const saved = localStorage.getItem('completedExercises');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  const handleExercise = (level: number) => {
    const exerciseNumber = level;
    const safeExerciseNumber = EXERCISES[exerciseNumber as keyof typeof EXERCISES] ? exerciseNumber : 1;
    
    const difficulty = EXERCISES[safeExerciseNumber as keyof typeof EXERCISES].difficulty;
    setExerciseToLoad(safeExerciseNumber);
    setCurrentDifficulty(difficulty as 'easy' | 'medium' | 'hard');
    setShowExercise(true);
  };

  const handleExerciseComplete = () => {
    setShowExercise(false);
    
    const reward = currentDifficulty === 'hard' ? 7 : 5;
    setDiamonds(prev => prev + reward);
    
    if (!completedExercises.includes(exerciseToLoad)) {
      setCompletedExercises(prev => [...prev, exerciseToLoad]);
    }
    
    setNotification({
      isOpen: true,
      message: `Mubarak ho! Aapne exercise poori kar li hai aur ${reward} diamonds kama liye hain!`,
      type: 'success',
      title: 'Exercise Complete! 💎'
    });
  };

  return (
    <div className="bg-emerald-50/50 min-h-screen pb-40">
      <div className="pt-8 px-6 mb-10">
        <h1 className="text-4xl font-black text-emerald-900 tracking-tight leading-none">Learning Path</h1>
        <p className="text-emerald-600 font-bold mt-2 opacity-80 uppercase tracking-widest text-[10px]">Your Journey to Fluency</p>
      </div>
      
      <div className="relative z-10 space-y-2 flex flex-col items-center">
        {Array.from({ length: 100 }).map((_, i) => {
          const level = i + 1;
          const difficulty = EXERCISES[level as keyof typeof EXERCISES]?.difficulty || 'easy';
          const isHard = difficulty === 'hard';
          const isUnlocked = level === 1 || completedExercises.includes(level - 1);
          const isCompleted = completedExercises.includes(level);
          
          // Calculate horizontal offset for a "snake" path
          const offset = Math.sin(i * 0.8) * 40;
          
          return (
            <div key={level} className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
              {i > 0 && (
                <div className="h-12 w-2 bg-emerald-100 rounded-full mb-2 opacity-50 shadow-inner" />
              )}
              
              <button 
                onClick={() => isUnlocked && handleExercise(level)}
                className={`group relative w-24 h-24 rounded-[32px] flex flex-col items-center justify-center border-b-8 shadow-xl transition-all active:scale-90 active:border-b-0 active:translate-y-2 ${
                  !isUnlocked ? 'bg-slate-300 border-slate-400 cursor-not-allowed grayscale' :
                  isCompleted ? 'bg-green-500 border-green-700 hover:bg-green-600' :
                  isHard ? 'bg-rose-500 border-rose-700 hover:bg-rose-600' : 
                  difficulty === 'medium' ? 'bg-amber-500 border-amber-700 hover:bg-amber-600' :
                  'bg-sky-500 border-sky-700 hover:bg-sky-600'
                }`}
              >
                {!isUnlocked ? <Lock className="text-white opacity-50" size={32} /> :
                 isCompleted ? <Trophy className="text-white" size={40} strokeWidth={2.5} /> :
                 isHard ? <Skull className="text-white animate-pulse" size={32} /> : 
                 difficulty === 'medium' ? <Zap className="text-white" size={32} /> :
                 <Star className="text-white" size={36} fill="white" />}
                
                {isUnlocked && !isCompleted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm border border-emerald-100 uppercase whitespace-nowrap">
                    START
                  </div>
                )}
              </button>
              
              <div className={`mt-2 font-black text-sm tracking-tighter ${isUnlocked ? 'text-emerald-900 opacity-60' : 'text-slate-400 opacity-40'}`}>
                LEVEL {level}
              </div>
            </div>
          );
        })}
      </div>
      {showExercise && (
        <div className="fixed inset-0 z-50 bg-white">
          <ExerciseQuiz exerciseNumber={exerciseToLoad} onClose={() => setShowExercise(false)} onComplete={handleExerciseComplete} />
        </div>
      )}
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
