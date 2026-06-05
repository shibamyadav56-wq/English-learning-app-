import React, { useState, useEffect, useCallback } from 'react';
import { ProgressBar } from './ProgressBar';
import { HeartsDisplay } from './HeartsDisplay';
import { WordBank } from './WordBank';
import { MatchingPairs } from './MatchingPairs';
import { MultipleChoice } from './MultipleChoice';
import { LevelCompleteModal } from './LevelCompleteModal';
import { Question } from '../../types/exercises';
import { motion, AnimatePresence } from 'motion/react';

interface GameEngineProps {
  questions: Question[];
  level: number;
  onComplete: (xp: number, playNext?: boolean) => void;
  onClose: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ questions, level, onComplete, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showWarning, setShowWarning] = useState(level === 5);
  const [lives, setLives] = useState(5);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', message: string } | null>(null);

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  const [isValidating, setIsValidating] = useState(false);
  const nextQuestion = useCallback(() => {
    setFeedback(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowComplete(true);
    }
  }, [currentIdx, questions.length]);

  const handleAnswer = useCallback(async (answer: string | string[] | boolean, questionHindi?: string, questionEnglish?: string) => {
    if (typeof answer === 'boolean') {
      if (answer) {
        setXp(prev => prev + 10);
        setFeedback({ type: 'correct', message: 'Good! Very Good!' });
        setTimeout(nextQuestion, 1500); 
      } else {
        setStreak(0);
        setFeedback({ type: 'wrong', message: 'Incorrect!' });
        setLives(prev => Math.max(prev - 1, 0));
      }
      return;
    }

    setIsValidating(true);
    try {
      // Local validation
      let isCorrect = false;
      let feedbackMsg = "Incorrect! Try again.";
      
      if (currentQuestion.type === 'WORD_BANK' && 'correctOrder' in currentQuestion) {
        const userAnswer = Array.isArray(answer) ? answer.join(" ") : answer;
        isCorrect = userAnswer === currentQuestion.correctOrder.join(" ");
        feedbackMsg = isCorrect ? "Correct!" : "Try again.";
      } else if (currentQuestion.type === 'MULTIPLE_CHOICE' && 'correctAnswer' in currentQuestion) {
        isCorrect = answer === currentQuestion.correctAnswer;
        feedbackMsg = isCorrect ? "Correct!" : "Try again.";
      }
      
      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setFeedback({ 
          type: 'correct', 
          message: `${newStreak >= 5 ? 'Amazing Streak! ' : ''}${feedbackMsg}` 
        });
        setXp(prev => prev + 10);
        setTimeout(nextQuestion, 1500); 
      } else {
        setStreak(0);
        setFeedback({ type: 'wrong', message: feedbackMsg });
        setLives(prev => Math.max(prev - 1, 0));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsValidating(false);
    }
  }, [streak, nextQuestion, currentQuestion]);

  useEffect(() => {
    if (lives === 0) {
      onClose(); 
    }
  }, [lives, onClose]);

  return (
    <>
      <div className="max-w-md mx-auto p-6 space-y-6 relative min-h-screen pb-32">
        {showWarning ? (
          <div className="fixed inset-0 z-50 bg-rose-600 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-4xl font-black mb-2">HARD LEVEL</h1>
            <p className="text-xl font-bold opacity-90">Are you ready to challenge yourself?</p>
            <button onClick={() => setShowWarning(false)} className="mt-8 px-8 py-3 bg-white text-rose-600 font-bold rounded-full text-lg">Let's Go!</button>
          </div>
        ) : !showComplete ? (
          <>
            <div className="flex items-center gap-4">
              <ProgressBar progress={progress} />
              <HeartsDisplay lives={lives} />
            </div>

            <div className={`transition-opacity ${feedback ? 'opacity-50 pointer-events-none' : ''}`}>
              {currentQuestion && currentQuestion.type === 'WORD_BANK' && (
                <WordBank key={currentQuestion.id} question={currentQuestion} onAnswer={handleAnswer} />
              )}
              {currentQuestion && currentQuestion.type === 'MULTIPLE_CHOICE' && (
                <MultipleChoice question={currentQuestion} onAnswer={handleAnswer} />
              )}
              {currentQuestion && currentQuestion.type === 'MATCHING_PAIRS' && (
                <MatchingPairs question={currentQuestion} onAnswer={isCorrect => handleAnswer(isCorrect)} />
              )}
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div 
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  className={`fixed inset-x-0 bottom-0 p-6 z-50 shadow-lg text-center font-bold text-lg ${feedback.type === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                >
                  {feedback.message}
                  {feedback.type === 'wrong' && (
                    <button onClick={() => setFeedback(null)} className="block mt-4 w-full py-2 bg-white text-red-500 rounded-lg font-bold">Try again</button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : null}
      </div>
      {showComplete && (
        <LevelCompleteModal 
          xp={xp} 
          diamonds={questions.length === 10 ? 5 : (questions.length === 15 ? 10 : 10)} 
          onContinue={() => onComplete(xp)} 
          onPlayNext={() => onComplete(xp, true)} 
        />
      )}
    </>
  );
};
