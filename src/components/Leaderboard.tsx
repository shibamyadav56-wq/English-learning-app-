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
    const q = query(collection(db, 'users'), orderBy('diamonds', 'desc'), limit(10));
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
    <div className="p-4 bg-warm-bg min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 flex items-center justify-center gap-2">
        <Trophy className="text-yellow-500" /> Leaderboard
      </h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {scores.map((score, index) => (
          <div key={score.id} className="flex justify-between items-center py-3 border-b last:border-0">
            <div className="flex items-center gap-3">
              <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                #{index + 1}
              </span>
              <span className="font-medium text-gray-800">{score.name}</span>
            </div>
            <span className="font-bold text-accent">{score.diamonds} 💎</span>
          </div>
        ))}
      </div>
    </div>
  );
}
