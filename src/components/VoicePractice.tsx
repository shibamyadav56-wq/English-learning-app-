import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  X, 
  HelpCircle,
  TrendingUp,
  VolumeX,
  Keyboard
} from 'lucide-react';
import Notification from './Notification';

// Supported Speech Recognition Detection
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

interface Sentence {
  id: string;
  english: string;
  hindi: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const PRESET_SENTENCES: Sentence[] = [
  // Basics
  { id: 'b1', english: 'How are you doing today?', hindi: 'आप आज कैसे हैं?', category: 'Daily Greetings', difficulty: 'Easy' },
  { id: 'b2', english: 'Never give up on your dreams.', hindi: 'अपने सपनों को कभी मत छोड़ो।', category: 'Daily Greetings', difficulty: 'Easy' },
  { id: 'b3', english: 'Thank you so much for your support.', hindi: 'आपके सहयोग के लिए बहुत-बहुत धन्यवाद।', category: 'Daily Greetings', difficulty: 'Easy' },
  { id: 'b4', english: 'What time is the class going to start?', hindi: 'क्लास कितने बजे शुरू होने वाली है?', category: 'Daily Greetings', difficulty: 'Easy' },
  
  // Conversational
  { id: 'c1', english: 'Where is the nearest railway station?', hindi: 'सबसे पास वाला रेलवे स्टेशन कहाँ है?', category: 'Travel & Food', difficulty: 'Medium' },
  { id: 'c2', english: 'Could you please recommend a good local restaurant?', hindi: 'क्या आप किसी अच्छे स्थानीय रेस्टोरेंट की सिफारिश कर सकते हैं?', category: 'Travel & Food', difficulty: 'Medium' },
  { id: 'c3', english: 'I would like to order a warm cup of coffee.', hindi: 'मैं एक गर्म कप कॉफी ऑर्डर करना चाहूंगा।', category: 'Travel & Food', difficulty: 'Medium' },
  { id: 'c4', english: 'Excuse me, how much does this ticket cost?', hindi: 'माफ़ कीजिएगा, इस टिकट की कीमत कितनी है?', category: 'Travel & Food', difficulty: 'Medium' },

  // Professional
  { id: 'p1', english: 'I look forward to collaborating on this new project.', hindi: 'मैं इस नए प्रोजेक्ट पर सहयोग करने के लिए उत्सुक हूँ।', category: 'Professional', difficulty: 'Medium' },
  { id: 'p2', english: 'Could we schedule a quick status call for tomorrow morning?', hindi: 'क्या हम कल सुबह के लिए एक त्वरित स्टेटस कॉल निर्धारित कर सकते हैं?', category: 'Professional', difficulty: 'Hard' },
  { id: 'p3', english: 'Please find the attached presentation deck for your review.', hindi: 'कृपया समीक्षा के लिए संलग्न प्रेजेंटेशन डेक देखें।', category: 'Professional', difficulty: 'Medium' },
  { id: 'p4', english: 'Let us coordinate with the team to finalize the timeline.', hindi: 'समय सीमा तय करने के लिए आइए टीम के साथ समन्वय करें।', category: 'Professional', difficulty: 'Hard' },

  // Tongue Twisters
  { id: 't1', english: 'She sells seashells by the seashore.', hindi: 'वह समुद्र तट पर शंख बेचती है।', category: 'Tongue Twisters', difficulty: 'Medium' },
  { id: 't2', english: 'Peter Piper picked a peck of pickled peppers.', hindi: 'पीटर पाइपर ने मसालेदार शिमला मिर्च का एक टुकड़ा उठाया।', category: 'Tongue Twisters', difficulty: 'Hard' },
  { id: 't3', english: 'I scream, you scream, we all scream for ice cream.', hindi: 'मैं चिल्लाता हूँ, आप चिल्लाते हैं, हम सब आइसक्रीम के लिए चिल्लाते हैं।', category: 'Tongue Twisters', difficulty: 'Easy' },
  { id: 't4', english: 'Red lory, yellow lory, red lory, yellow lory.', hindi: 'लाल तोता, पीला तोता, लाल तोता, पीला तोता।', category: 'Tongue Twisters', difficulty: 'Hard' }
];

const CATEGORIES = ['Daily Greetings', 'Travel & Food', 'Professional', 'Tongue Twisters'];

interface VoicePracticeProps {
  setDiamonds: (d: number | ((prev: number) => number)) => void;
  onBack?: () => void;
}

export default function VoicePractice({ setDiamonds, onBack }: VoicePracticeProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));
  const [activeCategory, setActiveCategory] = useState<string>('Daily Greetings');
  const [selectedSentence, setSelectedSentence] = useState<Sentence | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);

  // Completed items tracking for rewards
  const [completedList, setCompletedList] = useState<string[]>(() => {
    const list = localStorage.getItem('completedSpeechSentences');
    return list ? JSON.parse(list) : [];
  });

  // AI Evaluation Feedback state
  const [aiResult, setAiResult] = useState<{
    accuracyScore: number;
    mispronouncedWords: string[];
    tips: string;
    feedbackHindi: string;
  } | null>(null);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    title?: string;
  }>({ isOpen: false, message: '', type: 'info' });

  const recognitionRef = useRef<any>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('completedSpeechSentences', JSON.stringify(completedList));
  }, [completedList]);

  // Read aloud helper via browser SpeechSynthesis
  const speakTarget = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setNotification({
        isOpen: true,
        message: 'Browser text-to-speech is not supported on this device.',
        type: 'error',
        title: 'TTS Not Supported'
      });
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for better comprehension
    window.speechSynthesis.speak(utterance);
  };

  // Start Voice input capturing
  const startRecording = () => {
    if (!isSpeechSupported) {
      setTextMode(true);
      setNotification({
        isOpen: true,
        message: 'Speech recognition is not available in this frame/browser. Switch to type mode to simulate speaking!',
        type: 'info',
        title: 'Keyboard Fallback Enabled'
      });
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop playing while recording
      setSpokenText('');
      setAiResult(null);
      setIsRecording(true);

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setNotification({
            isOpen: true,
            message: 'Microphone permission denied. Select "Type Mode" to speak via keyboard if you are inside a sandbox.',
            type: 'error',
            title: 'Mic Blocked'
          });
        } else {
          setNotification({
            isOpen: true,
            message: `Caputering failed: ${event.error}. Please type or try again.`,
            type: 'error',
            title: 'Recording Error'
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Stop capture
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Trigger Gemini processing
  const fetchScores = async () => {
    if (!selectedSentence || !spokenText.trim()) {
      setNotification({
        isOpen: true,
        message: 'Please speak first or type in the text box!',
        type: 'error',
        title: 'No input text'
      });
      return;
    }

    setIsEvaluating(true);
    setAiResult(null);

    try {
      const response = await fetch('/api/evaluate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: selectedSentence.english,
          spokenText: spokenText
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      setAiResult(result);

      // Reward tracking: Only award once per unique sentence if score is >= 80%
      if (result.accuracyScore >= 80 && !completedList.includes(selectedSentence.id)) {
        setCompletedList(prev => [...prev, selectedSentence.id]);
        setDiamonds(prev => prev + 10); // Reward 10 diamonds!
        
        // Success celebration
        setNotification({
          isOpen: true,
          message: `Well done! Perfect pronunciation! You earned 10 diamonds. (Accuracy: ${result.accuracyScore}%)`,
          type: 'success',
          title: 'Amazing Score! 💎'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        isOpen: true,
        message: 'There was a technical issue in generating the AI score. Please try again!',
        type: 'error',
        title: 'Evaluation Failed'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Hard': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Top Header */}
      <div className="pt-6 px-6 mb-2 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10 py-4 -mx-6 px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack} 
            className="p-2 transition active:scale-95 text-slate-600 hover:bg-slate-100 rounded-xl"
            id="back_to_home_btn"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              Voice Practice <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black animate-pulse">BETA</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pronunciation Coach</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHelperModal(true)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <HelpCircle size={18} />
          </button>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-black text-xs border border-blue-100">
            <span>🏆 Score list</span>
            <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-[9px] leading-none mb-0.5 ml-0.5">
              {completedList.length}
            </span>
          </div>
        </div>
      </div>

      {!selectedSentence ? (
        <div className="p-6 space-y-6">
          {/* Welcome Dashboard */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-2">
              <span className="text-[9px] bg-white/20 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">AI Powered</span>
              <h2 className="text-2xl font-black leading-tight tracking-tight">Speak Like a Native!</h2>
              <p className="text-sm text-slate-200/90 font-medium">Practice speaking, learn standard accents, and get immediate AI feedback! 🎙️</p>
              <div className="pt-2 flex items-center gap-6 text-xs text-indigo-200 font-bold">
                <span className="flex items-center gap-1"><Sparkles size={14} /> Get +10💎 on score &ge; 80%</span>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-3 rounded-2xl font-black whitespace-nowrap text-xs transition duration-300 active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white text-slate-500 border border-slate-100 font-bold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sentences List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Select a phrase to speak:</h3>
            {PRESET_SENTENCES.filter(s => s.category === activeCategory).map((sentence) => {
              const isCompleted = completedList.includes(sentence.id);
              return (
                <button
                  key={sentence.id}
                  onClick={() => {
                    setSelectedSentence(sentence);
                    setSpokenText('');
                    setAiResult(null);
                    setTextMode(false);
                  }}
                  className="w-full text-left bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm active:scale-98 transition duration-300 hover:shadow-md flex items-center justify-between"
                >
                  <div className="space-y-2 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${getDifficultyColor(sentence.difficulty)}`}>
                        {sentence.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <CheckCircle2 size={10} strokeWidth={3} /> Clear (+10💎)
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 text-base leading-snug">{sentence.english}</p>
                    <p className="text-xs text-slate-400 font-medium">{sentence.hindi}</p>
                  </div>
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                    <Mic size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Active sentence card */}
          <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm space-y-5 relative">
            <button 
              onClick={() => setSelectedSentence(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X size={18} />
            </button>
            
            <div className="space-y-1">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${getDifficultyColor(selectedSentence.difficulty)}`}>
                {selectedSentence.difficulty}
              </span>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TARGET SENTENCE</p>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {selectedSentence.english}
              </p>
              <p className="text-sm font-bold text-blue-600 italic">
                meaning: "{selectedSentence.hindi}"
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => speakTarget(selectedSentence.english)}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-full text-xs font-black transition active:scale-95"
              >
                <Volume2 size={16} strokeWidth={2.5} /> Listen correct accent
              </button>
              <button
                onClick={() => setTextMode(!textMode)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black transition active:scale-95 ${
                  textMode 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Keyboard size={16} /> {textMode ? "Switch to Recording" : "Simulator mode"}
              </button>
            </div>
          </div>

          {/* Pronunciation evaluation active section */}
          <div className="bg-white p-6 rounded-[36px] border border-slate-150 shadow-sm space-y-6 text-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {textMode ? "SIMULATION MODE: TYPE THE SENTENCE" : "SPEECH PRACTICE"}
            </h3>

            {textMode ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-bold leading-normal text-left">
                  Mic blocked inside sandboxed iframe? No worries. Type below what you want the AI tutor to hear to test the pronunciation evaluation!
                </p>
                <textarea
                  ref={textInputRef}
                  value={spokenText}
                  onChange={(e) => setSpokenText(e.target.value)}
                  placeholder="Type what you want to evaluate here (e.g., 'she sells seashells' or make a typo to verify correction comments)..."
                  className="w-full border border-slate-200 p-4 rounded-2xl font-bold text-slate-700 text-sm focus:outline-none focus:border-blue-500 h-24 resize-none bg-slate-50"
                />
              </div>
            ) : (
              <div className="space-y-6 flex flex-col items-center py-4">
                {/* Visual equalizer waves container */}
                <div className="relative flex items-center justify-center">
                  <AnimatePresence>
                    {isRecording && (
                      <>
                        <motion.div 
                          className="absolute w-24 h-24 bg-red-500/20 rounded-full"
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        />
                        <motion.div 
                          className="absolute w-28 h-28 bg-red-400/10 rounded-full"
                          initial={{ scale: 0.8, opacity: 0.4 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.4 }}
                        />
                      </>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative z-10 w-20 h-20 flex items-center justify-center rounded-fill rounded-full shadow-lg transition duration-500 active:scale-95 ${
                      isRecording 
                        ? 'bg-red-500 text-white shadow-red-500/30' 
                        : 'bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="font-black text-sm tracking-wide">
                    {isRecording ? "Listening... (Talk Now!)" : "Tap button to start speaking!"}
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    Make sure the microphone is close
                  </p>
                </div>

                {/* Captured text view */}
                {spokenText && (
                  <div className="w-full bg-slate-50 p-4 rounded-3xl border border-slate-100 min-h-[60px] text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">YOU SPOKE:</p>
                    <p className="font-bold text-slate-700 leading-normal">"{spokenText}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Evaluation Action */}
            <div className="flex gap-3">
              {spokenText && (
                <button
                  onClick={() => {
                    setSpokenText('');
                    setAiResult(null);
                  }}
                  className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition active:scale-95"
                  title="Clear input"
                >
                  <RotateCcw size={18} />
                </button>
              )}
              
              <button
                disabled={isEvaluating || !spokenText.trim()}
                onClick={fetchScores}
                className="flex-grow bg-slate-900 disabled:bg-slate-200 text-white py-4 px-6 rounded-2xl font-black text-sm hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing your pronunciation...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Get AI Feedback
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Result Cards */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/* Diagnostic Score Card */}
                <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-lg space-y-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">PRONUNCIATION ACCURACY</p>
                    
                    {/* Radial Score Gauge */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Track ring */}
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          className="text-slate-100"
                          strokeWidth="12"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        {/* Fill ring */}
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          className={`${
                            aiResult.accuracyScore >= 80 
                              ? 'text-emerald-500' 
                              : aiResult.accuracyScore >= 50 
                                ? 'text-amber-500' 
                                : 'text-rose-500'
                          } transition-all duration-1000`}
                          strokeWidth="12"
                          strokeDasharray={2 * Math.PI * 62}
                          strokeDashoffset={2 * Math.PI * 62 * (1 - aiResult.accuracyScore / 100)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      {/* Inside text */}
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-slate-800 leading-none">
                          {aiResult.accuracyScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          {aiResult.accuracyScore >= 90 
                            ? 'Excellent' 
                            : aiResult.accuracyScore >= 80 
                              ? 'Very Good' 
                              : aiResult.accuracyScore >= 50 
                                ? 'Good Effort' 
                                : 'Needs Practice'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Words analysis breakdown */}
                  <div className="border-t border-slate-100 pt-5 space-y-2.5 text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Word-By-Word Breakdown</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSentence.english.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(' ').map((word, wordIndex) => {
                        const wordClean = word.toLowerCase();
                        const isMispronounced = aiResult.mispronouncedWords.some(
                          m => m.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"") === wordClean
                        );
                        
                        return (
                          <span
                            key={wordIndex}
                            className={`p-1.5 px-3 rounded-xl text-xs font-bold ${
                              isMispronounced
                                ? 'bg-rose-50 text-rose-600 border border-rose-100 line-through'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI Tutor Bubble details */}
                <div className="bg-blue-600 text-white p-6 rounded-[36px] shadow-lg space-y-4 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12" />
                  
                  <div className="flex items-center gap-2.5 relative z-10">
                    <span className="text-2xl">👩‍🏫</span>
                    <div>
                      <h4 className="font-black text-sm tracking-tight">AI Language Coach says:</h4>
                      <p className="text-[9px] text-blue-200 uppercase font-bold tracking-wider">Tutor Feedback</p>
                    </div>
                  </div>

                  <p className="text-base font-bold leading-relaxed relative z-10">
                    "{aiResult.feedbackHindi}"
                  </p>

                  {aiResult.tips && (
                    <div className="bg-white/10 p-4 rounded-2xl relative z-10 space-y-1 border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={12} /> Pronunciation tips for practice:
                      </p>
                      <p className="text-xs text-blue-50/90 leading-relaxed font-semibold">
                        {aiResult.tips}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Helper Modal */}
      {showHelperModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
              <span>🎙️ Voice Practice Guide</span>
            </h3>
            <div className="text-sm text-slate-600 space-y-3 font-semibold leading-relaxed">
              <p>
                1. 📖 Choose any sentence of your choice from your favorite category.
              </p>
              <p>
                2. 🔊 Click the <strong>"Listen correct accent"</strong> button to hear the standard US English accent.
              </p>
              <p>
                3. 🎙️ Click the mic button and speak the sentence clearly, then tap <strong>"Get AI Feedback"</strong> once finalized.
              </p>
              <p>
                4. 💎 If your score is <strong>80%</strong> or higher, you will earn <strong>10 Diamonds</strong> for newly completed items!
              </p>
              <p>
                5. ⌨️ If the browser's mic is not supported due to sandbox constraints, switch on the <strong>Simulator Keyboard Mode</strong> to type the spoken text!
              </p>
            </div>
            <button
              onClick={() => setShowHelperModal(false)}
              className="w-full py-3 bg-slate-905 bg-slate-950 text-white rounded-xl font-black text-xs hover:bg-slate-800"
            >
              Okay, I Got It!
            </button>
          </div>
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
