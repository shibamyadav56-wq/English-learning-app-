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
    <div className="p-4 bg-warm-bg min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => setShowRewards(true)} className="flex items-center gap-2 bg-green-50 p-2 rounded-full px-4">
          <Gift className="text-green-600" />
          <span className="font-semibold text-green-800">Rewards</span>
        </button>
        <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded-full px-4">
          <span className="text-xl leading-none">💎</span>
          <span className="font-bold text-yellow-800">{diamonds}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/ai-assistant')}
          className="col-span-2 h-40 flex flex-col items-center justify-center bg-primary text-white rounded-3xl shadow-lg hover:bg-blue-700 transition"
        >
          <Bot size={64} />
          <span className="mt-2 text-xl font-bold">AI Homework Assistant</span>
        </button>
        <button 
          onClick={() => navigate('/word-meaning')}
          className="col-span-2 h-40 flex flex-col items-center justify-center bg-purple-600 text-white rounded-3xl shadow-lg hover:bg-purple-700 transition"
        >
          <BookOpenText size={64} />
          <span className="mt-2 text-xl font-bold">Word Meaning</span>
        </button>
      </div>

      {showRewards && <Rewards onClose={() => setShowRewards(false)} onClaim={addDiamonds} />}
    </div>
  );
}
