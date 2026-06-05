import React from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface CelebrationPageProps {
  xp: number;
  diamonds: number;
  onClose: () => void;
}

export default function CelebrationPage({ xp, diamonds, onClose }: CelebrationPageProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-emerald-900/90 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Trophy size={48} className="text-amber-500 fill-amber-300" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2">Level Complete!</h2>
        <p className="text-slate-600 font-medium mb-8">You are doing fantastic! Keep up the momentum.</p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
            <span className="block text-2xl font-black text-emerald-600">+{xp}</span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">XP</span>
          </div>
          <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100">
            <span className="block text-2xl font-black text-amber-600">+{diamonds}</span>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Diamonds</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg rounded-[24px] border-b-[6px] border-emerald-800 active:border-b-0 active:translate-y-1.5 transition-all shadow-lg shadow-emerald-200"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
}
