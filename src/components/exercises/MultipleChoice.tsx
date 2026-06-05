import React from 'react';
import { MultipleChoiceQuestion } from '../../types/exercises';

export const MultipleChoice: React.FC<{ question: MultipleChoiceQuestion, onAnswer: (answer: string, hindi: string, english: string) => void }> = ({ question, onAnswer }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{question.hindi}</h2>
      <p className="text-lg">{question.english.replace('___', '_______')}</p>
      <div className="space-y-2">
        {question.options.map(option => (
          <button 
            key={option} 
            onClick={() => onAnswer(option, question.hindi, question.english)} 
            className="w-full p-4 bg-white border border-slate-300 rounded-xl text-left"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
