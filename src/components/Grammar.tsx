import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Trophy, CheckCircle2, XCircle } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center text-center p-8 bg-white min-h-[calc(100vh-80px)]">
          <div className={`p-8 rounded-[40px] mb-8 ${isPerfect ? 'bg-amber-50 text-amber-500 shadow-xl shadow-amber-500/10' : 'bg-slate-50 text-slate-400'}`}>
            <Trophy size={100} strokeWidth={2.5} className={isPerfect ? 'animate-bounce' : ''} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Quiz Completed!</h2>
          <p className="text-xl font-bold text-slate-400 mb-10">Your Score: <span className="text-primary">{score}</span> / {selectedTopic.quiz.length}</p>
          
          {isPerfect ? (
            earnedNow ? (
              <div className="bg-emerald-500 text-white p-8 rounded-[40px] mb-10 shadow-xl shadow-emerald-500/30 w-full max-w-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <p className="text-2xl font-black flex items-center justify-center gap-3">
                  <span className="text-3xl">💎</span> +10 Diamonds
                </p>
                <p className="text-emerald-100 font-bold mt-2 text-sm">Excellent job! Topic mastered.</p>
              </div>
            ) : (
              <div className="bg-blue-500 text-white p-8 rounded-[40px] mb-10 shadow-xl shadow-blue-500/30 w-full max-w-sm">
                <p className="text-2xl font-black flex items-center justify-center gap-3">
                  <CheckCircle2 size={32} strokeWidth={3} /> Perfect!
                </p>
                <p className="text-blue-100 font-bold mt-2 text-sm opacity-80">Already claimed reward.</p>
              </div>
            )
          ) : (
            <div className="bg-orange-500 text-white p-8 rounded-[40px] mb-10 shadow-xl shadow-orange-500/30 w-full max-w-sm">
              <p className="text-xl font-black">Keep going!</p>
              <p className="text-orange-100 font-bold mt-2 text-sm opacity-80">Get all correct for 10 diamonds.</p>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button onClick={startQuiz} className="bg-slate-900 text-white p-5 rounded-[24px] font-black text-lg shadow-xl shadow-slate-900/20 bounce-click">Try Again</button>
            <button onClick={backToList} className="bg-slate-100 text-slate-600 p-5 rounded-[24px] font-black text-lg bounce-click">Back to Topics</button>
          </div>
        </div>
      );
    }

    if (quizMode) {
      const question = selectedTopic.quiz[currentQuestionIndex];
      return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
          <header className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setQuizMode(false)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 bounce-click">
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</span>
               <div className="flex gap-1 mt-1">
                 {selectedTopic.quiz.map((_: any, idx: number) => (
                   <div key={idx} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${idx <= currentQuestionIndex ? 'bg-primary' : 'bg-slate-200'}`} />
                 ))}
               </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center font-black">
              {currentQuestionIndex + 1}
            </div>
          </header>
          
          <div className="flex-grow flex flex-col justify-center px-8 text-center mt-[-40px]">
            <span className="text-primary font-black text-xs uppercase tracking-widest mb-4">Select Output</span>
            <p className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-12">{question.question}</p>
            
            <div className="space-y-4">
              {question.options.map((option: string, index: number) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === question.answer;
                
                let buttonStyle = "w-full p-6 rounded-[32px] text-left font-bold text-lg transition-all border-b-8 active:border-b-0 active:translate-y-1 ";
                
                if (selectedOption === null) {
                  buttonStyle += "bg-white border-slate-200 text-slate-700 hover:border-blue-400 shadow-sm";
                } else if (isCorrect) {
                  buttonStyle += "bg-emerald-500 border-emerald-700 text-white shadow-xl shadow-emerald-500/20";
                } else if (isSelected) {
                  buttonStyle += "bg-rose-500 border-rose-700 text-white shadow-xl shadow-rose-500/20";
                } else {
                  buttonStyle += "bg-white border-slate-100 text-slate-300 opacity-40 shadow-none";
                }

                return (
                  <button 
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={selectedOption !== null}
                    className={buttonStyle}
                  >
                    <div className="flex justify-between items-center px-2">
                      <span>{option}</span>
                      {selectedOption !== null && isCorrect && <CheckCircle2 size={24} strokeWidth={3} />}
                      {isSelected && !isCorrect && <XCircle size={24} strokeWidth={3} />}
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
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <header className="p-6 flex items-center gap-4 sticky top-0 bg-warm-bg/90 backdrop-blur-md z-10">
          <button onClick={backToList} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 bounce-click">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">{selectedTopic.title}</h1>
        </header>
        
        <div className="flex-grow overflow-y-auto px-6 space-y-8 pb-10">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
                <BookOpen size={36} strokeWidth={2.5} />
             </div>
             <p className="text-slate-500 font-bold leading-relaxed text-lg italic">{selectedTopic.description}</p>
          </div>
          
          <div className="space-y-6">
            {selectedTopic.notes.map((note: any, index: number) => (
              <div key={index} className="bg-blue-50/50 p-8 rounded-[40px] border border-blue-100 group">
                <h3 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  {note.heading}
                </h3>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed text-[17px] font-medium">{note.text}</p>
              </div>
            ))}
          </div>
          
          <div className="p-10 bg-slate-900 rounded-[48px] text-white text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <Trophy size={60} className="mx-auto mb-6 text-yellow-400 group-hover:rotate-12 transition-transform" />
            <h3 className="text-3xl font-black mb-2 tracking-tight">Challenge Time!</h3>
            <p className="mb-10 text-slate-400 font-bold">Earn 10 Diamonds by completing the quiz</p>
            <button 
              onClick={startQuiz} 
              className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-slate-100 transition bounce-click"
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
    <div className="bg-blue-50/30 min-h-screen pb-40">
      <div className="pt-8 px-6 mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Grammar</h1>
        <p className="text-blue-600 font-bold mt-2 opacity-80 uppercase tracking-widest text-[10px]">Master English Rules</p>
      </div>
      
      <div className="px-6 space-y-4">
        {GRAMMAR_TOPICS.map(topic => {
          const isCompleted = completedTopics.includes(topic.id);
          return (
            <button 
              key={topic.id} 
              onClick={() => handleTopicSelect(topic)}
              className={`w-full bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between text-left bounce-click group ${
                isCompleted ? 'bg-green-50/30' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <BookOpen size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{topic.title}</h2>
                  <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1">{topic.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {isCompleted ? (
                   <CheckCircle2 size={24} className="text-green-500" />
                ) : (
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 p-1 px-2 rounded-xl text-[10px] font-black">
                    <span className="text-xs">💎</span> 10
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
