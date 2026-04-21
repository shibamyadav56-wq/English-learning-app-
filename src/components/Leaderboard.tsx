import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy } from 'lucide-react';

type UserScore = {
  id: string;
  name: string;
  diamonds: number;
};

export default function Leaderboard() {
  const [scores, setScores] = useState<UserScore[]>([]);

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
        });
      });
      setScores(newScores);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-center text-slate-900 flex items-center justify-center gap-3">
        <Trophy className="text-yellow-500" /> Leaderboard
      </h1>
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 max-w-md mx-auto">
        {scores.length === 0 ? (
          <p className="text-center text-slate-400">No users yet...</p>
        ) : (
          scores.map((score, index) => (
            <div key={score.id} className="flex justify-between items-center py-4 border-b last:border-0 border-slate-100">
              <div className="flex items-center gap-4">
                <span className={`font-black text-lg w-8 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                  #{index + 1}
                </span>
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
