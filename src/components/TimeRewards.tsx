import { useState, useEffect } from 'react';
import { Gem, X, Clock, Gift } from 'lucide-react';

export default function Rewards({ onClose, onClaim }: { onClose: () => void, onClaim: (amount: number) => void }) {
  const [activeTab, setActiveTab] = useState<'daily' | 'time'>('daily');
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
      alert('You can only claim once every 24 hours!');
      return;
    }
    if (claimDay !== day) {
      alert('You cannot claim this day yet!');
      return;
    }
    
    const amount = claimDay * 5; // 5 diamonds per day
    onClaim(amount);
    setLastClaimed(now);
    localStorage.setItem('lastClaimed', now.toString());
    
    const nextDay = day < 30 ? day + 1 : 1;
    setDay(nextDay);
    localStorage.setItem('currentDay', nextDay.toString());
    alert(`Claimed ${amount} diamonds for Day ${claimDay}!`);
  };

  const claimTimeReward = (minutes: number, amount: number) => {
    const secondsNeeded = minutes * 60;
    
    if (usageTime >= secondsNeeded) {
      onClaim(amount);
      const newTime = usageTime - secondsNeeded;
      setUsageTime(newTime);
      localStorage.setItem('usageTime', newTime.toString());
      alert(`Claimed ${amount} diamonds!`);
    } else {
      alert(`Need more time!`);
    }
  };

  const renderProgressBar = (minutes: number) => {
    const secondsNeeded = minutes * 60;
    const progress = Math.min((usageTime / secondsNeeded) * 100, 100);
    const isClaimable = usageTime >= secondsNeeded;
    
    return (
      <div className="bg-white p-4 rounded-2xl border-2 border-blue-100 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-blue-900">{minutes} min Reward</span>
          <span className="text-blue-600 font-bold">+{minutes === 10 ? 5 : minutes === 20 ? 15 : 50} 💎</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <button 
          onClick={() => claimTimeReward(minutes, minutes === 10 ? 5 : minutes === 20 ? 15 : 50)} 
          disabled={!isClaimable}
          className={`w-full p-2 rounded-xl font-bold transition ${isClaimable ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {isClaimable ? 'Claim' : 'In Progress'}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('daily')} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold ${activeTab === 'daily' ? 'bg-white shadow' : ''}`}><Gift size={18}/> Daily</button>
          <button onClick={() => setActiveTab('time')} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold ${activeTab === 'time' ? 'bg-white shadow' : ''}`}><Clock size={18}/> Time</button>
        </div>

        {activeTab === 'daily' ? (
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 30 }).map((_, i) => {
              const d = i + 1;
              const isClaimed = d < day;
              const isAvailable = d === day;
              return (
                <div key={d} className={`aspect-square flex flex-col items-center justify-center border-2 rounded-2xl font-bold text-xs p-1 ${isClaimed ? 'bg-green-100 border-green-300 text-green-800' : isAvailable ? 'bg-yellow-100 border-yellow-400 text-yellow-900' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                  <span>Day {d}</span>
                  <span className="text-xs">{d * 5} 💎</span>
                  {isAvailable && (
                    <button onClick={() => handleClaimDaily(d)} className="mt-1 bg-yellow-500 text-white text-[10px] px-2 py-1 rounded-lg">Claim</button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl text-white shadow-xl">
              <Clock size={48} className="text-white opacity-80" />
              <div>
                <p className="text-sm opacity-80">Total Time Spent</p>
                <p className="text-4xl font-black">
                  {Math.floor(usageTime / 60).toString().padStart(2, '0')}:
                  {(usageTime % 60).toString().padStart(2, '0')}
                  <span className="text-xl font-normal opacity-70"> mins</span>
                </p>
              </div>
            </div>
            {renderProgressBar(10)}
            {renderProgressBar(20)}
            {renderProgressBar(60)}
          </div>
        )}
      </div>
    </div>
  );
}
