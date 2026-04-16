import { useState } from 'react';
import { X, Trophy, Gem } from 'lucide-react';
import { EXERCISES } from '../constants/exercises';

export default function ExerciseQuiz({ exerciseNumber, onClose, onComplete }: { exerciseNumber: number, onClose: () => void, onComplete: () => void }) {
  const exerciseData = EXERCISES[exerciseNumber as keyof typeof EXERCISES] || { questions: [] };
  const questions = exerciseData.questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [points, setPoints] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleCheck = (userAnswer: string) => {
    if (userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()) {
      setFeedback('Correct!');
      setPoints(prev => prev + 1);
      
      setTimeout(() => {
        setFeedback('');
        setInput('');
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setShowSuccess(true);
        }
      }, 1000);
    } else {
      setFeedback('Incorrect!');
      setShowTryAgain(true);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center">
        <Trophy size={100} className="text-yellow-500 mb-6" />
        <h2 className="text-5xl font-bold text-green-600 mb-4 font-display">Very Good!</h2>
        <p className="text-2xl text-gray-700 mb-8">You have completed Exercise {exerciseNumber}!</p>
        <div className="flex items-center gap-2 text-3xl font-bold text-accent mb-8">
          <Gem size={40} /> +5 Diamonds
        </div>
        <button 
          onClick={() => onComplete()} 
          className="bg-primary text-white px-12 py-4 rounded-full font-bold text-xl hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-warm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">Exercise {exerciseNumber}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        
        {/* Image and Hint Section */}
        {currentQuestion.image && (
          <div className="text-6xl text-center mb-4">{currentQuestion.image}</div>
        )}
        {currentQuestion.hint && (
          <p className="text-center text-gray-600 mb-6 italic">💡 {currentQuestion.hint}</p>
        )}
        
        {/* Question Section */}
        <p className="mb-6 text-xl font-bold text-center text-gray-900">{currentQuestion.question}</p>
        
        {currentQuestion.type === 'mcq' ? (
          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option: string, i: number) => (
              <button key={i} onClick={() => handleCheck(option)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-primary text-left font-medium transition">{option}</button>
            ))}
          </div>
        ) : (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-6 outline-none focus:border-primary text-lg"
              placeholder="Your answer..."
            />
            {!showTryAgain ? (
              <button onClick={() => handleCheck(input)} className="w-full bg-primary text-white p-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition">Check</button>
            ) : (
              <button onClick={() => { setFeedback(''); setShowTryAgain(false); }} className="w-full bg-red-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition">Try Again</button>
            )}
          </>
        )}
        
        <p className={`mt-4 text-center font-semibold text-lg ${feedback === 'Correct!' ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>
        <p className="mt-2 text-center text-gray-500">Points: {points} / {questions.length}</p>
      </div>
    </div>
  );
}
