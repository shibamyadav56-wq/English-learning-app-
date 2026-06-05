import React, { useState, useEffect } from 'react';
import { WordBankQuestion } from '../../types/exercises';

export const WordBank: React.FC<{ question: WordBankQuestion, onAnswer: (answer: string[], hindi: string, english: string) => void }> = ({ question, onAnswer }) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState(question.chips || question.options || []);
  const [error, setError] = useState<boolean>(false);

  // Added useEffect to reset state if question changes, just in case
  useEffect(() => {
    setSelectedWords([]);
    setAvailableWords(question.chips || question.options || []);
    setError(false);
  }, [question]);

  const toggleWord = (word: string, isSelected: boolean) => {
    setError(false);
    if (isSelected) {
      setSelectedWords(prev => prev.filter(w => w !== word));
      setAvailableWords(prev => [...prev, word]);
    } else {
      setSelectedWords(prev => [...prev, word]);
      setAvailableWords(prev => prev.filter(w => w !== word));
    }
  };

  const checkAnswer = () => {
    onAnswer(selectedWords, question.hindi, question.english);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{question.hindi}</h2>
      <div className="min-h-20 p-4 bg-slate-100 rounded-xl flex flex-wrap gap-2 border-b-2 border-slate-300">
        {selectedWords.map((word, idx) => (
          <button key={`${word}-${idx}`} onClick={() => toggleWord(word, true)} className={`px-4 py-2 text-white rounded-lg font-bold ${error ? 'bg-red-400' : 'bg-blue-500'} border-b-4 ${error ? 'border-red-600' : 'border-blue-700'}`}>
            {word}
          </button>
        ))}
      </div>
      
      {error && (
        <div className="text-red-500 font-bold p-2 bg-red-50 rounded-lg">
          Correct: {question.correctOrder.join(' ')}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {availableWords.map((word, idx) => (
          <button key={`${word}-${idx}`} onClick={() => toggleWord(word, false)} className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg font-bold text-slate-700 border-b-4 active:border-b-0 active:translate-y-[2px] transition-all">
            {word}
          </button>
        ))}
      </div>
      <button onClick={checkAnswer} className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-[4px] transition-all">
        CHECK
      </button>
    </div>
  );
};
