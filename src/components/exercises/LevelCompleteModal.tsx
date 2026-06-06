import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Star, Sparkles, Heart } from 'lucide-react';
import celebrityImg from '../../assets/images/boy_dancing_trophy_1780577419263.png';
import { showInterstitialAd } from '../../lib/adService';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface FireworkBurst {
  id: number;
  left: string;
  top: string;
  particles: Particle[];
}

const FIREWORK_COLORS = [
  'bg-amber-500 shadow-amber-400',
  'bg-emerald-550 shadow-emerald-400',
  'bg-rose-500 shadow-rose-400',
  'bg-sky-500 shadow-sky-400',
  'bg-fuchsia-500 shadow-fuchsia-400',
  'bg-yellow-500 shadow-yellow-400',
  'bg-cyan-550 shadow-cyan-400',
];

export const LevelCompleteModal: React.FC<{ xp: number, onContinue: () => void, onPlayNext?: () => void, diamonds?: number }> = ({ xp, onContinue, onPlayNext, diamonds = 10 }) => {
  const [bursts, setBursts] = useState<FireworkBurst[]>([]);

  // Function to spawn a random firework burst
  const spawnFirework = () => {
    const burstId = Date.now() + Math.random();
    const particleCount = 20;
    const particles: Particle[] = [];
    const chosenColor = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    for (let j = 0; j < particleCount; j++) {
      const angle = (j * 360) / particleCount;
      const rad = (angle * Math.PI) / 180;
      const distance = 70 + Math.random() * 60; // Distance of burst spread
      const targetX = Math.cos(rad) * distance;
      const targetY = Math.sin(rad) * distance;

      particles.push({
        id: j,
        x: targetX,
        y: targetY,
        color: chosenColor,
        size: Math.random() * 5 + 4, // 4px to 9px particles
      });
    }

    const randomLeft = `${15 + Math.random() * 70}%`;
    const randomTop = `${10 + Math.random() * 32}%`;

    const newBurst: FireworkBurst = {
      id: burstId,
      left: randomLeft,
      top: randomTop,
      particles,
    };

    setBursts(prev => [...prev.slice(-6), newBurst]); // Keep max 6 active bursts
  };

  // Automatically trigger fireworks repeatedly
  useEffect(() => {
    // Show interstitial ad on level complete
    showInterstitialAd();

    // Initial batch of crackers
    setTimeout(spawnFirework, 100);
    setTimeout(spawnFirework, 450);
    setTimeout(spawnFirework, 900);

    const interval = setInterval(spawnFirework, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-6 overflow-hidden text-slate-800">
      
      {/* Decorative Starry Background Elements optimized for light backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-10 left-[12%] w-3 h-3 bg-amber-200 rounded-full animate-ping duration-1000" />
        <div className="absolute top-24 right-[20%] w-4 h-4 bg-emerald-100 rounded-full animate-pulse duration-1500" />
        <div className="absolute top-[40%] left-[85%] w-2 h-2 bg-rose-200 rounded-full animate-ping duration-700" />
        <div className="absolute top-[60%] left-[10%] w-3 h-3 bg-sky-200 rounded-full animate-pulse duration-2000" />
        <div className="absolute top-[80%] right-[12%] w-4 h-4 bg-purple-200 rounded-full animate-ping duration-1200" />
      </div>

      {/* Dynamic Bursting Fireworks (Patakhe) at the top */}
      <div className="absolute inset-x-0 top-0 h-1/2 z-10 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {bursts.map(burst => (
            <div 
              key={burst.id} 
              className="absolute" 
              style={{ left: burst.left, top: burst.top }}
            >
              {/* Central burst helper splash */}
              <motion.div
                initial={{ scale: 0.1, opacity: 0.8 }}
                animate={{ scale: [0.1, 2.0], opacity: [0.8, 0] }}
                transition={{ duration: 0.65 }}
                className="w-12 h-12 -ml-6 -mt-6 rounded-full bg-amber-300/30 blur-md"
              />

              {/* Individual Firework cracker particles */}
              {burst.particles.map(particle => (
                <motion.div
                  key={particle.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ 
                    x: particle.x, 
                    y: [0, particle.y - 20, particle.y], // realistic physics fall parameters
                    opacity: [1, 1, 0], 
                    scale: [1, 1.3, 0] 
                  }}
                  transition={{ 
                    duration: 1.35, 
                    ease: "easeOut" 
                  }}
                  className={`absolute rounded-full shadow-md ${particle.color}`}
                  style={{
                    width: particle.size,
                    height: particle.size,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER TITLE AREA */}
      <div className="text-center mt-6 z-20 space-y-2.5 max-w-sm">
        <motion.div
          initial={{ y: -45, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 110, delay: 0.15 }}
          className="flex justify-center gap-1.5 items-center"
        >
          <Sparkles className="text-amber-500 fill-amber-300 animate-spin duration-3000" size={24} />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
            LEVEL CRACKED!
          </h2>
          <Sparkles className="text-amber-500 fill-amber-300 animate-spin duration-3000" size={24} />
        </motion.div>
        
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 11, delay: 0.3 }}
          className="text-3xl md:text-4xl font-black tracking-tight leading-none uppercase font-sans text-slate-900"
        >
          Congratulations! <br />
          <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-amber-500 bg-clip-text text-transparent">
            You Won the Level! 🏆
          </span>
        </motion.h1>
      </div>

      {/* MID ILLUSTRATION - CHEERFUL DANCING MAN WITH GOLDEN TROPHY */}
      <div className="relative flex flex-col items-center justify-center my-4 z-20">
        {/* Animated Glow Spot in the Background */}
        <div className="absolute inset-0 bg-emerald-400/10 filter blur-[50px] rounded-full scale-125 animate-pulse" />
        
        {/* Infinite dynamic dancing simulation on the character card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            y: [0, -15, 0, -15, 0],
            rotate: [0, -5, 5, -5, 0]
          }}
          transition={{ 
            initial: { type: 'spring', damping: 10, delay: 0.5 },
            y: { duration: 2.0, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 2.0, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-[40px] bg-gradient-to-br from-emerald-50/50 to-amber-50/50 border-[3px] border-emerald-100/55 shadow-xl flex items-center justify-center p-2"
        >
          <img 
            src={celebrityImg} 
            alt="Cheerfully dancing man holding victory trophy" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-3xl"
          />
          
          {/* Sparkly cartoon stars floating around human model */}
          <div className="absolute top-4 left-4 animate-bounce duration-1000">
            <Star className="text-yellow-400 fill-yellow-300 w-7 h-7 drop-shadow-sm" />
          </div>
          <div className="absolute bottom-6 right-6 animate-bounce duration-1500">
            <Trophy className="text-amber-500 fill-amber-200/50 w-8 h-8 drop-shadow-sm" />
          </div>
        </motion.div>
      </div>

      {/* SCORE STATS REGION */}
      <div className="w-full max-w-sm z-20 space-y-4 px-4">
        <motion.div 
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="grid grid-cols-2 gap-3.5"
        >
          {/* Card 1: XP Earned */}
          <div className="bg-emerald-50/75 border border-emerald-100/80 rounded-3xl p-4 flex flex-col items-center text-center shadow-xs">
            <span className="text-2xl mb-1 select-none">✨</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">XP Gained</p>
            <p className="text-2xl font-black text-emerald-700">+{xp} XP</p>
          </div>

          {/* Card 2: Diamonds Claimed */}
          <div className="bg-amber-50/75 border border-amber-100/80 rounded-3xl p-4 flex flex-col items-center text-center shadow-xs">
            <span className="text-2xl mb-1 select-none">💎</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Gems Claimed</p>
            <p className="text-2xl font-black text-amber-700">+{diamonds} Gems</p>
          </div>
        </motion.div>

        {/* Dynamic Flame Streaks Banner */}
        <motion.div
          initial={{ y: 35, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="bg-orange-50/80 border border-orange-100 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <Flame size={20} className="fill-orange-500 text-orange-600 animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-orange-700 uppercase tracking-wider">Streak Retained!</p>
              <p className="text-[11px] text-slate-500 font-medium">Your daily streak is perfectly safe.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/90 border border-orange-100/60 px-2.5 py-1 rounded-lg">
            <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-black text-xs text-slate-700">5/5</span>
          </div>
        </motion.div>
      </div>

      {/* MAIN REDIRECT INTERACTION ROADMAP ACTION BUTTON */}
      <motion.div 
        initial={{ y: 45, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.95 }}
        className="w-full max-w-sm mt-6 mb-4 z-20 px-4 flex flex-col gap-3"
      >
        {onPlayNext && (
          <button
            onClick={onPlayNext}
            className="w-full py-4.5 bg-gradient-to-b from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:border-b-0 active:translate-y-1.5 text-white font-black text-lg rounded-[24px] border-b-[6px] border-indigo-800 shadow-lg shadow-indigo-200 transition-all uppercase tracking-wide flex items-center justify-center gap-2 bounce-click"
          >
            <span>PLAY NEXT LEVEL</span>
            <span className="text-xl">➔</span>
          </button>
        )}
        <button
          onClick={onContinue}
          className="w-full py-4.5 bg-gradient-to-b from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-750 active:border-b-0 active:translate-y-1.5 text-white font-black text-lg rounded-[24px] border-b-[6px] border-emerald-800 shadow-lg shadow-emerald-100 transition-all uppercase tracking-wide flex items-center justify-center gap-2 bounce-click"
        >
          <span>CONTINUE ROADMAP</span>
        </button>
      </motion.div>

    </div>
  );
};
