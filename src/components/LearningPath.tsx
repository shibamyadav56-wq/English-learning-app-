import { useState, useEffect } from 'react';
import { Skull, Lock, Star, Zap, Trophy } from 'lucide-react';
import ExerciseQuiz from './ExerciseQuiz';
import { EXERCISES } from '../constants/exercises';

export default function LearningPath({ setDiamonds }: { setDiamonds: (d: number | ((prev: number) => number)) => void }) {
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseToLoad, setExerciseToLoad] = useState<number>(0);
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
    
    alert(`Exercise completed! You earned ${reward} diamonds!`);
  };

  return (
    <div className="p-4 bg-green-50 min-h-screen pb-32 relative overflow-hidden">
      <h1 className="text-3xl font-bold mb-8 text-center text-green-900 relative z-10">Learning Path</h1>
      
      <div className="flex flex-col items-center gap-6 z-10 relative pb-20">
        {Array.from({ length: 100 }).map((_, i) => {
          const level = i + 1;
          const difficulty = EXERCISES[level as keyof typeof EXERCISES]?.difficulty || 'easy';
          const isHard = difficulty === 'hard';
          
          // Unlock exercise 1 by default, others if previous one is completed
          const isUnlocked = level === 1 || completedExercises.includes(level - 1);
          
          return (
            <div key={level} className="flex flex-col items-center">
              {i > 0 && <div className="h-8 w-1 border-l-4 border-dashed border-green-200 my-2" />}
              <button 
                onClick={() => isUnlocked && handleExercise(level)}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-lg transition-all ${
                  !isUnlocked ? 'bg-gray-400 border-gray-500 cursor-not-allowed' :
                  isHard ? 'bg-red-500 border-red-700 hover:bg-red-600' : 
                  difficulty === 'medium' ? 'bg-yellow-500 border-yellow-700 hover:bg-yellow-600' :
                  'bg-blue-500 border-blue-700 hover:bg-blue-600'
                }`}
              >
                {!isUnlocked ? <Lock className="text-white" /> :
                 isHard ? <Skull className="text-white" size={32} /> : 
                 difficulty === 'medium' ? <Zap className="text-white" size={32} /> :
                 <Star className="text-yellow-300" size={32} />}
                <span className="text-white font-bold text-sm">{level}</span>
              </button>
            </div>
          );
        })}
      </div>
      {showExercise && (
        <div className="fixed inset-0 z-50 bg-white">
          <ExerciseQuiz exerciseNumber={exerciseToLoad} onClose={() => setShowExercise(false)} onComplete={handleExerciseComplete} />
        </div>
      )}
    </div>
  );
}
