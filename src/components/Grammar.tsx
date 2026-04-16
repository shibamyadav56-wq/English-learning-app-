import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Trophy, Gem, CheckCircle2, XCircle } from 'lucide-react';
import { GRAMMAR_TOPICS } from '../constants/grammar';

export default function Grammar({ diamonds, setDiamonds }: { diamonds: number, setDiamonds: (d: number | ((prev: number) => number)) => void }) {
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [earnedNow, setEarnedNow] = useState(false);

  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedGrammarTopics');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('completedGrammarTopics', JSON.stringify(completedTopics));
  }, [completedTopics]);

  const handleTopicSelect = (topic: any) => {
    setSelectedTopic(topic);
    setQuizMode(false);
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const startQuiz = () => {
    setQuizMode(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setFeedback(null);
    setEarnedNow(false);
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null) return; // Prevent multiple clicks

    setSelectedOption(option);
    const isCorrect = option === selectedTopic.quiz[currentQuestionIndex].answer;
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < selectedTopic.quiz.length) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        setShowResult(true);
        // Award diamonds if score is perfect and not already completed
        if (score + (isCorrect ? 1 : 0) === selectedTopic.quiz.length) {
          if (!completedTopics.includes(selectedTopic.id)) {
            setDiamonds(prev => prev + 10);
            setCompletedTopics(prev => [...prev, selectedTopic.id]);
            setEarnedNow(true);
          }
        }
      }
    }, 1500);
  };

  const backToList = () => {
    setSelectedTopic(null);
    setQuizMode(false);
  };

  if (selectedTopic) {
    if (showResult) {
      const isPerfect = score === selectedTopic.quiz.length;
      return (
        <div className="p-4 bg-warm-bg min-h-screen flex flex-col items-center justify-center text-center pb-24">
          <Trophy size={80} className={`mb-6 ${isPerfect ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-6">Your Score: {score} / {selectedTopic.quiz.length}</p>
          
          {isPerfect ? (
            earnedNow ? (
              <div className="bg-green-100 border border-green-300 p-6 rounded-2xl mb-8 animate-bounce">
                <p className="text-green-800 font-bold text-xl flex items-center justify-center gap-2">
                  <Gem size={28} className="text-green-600" /> +10 Diamonds Earned!
                </p>
                <p className="text-green-700 mt-2">Excellent job! You mastered this topic.</p>
              </div>
            ) : (
              <div className="bg-blue-100 border border-blue-300 p-6 rounded-2xl mb-8">
                <p className="text-blue-800 font-bold text-xl flex items-center justify-center gap-2">
                  <CheckCircle2 size={28} className="text-blue-600" /> Perfect Score!
                </p>
                <p className="text-blue-700 mt-2">You have already claimed diamonds for this topic.</p>
              </div>
            )
          ) : (
            <div className="bg-orange-100 border border-orange-300 p-6 rounded-2xl mb-8">
              <p className="text-orange-800 font-bold text-lg">Good try!</p>
              <p className="text-orange-700 mt-2">Get all questions right to earn 10 diamonds. Review the notes and try again!</p>
            </div>
          )}

          <div className="flex gap-4 w-full max-w-md">
            <button onClick={startQuiz} className="flex-1 bg-blue-100 text-blue-700 p-4 rounded-2xl font-bold hover:bg-blue-200 transition">Try Again</button>
            <button onClick={backToList} className="flex-1 bg-primary text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition">Back to Topics</button>
          </div>
        </div>
      );
    }

    if (quizMode) {
      const question = selectedTopic.quiz[currentQuestionIndex];
      return (
        <div className="p-4 bg-warm-bg min-h-screen pb-24">
          <button onClick={() => setQuizMode(false)} className="flex items-center gap-2 text-gray-600 mb-6 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={20} /> Back to Notes
          </button>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-blue-900">Question {currentQuestionIndex + 1} of {selectedTopic.quiz.length}</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">Score: {score}</span>
            </div>
            
            <p className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">{question.question}</p>
            
            <div className="space-y-4">
              {question.options.map((option: string, index: number) => {
                let buttonClass = "w-full p-4 text-left rounded-2xl font-medium text-lg transition-all border-2 ";
                
                if (selectedOption === null) {
                  buttonClass += "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50";
                } else if (option === question.answer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-800";
                } else if (option === selectedOption) {
                  buttonClass += "border-red-500 bg-red-50 text-red-800";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 opacity-50";
                }

                return (
                  <button 
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={selectedOption !== null}
                    className={buttonClass}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option}</span>
                      {selectedOption !== null && option === question.answer && <CheckCircle2 className="text-green-500" />}
                      {selectedOption === option && option !== question.answer && <XCircle className="text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Notes View
    return (
      <div className="p-4 bg-warm-bg min-h-screen pb-24">
        <button onClick={backToList} className="flex items-center gap-2 text-gray-600 mb-6 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
          <ArrowLeft size={20} /> Back to Topics
        </button>
        
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <BookOpen size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedTopic.title}</h1>
          </div>
          <p className="text-gray-500 mb-8 text-lg ml-16">{selectedTopic.description}</p>
          
          <div className="space-y-8 mb-12">
            {selectedTopic.notes.map((note: any, index: number) => (
              <div key={index} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-200 pb-2">{note.heading}</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{note.text}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-8 rounded-3xl text-white text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Ready to test your knowledge?</h3>
            <p className="mb-6 text-blue-100">Get all questions right to earn 10 diamonds!</p>
            <button 
              onClick={startQuiz} 
              className="bg-white text-primary px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition shadow-md w-full md:w-auto"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="p-4 md:p-8 bg-warm-bg min-h-screen pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Grammar Lessons</h1>
          <p className="text-lg text-gray-600">Learn English grammar step by step with Hindi explanations.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GRAMMAR_TOPICS.map(topic => {
            const isCompleted = completedTopics.includes(topic.id);
            return (
              <div 
                key={topic.id} 
                onClick={() => handleTopicSelect(topic)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition cursor-pointer group relative"
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 text-green-500">
                    <CheckCircle2 size={28} className="fill-green-100 rounded-full" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-50 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{topic.title}</h2>
                    <p className="text-gray-600">{topic.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-primary">
                      <span>Read Notes & Take Quiz</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-accent flex items-center gap-1"><Gem size={14} /> 10</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
