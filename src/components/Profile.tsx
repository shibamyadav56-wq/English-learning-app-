import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where, getCountFromServer, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Trophy, Medal, Pencil, Check, X } from 'lucide-react';
import Notification from './Notification';

interface ProfileProps {
  diamonds: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  diamonds: number;
  displayId: string;
}

export default function Profile({ diamonds }: ProfileProps) {
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info',
  });
  const isMounted = React.useRef(true);
  const user = auth.currentUser;

  // Generate a deterministic 12-digit numeric ID from the Firebase UID
  const get12DigitId = (uid: string) => {
    const numericString = uid.split('').map(c => c.charCodeAt(0)).join('');
    const twelveDigits = numericString.substring(0, 12).padEnd(12, '0');
    return twelveDigits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchData = async () => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (isMounted.current) {
          if (docSnap.exists()) {
            setName(docSnap.data().name || user.displayName || 'User');
          } else {
            setName(user.displayName || 'User');
          }
        }

        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('diamonds', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const leaderboardData: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          leaderboardData.push({
            id: doc.id,
            name: data.name || 'Anonymous',
            diamonds: data.diamonds || 0,
            displayId: get12DigitId(doc.id)
          });
        });

        if (isMounted.current) {
          setLeaderboard(leaderboardData);
        }

        const userIndex = leaderboardData.findIndex(u => u.id === user.uid);
        if (userIndex !== -1) {
          if (isMounted.current) setUserRank(userIndex + 1);
        } else {
          try {
            const rankQuery = query(usersRef, where('diamonds', '>', diamonds));
            const rankSnapshot = await getCountFromServer(rankQuery);
            if (isMounted.current) setUserRank(rankSnapshot.data().count + 1);
          } catch (e) {
            console.error("Error fetching rank:", e);
            if (isMounted.current) setUserRank(null);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted.current) {
          setName(user.displayName || 'User');
        }
      }
    }
  };

  const handleUpdateName = async () => {
    if (!user || isUpdating || !editName.trim()) return;
    
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: editName.trim()
      });
      setName(editName.trim());
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error("Error updating name:", error);
      setNotification({
        isOpen: true,
        message: 'Naam update nahi ho paya. Kripya phir se koshish karein.',
        type: 'error',
        title: 'Error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = () => {
    setEditName(name);
    setIsEditing(true);
  };

  useEffect(() => {
    fetchData();
  }, [user, diamonds]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear(); // Clear all local data (diamonds, usage time, unlocked words, etc.)
      window.location.href = '/auth'; // Force a full reload to reset all React states
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return <div className="p-4 text-center mt-10">Please log in to view your profile.</div>;
  }

  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  const displayId = user ? get12DigitId(user.uid) : '';

  const getOrdinalSuffix = (i: number | null) => {
    if (i === null) return '-';
    const j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return i + "st";
    if (j == 2 && k != 12) return i + "nd";
    if (j == 3 && k != 13) return i + "rd";
    return i + "th";
  };

  return (
    <div className="min-h-screen bg-warm-bg p-4 md:p-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div className="w-20"></div> {/* Spacer to keep title centered */}
          <h1 className="text-3xl font-bold text-gray-900 text-center tracking-tight mt-4">Your Profile</h1>

          {/* Ad Button Placeholder */}
          <button 
            onClick={() => setNotification({
              isOpen: true,
              message: 'AdMob integration jald hi aa raha hai!',
              type: 'info',
              title: 'Coming Soon'
            })}
            className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md flex flex-col items-center justify-center text-white font-black transition-transform hover:scale-105 active:scale-95 border-2 border-yellow-200 shrink-0"
          >
            <span className="text-2xl mb-1">📺</span>
            <span className="text-center text-[10px] leading-tight">Watch Ad<br/>+2 💎</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-visible border border-gray-100 relative mb-12">
          {/* Top Gradient Background */}
          <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-t-3xl"></div>
          
          <div className="px-6 pb-8 relative">
            {/* Avatar Square */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg p-2 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-5xl font-black text-white drop-shadow-md">
                    {firstLetter}
                  </span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="pt-20 text-center">
              <div className="flex items-center justify-center gap-2 mb-1 group">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-2xl font-bold text-gray-900 border-b-2 border-primary outline-none bg-transparent text-center w-full max-w-[200px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateName();
                        if (e.key === 'Escape') setIsEditing(false);
                      }}
                    />
                    <button 
                      onClick={handleUpdateName}
                      disabled={isUpdating}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                    <button 
                      onClick={startEditing}
                      className="p-1 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Edit Name"
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              <div className="inline-flex items-center justify-center bg-gray-100 px-4 py-2 rounded-xl mb-8">
                <span className="text-xs text-gray-500 uppercase font-bold mr-2">ID</span>
                <span className="text-sm text-gray-800 font-mono font-medium tracking-wider">{displayId}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-2xl">
                    💎
                  </div>
                  <span className="text-2xl font-bold text-blue-900">{diamonds}</span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">Diamonds</span>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 text-purple-600">
                    <Trophy size={24} />
                  </div>
                  <span className="text-2xl font-bold text-purple-900">{getOrdinalSuffix(userRank)}</span>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mt-1">Global Rank</span>
                </div>
              </div>

              {/* Actions */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 p-4 rounded-2xl font-bold transition-colors border border-red-100"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
              <Trophy size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          </div>

          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No data available yet.</p>
            ) : (
              leaderboard.map((lbUser, index) => (
                <div 
                  key={lbUser.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border ${
                    lbUser.id === user?.uid 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-800' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index < 3 ? <Medal size={16} /> : index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {lbUser.name} {lbUser.id === user?.uid && <span className="text-xs text-blue-600 ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">{lbUser.displayId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                    <span className="text-lg leading-none">💎</span>
                    <span className="font-bold text-gray-900">{lbUser.diamonds}</span>
                  </div>
                </div>
              ))
            )}
          </div>
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
