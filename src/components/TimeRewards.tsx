import { useState, useEffect } from 'react';
import { X, Clock, Gift, Flame, Lock, Check } from 'lucide-react';
import Notification from './Notification';

// Cool gamified avatars imported for special reward milestones
import avatarShadowKnight from '../assets/images/shadow_knight_new_1780555060997.png';
import avatarHackerKid from '../assets/images/hacker_kid_1780547359191.png';
import avatarGoldenGamer from '../assets/images/golden_gamer_1780547409144.png';

interface RewardItem {
  day: number;
  diamonds: number;
  isBundle: boolean;
  bundleId?: string;
  bundleName?: string;
  avatarUrl?: string;
}

const REWARDS_PATH: RewardItem[] = [
  { day: 1, diamonds: 5, isBundle: false },
  { day: 2, diamonds: 10, isBundle: false },
  { day: 3, diamonds: 15, isBundle: false },
  { day: 4, diamonds: 20, isBundle: false },
  { day: 5, diamonds: 25, isBundle: false },
  { day: 6, diamonds: 30, isBundle: false },
  { day: 7, diamonds: 0, isBundle: true, bundleId: 'shadow_knight', bundleName: 'Shadow Knight', avatarUrl: avatarShadowKnight },
  { day: 8, diamonds: 35, isBundle: false },
  { day: 9, diamonds: 40, isBundle: false },
  { day: 10, diamonds: 45, isBundle: false },
  { day: 11, diamonds: 50, isBundle: false },
  { day: 12, diamonds: 55, isBundle: false },
  { day: 13, diamonds: 60, isBundle: false },
  { day: 14, diamonds: 65, isBundle: false },
  { day: 15, diamonds: 70, isBundle: false },
  { day: 16, diamonds: 75, isBundle: false },
  { day: 17, diamonds: 80, isBundle: false },
  { day: 18, diamonds: 85, isBundle: false },
  { day: 19, diamonds: 90, isBundle: false },
  { day: 20, diamonds: 0, isBundle: true, bundleId: 'hacker_kid', bundleName: 'Hacker Kid', avatarUrl: avatarHackerKid },
  { day: 21, diamonds: 100, isBundle: false },
  { day: 22, diamonds: 110, isBundle: false },
  { day: 23, diamonds: 120, isBundle: false },
  { day: 24, diamonds: 130, isBundle: false },
  { day: 25, diamonds: 0, isBundle: true, bundleId: 'golden_gamer', bundleName: 'Golden Gamer', avatarUrl: avatarGoldenGamer },
  { day: 26, diamonds: 150, isBundle: false },
  { day: 27, diamonds: 160, isBundle: false },
  { day: 28, diamonds: 170, isBundle: false },
  { day: 29, diamonds: 180, isBundle: false },
  { day: 30, diamonds: 200, isBundle: false },
];

export default function Rewards({ onClose, onClaim }: { onClose: () => void, onClaim: (amount: number, unlockedAvatarIds?: string[]) => void }) {
  const [activeTab, setActiveTab] = useState<'daily' | 'time'>('daily');
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  // Load state from localStorage which are kept in sync with Firestore via App.tsx automatically
  const [userStreak, setUserStreak] = useState<number>(() => {
    const saved = localStorage.getItem('userStreak') || localStorage.getItem('currentDay');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastClaimedTime, setLastClaimedTime] = useState<number>(() => {
    const saved = localStorage.getItem('lastClaimedTime') || localStorage.getItem('lastClaimed');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const [usageTime, setUsageTime] = useState(() => {
    const savedTime = localStorage.getItem('usageTime');
    return savedTime ? parseInt(savedTime, 10) : 0;
  });

  // Tick time for countdown and active usage monitoring
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      setUsageTime(parseInt(localStorage.getItem('usageTime') || '0', 10));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute timing properties
  const timePassed = lastClaimedTime > 0 ? currentTime - lastClaimedTime : Infinity;
  const isCooldown = timePassed < 24 * 60 * 60 * 1000;
  const isReady = lastClaimedTime === 0 || (timePassed >= 24 * 60 * 60 * 1000 && timePassed < 48 * 60 * 60 * 1000);
  const isBroken = lastClaimedTime > 0 && timePassed >= 48 * 60 * 60 * 1000;

  // Day calculations
  let activeDay = 1;
  if (isCooldown) {
    activeDay = userStreak;
  } else if (isReady) {
    activeDay = userStreak + 1;
    if (activeDay > 30) activeDay = 1; // Wrap around to Day 1
  } else if (isBroken) {
    activeDay = 1; 
  }

  // Generate the countdown timer string (HH:MM:SS)
  const getCountdownString = () => {
    if (lastClaimedTime === 0) return '00:00:00';
    const nextClaimTime = lastClaimedTime + 24 * 60 * 60 * 1000;
    const diff = nextClaimTime - currentTime;
    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  const handleClaimDaily = () => {
    const now = Date.now();
    const tPassed = lastClaimedTime > 0 ? now - lastClaimedTime : Infinity;
    
    // Safety check for cooldown
    if (lastClaimedTime > 0 && tPassed < 24 * 60 * 60 * 1000) {
      setNotification({
        isOpen: true,
        message: `You have to wait a little longer to claim the next reward! Next claim ready in ${getCountdownString()}`,
        type: 'error',
        title: 'Locks Active 🔒'
      });
      return;
    }

    let nextStreak = 1;
    let targetDay = 1;

    if (lastClaimedTime === 0) {
      // First Claim ever
      nextStreak = 1;
      targetDay = 1;
    } else if (tPassed >= 24 * 60 * 60 * 1000 && tPassed < 48 * 60 * 60 * 1000) {
      // Rule B: Consecutive Claim
      nextStreak = userStreak + 1;
      if (nextStreak > 30) nextStreak = 1;
      targetDay = nextStreak;
    } else {
      // Rule C: Broken Streak or missed day (>= 48h)
      nextStreak = 1;
      targetDay = 1;
    }

    const rewardItem = REWARDS_PATH.find(r => r.day === targetDay) || REWARDS_PATH[0];
    const earnedDiamonds = rewardItem.isBundle ? 0 : rewardItem.diamonds;
    const unlockedAvatars = rewardItem.isBundle && rewardItem.bundleId ? [rewardItem.bundleId] : [];

    // Trigger physical claim event
    onClaim(earnedDiamonds, unlockedAvatars);

    // Save states to local variables and UI states
    setUserStreak(nextStreak);
    setLastClaimedTime(now);

    // Set storage values
    localStorage.setItem('userStreak', nextStreak.toString());
    localStorage.setItem('currentDay', nextStreak.toString());
    localStorage.setItem('lastClaimedTime', now.toString());
    localStorage.setItem('lastClaimed', now.toString());

    // Dispatch Storage Event to let parent know about changes
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      const event = document.createEvent('Event');
      event.initEvent('storage', true, true);
      window.dispatchEvent(event);
    }

    const customMsg = rewardItem.isBundle 
      ? `${rewardItem.bundleName} Character Bundle 🎉` 
      : `${earnedDiamonds} Diamonds 💎`;

    setNotification({
      isOpen: true,
      message: `Congratulations! You have claimed your Day ${targetDay} reward: ${customMsg}`,
      type: 'success',
      title: rewardItem.isBundle ? 'Character Unlocked! 👑' : 'Reward Conquered! 💎'
    });
  };

  const claimTimeReward = (minutes: number, amount: number) => {
    const secondsNeeded = minutes * 60;
    
    if (usageTime >= secondsNeeded) {
      onClaim(amount);
      const newTime = usageTime - secondsNeeded;
      setUsageTime(newTime);
      localStorage.setItem('usageTime', newTime.toString());
      setNotification({
        isOpen: true,
        message: `Well done! You have successfully claimed ${amount} diamonds!`,
        type: 'success',
        title: 'Reward Unlocked! 💎'
      });
    } else {
      setNotification({
        isOpen: true,
        message: 'You need to spend a little more time in the app to claim this reward!',
        type: 'info',
        title: 'Keep Learning'
      });
    }
  };

  const renderProgressBar = (minutes: number) => {
    const secondsNeeded = minutes * 60;
    const progress = Math.min((usageTime / secondsNeeded) * 100, 100);
    const isClaimable = usageTime >= secondsNeeded;
    
    return (
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
               <Clock size={14} strokeWidth={3} />
            </div>
            <span className="font-black text-slate-800 text-sm">{minutes} Min Reward</span>
          </div>
          <span className="text-blue-600 font-extrabold flex items-center gap-1 text-sm bg-white p-1 px-3 rounded-xl border border-blue-50 shadow-sm">
            +{minutes === 10 ? 5 : minutes === 20 ? 15 : 50} 
            <span className="leading-none">💎</span>
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        <button 
          onClick={() => claimTimeReward(minutes, minutes === 10 ? 5 : minutes === 20 ? 15 : 50)} 
          disabled={!isClaimable}
          className={`w-full py-3 rounded-2xl font-black text-sm transition-all bounce-click ${
            isClaimable 
              ? 'bg-primary text-white shadow-lg shadow-blue-500/20' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed grayscale'
          }`}
        >
          {isClaimable ? 'CLAIM NOW' : 'KEEP LEARNING'}
        </button>
      </div>
    );
  };

  const getCardStatus = (d: number) => {
    if (isCooldown) {
      if (d <= userStreak) return 'claimed';
      return 'locked';
    } else if (isReady) {
      if (d < activeDay) return 'claimed';
      if (d === activeDay) return 'active';
      return 'locked';
    } else if (isBroken) {
      if (d === 1) return 'active';
      return 'locked';
    } else {
      if (d === 1) return 'active';
      return 'locked';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-6 pb-0 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
               <Gift size={24} strokeWidth={2.5} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rewards Dashboard</h2>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-2xl active:scale-90 transition"><X size={24} /></button>
        </div>

        {/* Tab Switches (Daily Rewards vs Learning Time Reward) */}
        <div className="px-6 mb-4">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-[22px] border border-slate-100">
            <button 
              onClick={() => setActiveTab('daily')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-sm transition-all ${activeTab === 'daily' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <Gift size={18}/> Daily Quest
            </button>
            <button 
              onClick={() => setActiveTab('time')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-sm transition-all ${activeTab === 'time' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <Clock size={18}/> Bonus Active Time
            </button>
          </div>
        </div>

        {/* Dynamic content scroll wrapper */}
        <div className="flex-grow overflow-y-auto px-6 pb-6 scrollbar-hide">
          {activeTab === 'daily' ? (
            <div className="space-y-4">
              {/* STREAK HEADER BADGE */}
              <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-4 rounded-3xl text-white shadow-lg flex items-center justify-between border border-orange-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-2xl animate-bounce">
                    <Flame size={24} className="fill-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight leading-none">
                      Current Streak: {isBroken ? 0 : userStreak} Days 🔥
                    </h3>
                    <p className="text-[10px] font-bold text-orange-50 mt-1 uppercase tracking-wider">
                      {isCooldown 
                        ? "Day Claimed! Wait for next day" 
                        : isBroken 
                          ? "Missed a day! Streak reset to 1." 
                          : "Your reward is ready to Claim!"
                      }
                    </p>
                  </div>
                </div>
                {isCooldown ? (
                  <div className="bg-white/15 px-3 py-1 rounded-xl border border-white/20 text-center font-bold">
                    <span className="block text-[8px] tracking-wider text-orange-100 font-extrabold uppercase leading-none">Countdown</span>
                    <span className="font-mono text-xs font-black tracking-tight text-white leading-none mt-1 inline-block">{getCountdownString()}</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleClaimDaily}
                    className="bg-white text-orange-600 px-3.5 py-2 rounded-xl font-black text-xs hover:bg-orange-50 active:scale-95 transition tracking-wider shadow-md uppercase"
                  >
                    Claim 🎁
                  </button>
                )}
              </div>

              {/* Day Tracker Grid */}
              <div className="grid grid-cols-4 gap-2">
                {REWARDS_PATH.map((reward) => {
                  const d = reward.day;
                  const status = getCardStatus(d);
                  const isClaimed = status === 'claimed';
                  const isActive = status === 'active';
                  const isLocked = status === 'locked';
                  const isSpecial = reward.isBundle;

                  if (isSpecial) {
                    return (
                      <div 
                        key={d} 
                        className={`col-span-2 aspect-[1.8/1] flex flex-col justify-between p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                          isClaimed 
                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700' 
                            : isActive 
                              ? 'bg-gradient-to-br from-amber-50 to-orange-100/50 border-amber-300 text-amber-950 ring-4 ring-orange-400/30' 
                              : 'bg-gradient-to-br from-slate-50 to-slate-100/70 border-slate-150 text-slate-400'
                        }`}
                      >
                        {/* Avatar preview thumbnail */}
                        <div className="absolute right-1 bottom-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <img 
                            src={reward.avatarUrl} 
                            alt={reward.bundleName} 
                            className={`w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm bg-white ${isLocked ? 'grayscale opacity-50' : ''}`}
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="z-10 flex flex-col items-start leading-none">
                          <span className="text-[7px] font-black tracking-wider uppercase opacity-75">
                            Day {d} Special
                          </span>
                          <span className="text-[9px] font-black mt-1 text-slate-800 leading-none">
                            {reward.bundleName}
                          </span>
                        </div>

                        <div className="z-10 flex items-center mt-auto">
                          <div className="bg-indigo-50/90 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-black text-[7px] uppercase tracking-wider leading-none">
                            🎁 Bundle Unlocked
                          </div>
                        </div>

                        {isActive && (
                          <button 
                            onClick={handleClaimDaily} 
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-xs hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-amber-500/35 flex items-center justify-center z-20 uppercase animate-pulse"
                          >
                            🎁 CLAIM
                          </button>
                        )}

                        {isClaimed && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm z-20">
                            <Check size={8} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={d} 
                      className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all relative ${
                        isClaimed 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : isActive 
                            ? 'bg-amber-100 text-amber-800 ring-4 ring-amber-200 border border-amber-300 animate-pulse' 
                            : 'bg-slate-50 text-slate-400 border border-slate-200/50'
                      }`}
                    >
                      <span className="text-[9px] font-black opacity-60">Day {d}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                         <span className="font-extrabold text-xs">+{reward.diamonds}</span>
                         <span className="text-xs">💎</span>
                      </div>
                      
                      {isClaimed && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}

                      {isLocked && (
                        <div className="absolute top-1 right-1 opacity-25">
                          <Lock size={8} strokeWidth={3} />
                        </div>
                      )}

                      {isActive && (
                        <button 
                          onClick={handleClaimDaily} 
                          className="absolute inset-0 w-full h-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[9px] transition shadow-md shadow-amber-500/25 flex items-center justify-center uppercase"
                        >
                          CLAIM
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden bg-slate-900 p-6 rounded-[32px] text-white shadow-xl mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Clock size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Time</p>
                    <p className="text-3xl font-black tabular-nums tracking-tight">
                      {Math.floor(usageTime / 60).toString().padStart(2, '0')}:
                      {(usageTime % 60).toString().padStart(2, '0')}
                      <span className="text-sm font-bold opacity-40 ml-1">MINS</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {renderProgressBar(10)}
                {renderProgressBar(20)}
                {renderProgressBar(60)}
              </div>
            </div>
          )}
        </div>
      </div>
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
