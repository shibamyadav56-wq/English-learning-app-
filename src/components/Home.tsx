import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, BookOpenText, Gift, Share2 } from 'lucide-react';
import Rewards from './TimeRewards';

export default function Home({ diamonds, setDiamonds }: { diamonds: number, setDiamonds: (d: number | ((prev: number) => number)) => void }) {
  const [showRewards, setShowRewards] = useState(false);
  const navigate = useNavigate();

  const addDiamonds = (amount: number) => {
    setDiamonds(prev => prev + amount);
  };

  const handleShare = () => {
    const appUrl = window.location.origin;
    const message = `Hey! I challenge you to beat my score on this awesome English Learning App! Can you get more diamonds than me? Play here: ${appUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Welcome Section */}
      <section className="mt-2 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Hello! 👋
          </h2>
          <p className="text-slate-500 font-medium">Ready to learn something today?</p>
        </div>
        <button 
          onClick={() => setShowRewards(true)} 
          className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 bounce-click flex items-center gap-2"
        >
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
            <Gift size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start pr-1">
            <span className="text-[9px] uppercase font-black text-slate-400 leading-none">Daily</span>
            <span className="text-xs font-black text-slate-800 leading-tight">Bonus</span>
          </div>
        </button>
      </section>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 gap-4 pt-4">
        <button 
          onClick={() => navigate('/ai-assistant')}
          className="group relative h-44 flex flex-col items-start justify-end p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-[40px] shadow-xl shadow-blue-500/20 overflow-hidden bounce-click"
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-3xl">
            <Bot size={36} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black leading-tight">AI Homework<br/>Assistant</span>
          <p className="mt-1 text-sm text-blue-100 font-medium opacity-80">Solve your problems instantly</p>
        </button>

        <button 
          onClick={() => navigate('/word-meaning')}
          className="group relative h-44 flex flex-col items-start justify-end p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-[40px] shadow-xl shadow-purple-500/20 overflow-hidden bounce-click"
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-3xl">
            <BookOpenText size={36} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black leading-tight">Daily Word<br/>Meanings</span>
          <p className="mt-1 text-sm text-purple-100 font-medium opacity-80">Expand your vocabulary</p>
        </button>
      </div>

      {showRewards && <Rewards onClose={() => setShowRewards(false)} onClaim={addDiamonds} />}
    </div>
  );
}
