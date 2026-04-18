import { useState, useEffect } from 'react';
import { X, Clock, Gift } from 'lucide-react';
import Notification from './Notification';

export default function Rewards({ onClose, onClaim }: { onClose: () => void, onClaim: (amount: number) => void }) {
  const [activeTab, setActiveTab] = useState<'daily' | 'time'>('daily');
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info',
  });
  const [lastClaimed, setLastClaimed] = useState<number | null>(() => {
    const saved = localStorage.getItem('lastClaimed');
    return saved ? parseInt(saved, 10) : null;
  });
  const [day, setDay] = useState(() => {
    const saved = localStorage.getItem('currentDay');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [usageTime, setUsageTime] = useState(() => {
    const savedTime = localStorage.getItem('usageTime');
    return savedTime ? parseInt(savedTime, 10) : 0;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setUsageTime(parseInt(localStorage.getItem('usageTime') || '0', 10));
    }, 1000); // Read from localStorage every second to update UI
    return () => clearInterval(timer);
  }, []);

  const handleClaimDaily = (claimDay: number) => {
    const now = Date.now();
    if (lastClaimed && now - lastClaimed < 24 * 60 * 60 * 1000) {
      setNotification({
        isOpen: true,
        message: 'Aap har 24 ghante mein sirf ek baar claim kar sakte hain!',
        type: 'error',
        title: 'Thoda Intezar Karein'
      });
      return;
    }
    if (claimDay !== day) {
      setNotification({
        isOpen: true,
        message: 'Aap abhi is din ka reward claim nahi kar sakte!',
        type: 'error',
        title: 'Not Ready'
      });
      return;
    }
    
    const amount = claimDay * 5; // 5 diamonds per day
    onClaim(amount);
    setLastClaimed(now);
    localStorage.setItem('lastClaimed', now.toString());
    
    const nextDay = day < 30 ? day + 1 : 1;
    setDay(nextDay);
    localStorage.setItem('currentDay', nextDay.toString());
    setNotification({
      isOpen: true,
      message: `Mubarak ho! Aapne Day ${claimDay} ke liye ${amount} diamonds claim kar liye hain!`,
      type: 'success',
      title: 'Diamond Claimed! 💎'
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
        message: `Shabash! Aapne ${amount} diamonds claim kar liye hain!`,
        type: 'success',
        title: 'Reward Unlocked! 💎'
      });
    } else {
      setNotification({
        isOpen: true,
        message: 'Reward claim karne ke liye thoda aur samay chahiye!',
        type: 'info',
        title: 'App Chalao'
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
          <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 pb-0 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
               <Gift size={24} strokeWidth={2.5} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rewards</h2>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-2xl active:scale-90 transition"><X size={24} /></button>
        </div>

        <div className="px-6 mb-4">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-[22px] border border-slate-100">
            <button 
              onClick={() => setActiveTab('daily')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-sm transition-all ${activeTab === 'daily' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <Gift size={18}/> Daily
            </button>
            <button 
              onClick={() => setActiveTab('time')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-sm transition-all ${activeTab === 'time' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <Clock size={18}/> Time
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-6 pb-8 scrollbar-hide">
          {activeTab === 'daily' ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const d = i + 1;
                const isClaimed = d < day;
                const isAvailable = d === day;
                return (
                  <div 
                    key={d} 
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all relative ${
                      isClaimed ? 'bg-emerald-50 text-emerald-600' : 
                      isAvailable ? 'bg-amber-100 text-amber-800 ring-4 ring-amber-100' : 
                      'bg-slate-50 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-black opacity-60">Day {d}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                       <span className="font-black text-xs">{d * 5}</span>
                       <span className="text-xs">💎</span>
                    </div>
                    {isAvailable && (
                      <button 
                        onClick={() => handleClaimDaily(d)} 
                        className="absolute inset-0 w-full h-full bg-amber-500 text-white rounded-2xl font-black text-[10px] animate-pulse shadow-lg shadow-amber-500/20"
                      >
                        CLAIM
                      </button>
                    )}
                    {isClaimed && (
                       <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                         <X size={10} className="rotate-45" strokeWidth={4} />
                       </div>
                    )}
                  </div>
                );
              })}
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
