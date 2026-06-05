import React, { useState, useEffect, useMemo } from 'react';
import { MatchingPairsQuestion } from '../../types/exercises';

export const MatchingPairs: React.FC<{ question: MatchingPairsQuestion, onAnswer: (isCorrect: boolean) => void }> = ({ question, onAnswer }) => {
  const [selectedEng, setSelectedEng] = useState<string | null>(null);
  const [selectedHin, setSelectedHin] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set()); // Will store "english|hindi" pairs
  const [wrongMatch, setWrongMatch] = useState<boolean>(false);

  const englishWords = useMemo(() => [...question.pairs].sort(() => 0.5 - Math.random()), [question.pairs]);
  const hindiWords = useMemo(() => [...question.pairs].sort(() => 0.5 - Math.random()), [question.pairs]);

  const checkMatch = (eng: string, hin: string) => {
    const pair = question.pairs.find(p => p.english === eng);
    if (pair && pair.hindi === hin) {
      const newMatched = new Set(matched).add(`${eng}|${hin}`);
      setMatched(newMatched);
      if (newMatched.size === question.pairs.length) {
        onAnswer(true);
      }
    } else {
      setWrongMatch(true);
      setTimeout(() => {
        onAnswer(false);
        setWrongMatch(false);
      }, 500);
    }
    setSelectedEng(null);
    setSelectedHin(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-slate-800">सही जोड़ियाँ मिलाएँ (Match the Pairs)</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column: English Words */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 text-center border-b border-slate-100 pb-2 mb-1">
            English Words
          </div>
          {englishWords.map(p => {
            const isMatched = Array.from<string>(matched).some((m: string) => m.startsWith(`${p.english}|`));
            const isSelected = selectedEng === p.english;
            return (
              <button 
                key={p.english} 
                disabled={isMatched}
                onClick={() => { if (selectedHin) checkMatch(p.english, selectedHin); else setSelectedEng(p.english); }}
                className={`p-4 h-14 flex items-center justify-center rounded-xl border-2 border-b-4 transition-all font-bold active:translate-y-0.5 select-none ${
                  isMatched 
                    ? 'bg-green-500 border-green-700 text-white shadow-sm cursor-not-allowed opacity-80' 
                    : isSelected 
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-black' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                {p.english}
              </button>
            );
          })}
        </div>

        {/* Right Column: Hindi Meanings */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 text-center border-b border-slate-100 pb-2 mb-1">
            Hindi Meaning
          </div>
          {hindiWords.map(p => {
            const isMatched = Array.from<string>(matched).some((m: string) => m.endsWith(`|${p.hindi}`));
            const isWrong = wrongMatch && selectedHin === p.hindi;
            const isSelected = selectedHin === p.hindi;
            return (
              <button 
                key={p.hindi} 
                disabled={isMatched}
                onClick={() => { if (selectedEng) checkMatch(selectedEng, p.hindi); else setSelectedHin(p.hindi); }}
                className={`p-4 h-14 flex items-center justify-center rounded-xl border-2 border-b-4 transition-all font-bold active:translate-y-0.5 select-none ${
                  isMatched 
                    ? 'bg-green-500 border-green-700 text-white shadow-sm cursor-not-allowed opacity-80' 
                    : isWrong
                      ? 'bg-red-500 border-red-700 text-white animate-shake'
                      : isSelected 
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-black' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                {p.hindi}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
