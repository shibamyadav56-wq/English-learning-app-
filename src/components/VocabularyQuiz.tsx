import { useState } from 'react';
import { X, Trophy, Gem } from 'lucide-react';
import { WORD_LIST } from '../constants/wordList';

export default function VocabularyQuiz({ unlockedCount, onClose, onComplete }: { unlockedCount: number, onClose: () => void, onComplete: (points: number) => void }) {
  const availableWords = WORD_LIST.slice(0, unlockedCount);
  const [quizWords] = useState(() => {
    const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [points, setPoints] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheck = () => {
    if (input.toLowerCase().trim() === quizWords[currentIndex].english.toLowerCase()) {
      setPoints(prev => prev + 1);
      setFeedback('Correct!');
      setTimeout(() => {
        setFeedback('');
        setInput('');
        if (currentIndex + 1 < quizWords.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Quiz finished
          setShowSuccess(true);
        }
      }, 1000);
    } else {
      setFeedback('Incorrect!');
      setShowTryAgain(true);
    }
  };

  const handleTryAgain = () => {
    setFeedback('');
    setShowTryAgain(false);
    setInput('');
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center">
        <Trophy size={100} className="text-yellow-500 mb-6" />
        <h2 className="text-5xl font-bold text-green-600 mb-4 font-display">Very Good!</h2>
        <p className="text-2xl text-gray-700 mb-8">You have mastered these words!</p>
        <div className="flex items-center gap-2 text-3xl font-bold text-accent mb-8">
          <Gem size={40} /> +5 Diamonds
        </div>
        <button 
          onClick={() => onComplete(10)} 
          className="bg-primary text-white px-12 py-4 rounded-full font-bold text-xl hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">Vocabulary Quiz</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <p className="mb-4 text-lg text-gray-700">Translate: <span className="font-bold text-primary">{quizWords[currentIndex]?.hindi}</span></p>
        
        {!showTryAgain ? (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 outline-none focus:border-primary text-lg"
              placeholder="English translation..."
            />
            <button onClick={handleCheck} className="w-full bg-primary text-white p-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition">Check</button>
          </>
        ) : (
          <button onClick={handleTryAgain} className="w-full bg-red-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition">Try Again</button>
        )}
        
        <p className={`mt-4 text-center font-semibold text-lg ${feedback === 'Correct!' ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>
        <p className="mt-2 text-center text-gray-500">Points: {points} / 10</p>
      </div>
    </div>
  );
}
