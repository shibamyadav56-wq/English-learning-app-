import { useState, useEffect } from 'react';
import { Crown, Lock, Trophy, ArrowLeft, Star, Flame } from 'lucide-react';
import { InteractiveQuestionController } from './exercises/InteractiveQuestionController';
import { useNavigate } from 'react-router-dom';
import { LEVEL_CONFIG } from '../constants/levelConfig';
import { loadLevel } from '../constants/newExercises';
import Notification from './Notification';
import CelebrationPage from './CelebrationPage';
import { useNavigation } from '../context/NavigationContext';

interface LearningPathProps {
  diamonds: number;
  setDiamonds: (d: number | ((prev: number) => number)) => void;
}

const getLevelTopic = (level: number) => {
  const topicsList = [
    { name: "Self Introductions", icon: "👋", desc: "Learn how to introduce yourself, state your name, age, and hobbies." },
    { name: "Daily Habits", icon: "⏰", desc: "Learn to describe your daily schedule, routine activities, and personal habits." },
    { name: "At the Cafe", icon: "☕", desc: "Order coffee, burgers, and settle the bill confidently in smart English." },
    { name: "Family & Relations", icon: "👨‍👩‍👧‍👦", desc: "Describe your family members and relations beautifully in English." },
    { name: "Weather Guide", icon: "🌦️", desc: "Learn to describe rain, cold weather, hot climates, and sunshine." },
    { name: "In the School", icon: "🏫", desc: "Learn definitions and guidelines for classroom objects, books, and assignments." },
    { name: "Pets & Wildlife", icon: "🐾", desc: "Name animals, explain their behaviors, and describe animal actions." },
    { name: "Health & Body Parts", icon: "💪", desc: "Identify body parts and describe physical conditions or health symptoms." },
    { name: "House Elements", icon: "🏠", desc: "Master vocabulary for the kitchen, bedroom, living space, and household elements." },
    { name: "Colors & Outfits", icon: "👗", desc: "Describe dresses, match colors, and write reviews about different outfits." },
    { name: "Everyday Action Verbs", icon: "📖", desc: "Master verbs and action vocabulary used in 50% of daily conversations." },
    { name: "Telling Time & Dates", icon: "⏳", desc: "Punctuality matters! Explain hours, calendars, schedules, and dates." },
    { name: "City & Landmarks", icon: "🏙️", desc: "Learn how to give road directions and discover landmarks like banks or hospitals." },
    { name: "Online Shopping", icon: "🛍️", desc: "Practice pricing vocabulary, sizing checks, and product checklists." },
    { name: "Nature & Hiking", icon: "🌳", desc: "Describe mountains, rivers, parks, and trails with rich adjectives." },
    { name: "Present Continuous", icon: "🔄", desc: "Use verbs ending with -ing to describe and report ongoing actions beautifully." },
    { name: "Past Memories", icon: "📜", desc: "Talk about childhood memories, master past tense verbs, and use was/were." },
    { name: "Future Ambitions", icon: "🚀", desc: "State future goals using 'will' to declare professional dreams and plans." },
    { name: "Emotional Care", icon: "💖", desc: "Express support, empathy, and celebrate happiness with polite statements." },
    { name: "Workplace English", icon: "💼", desc: "Learn emails, workplace communication, salary negotiations, and professional terms." },
    { name: "Travel & Hotels", icon: "🏨", desc: "Book rooms, coordinate with reception, and navigate airport checking protocols." },
    { name: "Fitness & Food", icon: "🍏", desc: "Healthy diets, exercise plans, and doctor's prescription translations." },
    { name: "Local Festivals", icon: "🎉", desc: "Festivals, lights, family celebrations, and cultural wishes." },
    { name: "Airport Protocols", icon: "✈️", desc: "Airport layouts, check-in baggage claims, and gate announcements." },
    { name: "Describing Nature", icon: "✨", desc: "Adjectives to describe beauty, colors, heights, and dynamic landscapes." }
  ];

  const item = topicsList[(level - 1) % topicsList.length];
  const cycle = Math.ceil(level / topicsList.length);
  let title = item.name;
  let desc = item.desc;
  
  if (cycle > 1) {
    if (cycle === 2) {
      title = `${item.name} II`;
      desc = `Learn ${item.name.toLowerCase()} in greater depth and explore general conversation models.`;
    } else if (cycle === 3) {
      title = `${item.name} Pro`;
      desc = `Advanced guidelines and complex phrases about ${item.name.toLowerCase()} for daily speaking fluency.`;
    } else {
      title = `${item.name} Master`;
      desc = `Ultimate challenge levels verify covering high frequency words in ${item.name.toLowerCase()}.`;
    }
  }
  return { name: title, icon: item.icon, desc };
};

const getTopicCardStyle = (index: number) => {
  const styles = [
    { bg: "from-orange-50 to-amber-100", border: "border-orange-200", text: "text-orange-600" }, // 1. 👋 Self Introductions
    { bg: "from-blue-50 to-sky-100", border: "border-sky-200", text: "text-sky-600" }, // 2. ⏰ Daily Habits
    { bg: "from-amber-50 to-orange-100/30", border: "border-amber-200", text: "text-amber-800" }, // 3. ☕ At the Cafe
    { bg: "from-rose-50 to-pink-100", border: "border-pink-200", text: "text-pink-600" }, // 4. 👨‍👩‍👧‍👦 Family & Relations
    { bg: "from-cyan-50 to-blue-100", border: "border-blue-200", text: "text-blue-600" }, // 5. 🌦️ Weather Guide
    { bg: "from-yellow-50 to-red-100/40", border: "border-red-200", text: "text-red-600" }, // 6. 🏫 In the School
    { bg: "from-emerald-50 to-green-100", border: "border-green-200", text: "text-green-600" }, // 7. 🐾 Pets & Wildlife
    { bg: "from-red-50 to-rose-100", border: "border-rose-200", text: "text-rose-600" }, // 8. 💪 Health & Body
    { bg: "from-sky-50 to-indigo-100", border: "border-indigo-200", text: "text-indigo-600" }, // 9. 🏠 House Elements
    { bg: "from-purple-50 to-fuchsia-100", border: "border-fuchsia-200", text: "text-fuchsia-600" }, // 10. 👗 Colors & Outfits
    { bg: "from-amber-50 to-yellow-105", border: "border-yellow-250", text: "text-yellow-700" }, // 11. 📖 Everyday Action Verbs
    { bg: "from-teal-50 to-emerald-100/40", border: "border-emerald-250", text: "text-emerald-700" }, // 12. ⏳ Telling Time & Dates
    { bg: "from-slate-50 to-slate-200/60", border: "border-slate-350", text: "text-slate-700" }, // 13. 🏙️ City & Landmarks
    { bg: "from-pink-50 to-rose-100/50", border: "border-rose-250", text: "text-rose-700" }, // 14. 🛍️ Online Shopping
    { bg: "from-green-50 to-emerald-100", border: "border-emerald-200", text: "text-emerald-600" }, // 15. 🌳 Nature & Hiking
    { bg: "from-violet-50 to-purple-100", border: "border-purple-250", text: "text-purple-700" }, // 16. 🔄 Present Continuous
    { bg: "from-orange-50 to-amber-100", border: "border-amber-250", text: "text-amber-700" }, // 17. 📜 Past Memories
    { bg: "from-indigo-50 to-blue-100", border: "border-blue-250", text: "text-blue-700" }, // 18. 🚀 Future Ambitions
    { bg: "from-pink-50 to-red-100", border: "border-red-200", text: "text-red-500" }, // 19. 💖 Emotional Care
    { bg: "from-blue-50 to-sky-100", border: "border-sky-300", text: "text-sky-700" }, // 20. 💼 Workplace English
    { bg: "from-emerald-50 to-teal-100", border: "border-teal-300", text: "text-teal-700" }, // 21. 🏨 Travel & Hotels
    { bg: "from-green-50 to-lime-100", border: "border-lime-300", text: "text-lime-700" }, // 22. 🍏 Fitness & Food
    { bg: "from-red-50 to-amber-100", border: "border-amber-300", text: "text-amber-700" }, // 23. 🎉 Local Festivals
    { bg: "from-sky-50 to-indigo-100", border: "border-indigo-300", text: "text-indigo-700" }, // 24. ✈️ Airport Protocols
    { bg: "from-teal-50 to-green-100", border: "border-green-300", text: "text-green-700" }, // 25. ✨ Describing Nature
  ];
  return styles[index % styles.length];
};

export default function LearningPath({ diamonds, setDiamonds }: LearningPathProps) {
  const [showExercise, setShowExercise] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ xp: number; diamonds: number }>({ xp: 0, diamonds: 0 });
  const [exerciseToLoad, setExerciseToLoad] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const { setIsNavVisible } = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsNavVisible(!showExercise);
    (window as any).onRewardedAdCompleted = () => {
        setDiamonds(prev => prev + 2);
        setNotification({
            isOpen: true,
            message: 'You earned 2 diamonds! 💎',
            type: 'success',
            title: 'Reward Received!'
        });
    };
  }, [showExercise, setIsNavVisible, setDiamonds]);

  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const [completedExercises, setCompletedExercises] = useState<number[]>(() => {
    const saved = localStorage.getItem('completedExercises');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  const userStreak = parseInt(localStorage.getItem('userStreak') || localStorage.getItem('currentDay') || '5', 10);

  const getLevelRank = (completedCount: number) => {
    if (completedCount <= 2) return "Fresh Learner 🎖️";
    if (completedCount <= 5) return "Quick Starter ⚡";
    if (completedCount <= 10) return "Rising Star ✨";
    if (completedCount <= 15) return "Word Wizard 🧙";
    if (completedCount <= 25) return "English Scholar 🎓";
    if (completedCount <= 40) return "Elite Speaker 💎";
    if (completedCount <= 60) return "Grand Master 👑";
    if (completedCount <= 80) return "English Sovereign 🌟";
    if (completedCount <= 99) return "Ultra Pro Max 🏆";
    return "Language Deity 🌌";
  };

  const handleExercise = (level: number) => {
    const exerciseNumber = level;
    const safeExerciseNumber = LEVEL_CONFIG[exerciseNumber] ? exerciseNumber : 1;
    
    const difficulty = LEVEL_CONFIG[safeExerciseNumber].difficulty;
    setExerciseToLoad(safeExerciseNumber);
    setCurrentDifficulty(difficulty as 'easy' | 'medium' | 'hard');
    setShowExercise(true);

    // Load Interstitial Ad when level starts
    if (typeof (window as any).Android !== 'undefined' && (window as any).Android.loadInterstitialAd) {
      (window as any).Android.loadInterstitialAd();
    }
  };

  const handleExerciseComplete = (xp: number, playNext?: boolean) => {
    setShowExercise(false);
    
    // Check if the level has already been completed
    const isAlreadyCompleted = completedExercises.includes(exerciseToLoad);
    
    // Determine the reward dynamically based on the number of questions in active level configuration
    const questions = loadLevel(exerciseToLoad);
    const reward = questions.length === 10 ? 5 : 10;
    
    let messageText = '';
    if (!isAlreadyCompleted) {
      setDiamonds(prev => prev + reward);
      setCompletedExercises(prev => {
        const nextCompleted = [...prev, exerciseToLoad];
        // Note: we don't immediately start the next level until after the ad / state updates
        return nextCompleted;
      });
      messageText = `Congratulations! You have cracked the level and earned ${reward} Diamonds 💎 and ${xp} XP!`;
    } else {
      messageText = `Congratulations! You have completed the level again and earned ${xp} XP! (No extra diamonds are awarded for re-playing)`;
    }
    
    // Check for native AdMob
    if (typeof (window as any).Android !== 'undefined' && (window as any).Android.showInterstitialAd) {
      // Small timeout to allow the level to disappear visually, then show Ad
      setTimeout(() => {
        (window as any).Android.showInterstitialAd();
      }, 500);
    } else {
      // Simulate Interstitial Ad flow for Web Preview
      setTimeout(() => {
         setNotification(prev => ({
             ...prev,
             isOpen: true,
             message: 'Running in Web Preview: Native Interstitial Ad would play here on a mobile device.',
             type: 'info',
             title: 'Web Simulation (Ad)'
         }));
      }, 1500);
    }

    setCelebrationData({ xp, diamonds: reward });
    setShowCelebration(true);

    if (playNext) {
      setTimeout(() => {
        handleExercise(exerciseToLoad + 1);
      }, 600); // Trigger next level after a slight delay
    }
  };

  // Cycling vibrant color palettes for level buttons
  const getButtonColorClass = (level: number, isUnlocked: boolean, isCompleted: boolean) => {
    if (!isUnlocked) {
      return "bg-slate-200 border-slate-400 text-slate-400 cursor-not-allowed";
    }
    if (isCompleted) {
      return "bg-gradient-to-b from-green-400 to-green-600 border-green-800 text-white shadow-green-200";
    }
    
    const palette = (level - 1) % 4;
    switch (palette) {
      case 0: // Orange
        return "bg-gradient-to-b from-orange-400 to-orange-600 border-orange-800 text-white shadow-orange-200";
      case 1: // Blue
        return "bg-gradient-to-b from-sky-400 to-sky-600 border-sky-800 text-white shadow-sky-200";
      case 2: // Emerald
        return "bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-800 text-white shadow-emerald-200";
      case 3: // Purple
      default:
        return "bg-gradient-to-b from-purple-400 to-purple-600 border-purple-800 text-white shadow-purple-200";
    }
  };

  // Determine path zigzag layout dynamically
  const getOffsetClass = (level: number) => {
    const step = (level - 1) % 4;
    if (step === 0) return 'translate-x-0'; // Center
    if (step === 1) return '-translate-x-14 md:-translate-x-28'; // Left
    if (step === 2) return 'translate-x-14 md:translate-x-28'; // Right
    return 'translate-x-0'; // Center
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-40">
      {/* Sticky Gamified Top Bar */}
      <div className="sticky top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/')} 
            className="p-1.5 bg-white text-slate-600 rounded-full border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95"
            aria-label="Go back to Home"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3.5 py-1.5 rounded-full border border-orange-100 shadow-xs hidden sm:flex">
            <Flame size={18} className="fill-orange-500 animate-pulse text-orange-500" strokeWidth={2.5} />
            <span className="font-black text-sm tracking-tight">{userStreak} Days</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full border border-indigo-100 shadow-xs">
          <Trophy size={16} className="text-indigo-600" />
          <span className="font-extrabold text-xs tracking-tight uppercase">{getLevelRank(completedExercises.length)}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3.5 py-1.5 rounded-full border border-emerald-100 shadow-xs">
          <button onClick={() => {
              if (typeof (window as any).Android !== 'undefined' && (window as any).Android.showRewardedAd) {
                (window as any).Android.showRewardedAd();
              } else {
                 setNotification(prev => ({
                     ...prev,
                     isOpen: true,
                     message: 'Native Rewarded Ad would play here on a mobile device.',
                     type: 'info',
                     title: 'Web Simulation (Ad)'
                 }));
              }
          }} className="hover:scale-110 active:scale-95 transition-transform mr-1">+</button>
          <span className="text-base select-none">💎</span>
          <span id="top_bar_diamonds" className="font-black text-sm tracking-tight text-emerald-700">{diamonds}</span>
        </div>
      </div>

      {/* Main Roadmap Cover */}
      <div className="max-w-md mx-auto pt-8 px-6 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
          English Roadmap
        </h1>
        <p className="text-slate-500 font-bold mt-2.5 uppercase tracking-widest text-[10px] leading-relaxed">
          Level {completedExercises.length} / 100 Conquered
        </p>

        {/* Progress bar info */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full mt-4 overflow-hidden shadow-inner border border-slate-100">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((completedExercises.length / 100) * 100, 100)}%` }}
          />
        </div>
      </div>
      
      {/* 1-100 Zigzag Map (Rasta) container */}
      <div className="max-w-2xl mx-auto px-6 mt-12 relative flex flex-col items-center overflow-x-visible">
        
        {/* Continuous Dashed Connecting Vertical Line */}
        <div className="absolute top-10 bottom-10 left-1/2 w-1 -translate-x-1/2 select-none pointer-events-none z-0">
          <div className="w-full h-full border-l-[4px] border-dashed border-slate-300" />
        </div>

        {/* Level List Generator */}
        <div className="space-y-16 md:space-y-24 w-full flex flex-col items-center relative z-10">
          {Array.from({ length: 100 }).map((_, i) => {
            const level = i + 1;
            const isCompleted = completedExercises.includes(level);
            // First level is always unlocked. Others are unlocked if the previous is completed.
            const isUnlocked = level === 1 || completedExercises.includes(level - 1);
            // Current level is the first level that is unlocked but not yet completed.
            const isCurrent = isUnlocked && !isCompleted && (level === 1 || completedExercises.includes(level - 1));

            const topicInfo = getLevelTopic(level);
            const topicIndex = (level - 1) % 25; // 25 unique topics cyclicly
            const cardStyle = getTopicCardStyle(topicIndex);
            
            // Determine side position of illustration card based on zigzag step
            const step = (level - 1) % 4;
            // step 0, 2 -> place card on Left side of button
            // step 1, 3 -> place card on Right side of button
            const isLeftCard = step === 0 || step === 2;
            const cardPositionClass = isLeftCard
              ? "absolute right-[96px] md:right-[124px] top-1/2 -translate-y-1/2"
              : "absolute left-[96px] md:left-[124px] top-1/2 -translate-y-1/2";

            return (
              <div 
                key={`level-${level}`} 
                className={`relative flex flex-col items-center transition-transform duration-500 hover:scale-103 ${getOffsetClass(level)}`}
              >
                {/* 2D Topic Illustration Picture Card */}
                <div 
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedLevel(level);
                    } else {
                      setNotification({
                        isOpen: true,
                        message: "You must complete the previous levels first before unlocking this level! 🔒",
                        type: 'info',
                        title: 'Level Locked!'
                      });
                    }
                  }}
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl border-2 border-b-[4px] shadow-sm select-none transition-all duration-300 cursor-pointer ${cardPositionClass} ${
                    !isUnlocked 
                      ? "bg-slate-100/90 border-slate-200 filter grayscale opacity-40 shadow-xs" 
                      : isCompleted
                        ? `bg-gradient-to-br ${cardStyle.bg} ${cardStyle.border} border-b-[4px] border-slate-300/80 hover:scale-105 hover:shadow-md`
                        : `bg-gradient-to-br ${cardStyle.bg} ${cardStyle.border} border-b-[4px] border-b-emerald-600/70 shadow-md ring-2 ring-emerald-500/20 hover:scale-105 hover:shadow-lg`
                  } w-[92px] h-[72px] md:w-[136px] md:h-[96px]`}
                  title={`${topicInfo.name}`}
                >
                  {/* Floating badge details for active level */}
                  {isCurrent && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 text-[8px] text-white items-center justify-center font-black">!</span>
                    </span>
                  )}

                  {/* 2D Graphic Circle */}
                  <div className={`rounded-xl flex items-center justify-center ${
                    !isUnlocked 
                      ? "bg-slate-200 text-slate-400 w-8 h-8 md:w-12 md:h-12 text-sm md:text-xl" 
                      : "bg-white/95 shadow-2xs border border-white/80 w-9 h-9 md:w-14 md:h-14 text-lg md:text-3xl"
                  }`}>
                    {isUnlocked ? (
                      <span className="drop-shadow-xs select-none">{topicInfo.icon}</span>
                    ) : (
                      <span className="text-[12px] md:text-sm">🔒</span>
                    )}
                  </div>

                  {/* Ribbon Title */}
                  <div className="w-full text-center">
                    <span className={`block font-black text-[7px] md:text-[9px] tracking-tight uppercase truncate max-w-full leading-none mt-0.5 ${
                      isUnlocked ? "text-slate-700 font-extrabold" : "text-slate-400"
                    }`}>
                      {topicInfo.name.split(' II')[0].split(' Pro')[0].split(' Master')[0]}
                    </span>
                  </div>
                </div>

                {/* Crown badge for active current level */}
                {isCurrent && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                    <div className="relative animate-bounce duration-1000">
                      <Crown className="w-7 h-7 text-amber-500 fill-amber-300 drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]" />
                      <span className="absolute inset-0 w-7 h-7 bg-amber-400 filter blur-sm opacity-40 rounded-full scale-125 -z-10 animate-ping" />
                    </div>
                  </div>
                )}

                {/* 3D Circular Level Button */}
                <button 
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedLevel(level);
                    } else {
                      setNotification({
                        isOpen: true,
                        message: "You must complete the previous levels first before unlocking this level! 🔒",
                        type: 'info',
                        title: 'Level Locked!'
                      });
                    }
                  }}
                  className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center border-b-[6px] active:border-b-0 active:translate-y-[6px] shadow-lg transition-all duration-300 select-none ${getButtonColorClass(level, isUnlocked, isCompleted)}`}
                >
                  {!isUnlocked ? (
                    <Lock className="text-white opacity-75" size={24} strokeWidth={2.5} />
                  ) : isCompleted ? (
                    <Trophy className="text-white fill-amber-100/20" size={28} strokeWidth={2.5} />
                  ) : (
                    <span className="font-black text-2xl tracking-tighter drop-shadow-sm select-none">
                      {level}
                    </span>
                  )}

                  {/* Pulsing halo around active level */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping opacity-35" />
                  )}
                </button>
                
                {/* Level Title label underneath */}
                <div className={`mt-2.5 px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full border border-slate-100 shadow-2xs font-extrabold text-[10px] tracking-tight uppercase ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                  Lvl {level}: {getLevelTopic(level).name.substring(0, 16)}{getLevelTopic(level).name.length > 16 ? '..' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Pop-up Card */}
      {selectedLevel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl relative border-4 border-slate-100/50 flex flex-col items-center p-8 transform scale-100 transition-transform duration-300">
            {/* Close action button */}
            <button 
              onClick={() => setSelectedLevel(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition active:scale-95"
            >
              ✕
            </button>

            {/* Level Tag */}
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-50">
              LEVEL {selectedLevel}
            </span>
            
            {/* Topic Name */}
            <h3 className="text-2xl font-black text-slate-900 tracking-tight text-center px-4 leading-tight">
              {getLevelTopic(selectedLevel).name}
            </h3>

            {/* Vector Graphic Frame for Icons / Emojis */}
            <div className="w-28 h-28 bg-gradient-to-br from-teal-50 to-emerald-50 border-4 border-white shadow-xl rounded-full flex items-center justify-center text-6xl my-6 relative animate-pulse">
              <span className="relative drop-shadow-md select-none">{getLevelTopic(selectedLevel).icon}</span>
            </div>

            {/* Sub description */}
            <p className="text-center text-slate-600 font-bold text-sm px-4 leading-relaxed mb-8">
              {getLevelTopic(selectedLevel).desc}
            </p>

            {/* START Action Button with 3D Effect */}
            <button
              onClick={() => {
                handleExercise(selectedLevel);
                setSelectedLevel(null);
              }}
              className="w-full py-4 bg-gradient-to-b from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-lg rounded-[24px] border-b-[6px] border-emerald-800 active:border-b-0 active:translate-y-1.5 transition-all shadow-lg shadow-emerald-100 tracking-wide uppercase bounce-click"
            >
              {completedExercises.includes(selectedLevel) ? 'START' : `START +${loadLevel(selectedLevel).length === 10 ? 5 : 10} 💎`}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Screen Wrapper */}
      {showExercise && (
        <div className="fixed inset-0 z-50 bg-white">
          <button onClick={() => setShowExercise(false)} className="absolute top-4 left-4 z-[60] p-2 bg-slate-100 rounded-full hover:bg-slate-200 active:scale-90 transition">
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <InteractiveQuestionController 
            level={exerciseToLoad} 
            onClose={() => setShowExercise(false)} 
            onComplete={handleExerciseComplete} 
          />
        </div>
      )}

      {/* Celebration Popup */}
      {showCelebration && (
        <CelebrationPage 
          xp={celebrationData.xp} 
          diamonds={celebrationData.diamonds} 
          onClose={() => setShowCelebration(false)} 
        />
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
