import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type UserScore = {
  id: string;
  name: string;
  diamonds: number;
  photoURL?: string | null;
};

export default function Leaderboard() {
  const [scores, setScores] = useState<UserScore[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch top 50 users for the leaderboard
    const q = query(collection(db, 'users'), orderBy('diamonds', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newScores: UserScore[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newScores.push({
          id: doc.id,
          name: data.name || 'Anonymous',
          diamonds: data.diamonds || 0,
          photoURL: data.photoURL || null,
        });
      });
      setScores(newScores);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8 justify-center">
        <button 
          onClick={() => navigate('/')} 
          className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm absolute left-4 md:static"
          aria-label="Go back to Home"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-500" /> Leaderboard
        </h1>
      </div>
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 max-w-md mx-auto">
        {scores.length === 0 ? (
          <p className="text-center text-slate-400">No users yet...</p>
        ) : (
          scores.map((score, index) => (
            <div key={score.id} className="flex justify-between items-center py-4 border-b last:border-0 border-slate-100">
              <div className="flex items-center gap-3">
                <span className={`font-black text-lg w-8 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                  #{index + 1}
                </span>

                {/* Circular gamified user profile avatar picture container */}
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                  {score.photoURL ? (
                    <img 
                      src={score.photoURL} 
                      alt={score.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                      {score.name.substring(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <span className="font-bold text-slate-800">{score.name}</span>
              </div>
              <div className="flex items-center gap-1.5 font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
                <span>{score.diamonds}</span>
                <span className="text-lg">💎</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
