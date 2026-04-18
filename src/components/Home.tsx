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
    <div className="p-6 space-y-8">
      {/* Top Minimal Bar */}
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-md -mx-6 px-6 py-4 sticky top-0 z-20 border-b border-slate-200/50">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">LinguaMaster <span className="text-primary truncate">AI</span></h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowRewards(true)} 
            className="p-2 bg-amber-100 text-amber-600 rounded-xl active:scale-90 transition shadow-sm border border-amber-200/50"
          >
            <Gift size={18} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full font-black shadow-sm border border-slate-200 min-w-[60px] justify-center">
            <span className="text-sm leading-none">💎</span>
            <span className="text-xs text-slate-700">{diamonds}</span>
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 gap-6 pt-2">
        <button 
          onClick={() => navigate('/ai-assistant')}
          className="group relative h-48 flex flex-col items-start justify-end p-8 bg-white border border-slate-200 rounded-[48px] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bounce-click"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-8 right-8 p-5 bg-blue-600 text-white rounded-[32px] shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform">
            <Bot size={32} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Homework Tool</p>
            <span className="text-3xl font-black text-slate-900 leading-tight">AI Assistant</span>
            <p className="mt-2 text-sm text-slate-500 font-medium">Scan & solve problems instantly</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/word-meaning')}
          className="group relative h-48 flex flex-col items-start justify-end p-8 bg-white border border-slate-200 rounded-[48px] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bounce-click"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-8 right-8 p-5 bg-purple-600 text-white rounded-[32px] shadow-lg shadow-purple-500/30 group-hover:-rotate-6 transition-transform">
            <BookOpenText size={32} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Vocabulary Builder</p>
            <span className="text-3xl font-black text-slate-900 leading-tight">Daily Words</span>
            <p className="mt-2 text-sm text-slate-500 font-medium">Learn 10 new words every day</p>
          </div>
        </button>
      </div>

      {showRewards && <Rewards onClose={() => setShowRewards(false)} onClaim={addDiamonds} />}
    </div>
  );
}
