import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where, getCountFromServer, updateDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon, Trophy, Medal, Pencil, Check, X, ChevronRight, ShieldCheck, FileText, Settings } from 'lucide-react';
import Notification from './Notification';

interface ProfileProps {
  diamonds: number;
  isAdmin: boolean;
}

interface LeaderboardUser {
  id: string;
  name: string;
  diamonds: number;
  displayId: string;
}

export default function Profile({ diamonds, isAdmin }: ProfileProps) {
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
    <div className="bg-slate-50 min-h-screen pb-40">
      <div className="max-w-md mx-auto">
        <header className="pt-10 px-6 mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Profile</h1>
          <button 
            onClick={handleLogout}
            className="p-3 bg-red-100/50 text-red-600 rounded-2xl hover:bg-red-100 transition active:scale-90"
          >
            <LogOut size={24} />
          </button>
        </header>

        {/* Profile Card */}
        <div className="mx-6 bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative mb-8 group">
          <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]" />
          </div>
          
          <div className="px-6 pb-10 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 bg-white rounded-3xl shadow-xl p-2 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-inner">
                  <span className="text-5xl font-black text-white">{firstLetter}</span>
                </div>
              </div>
            </div>

            <div className="pt-20 text-center">
              <div className="flex items-center justify-center gap-2 mb-1 group/name">
                {isEditing ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-1 px-3 rounded-2xl border border-slate-200">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xl font-bold bg-transparent outline-none w-40 text-center"
                      autoFocus
                    />
                    <button onClick={handleUpdateName} className="p-2 text-green-600"><Check size={20}/></button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-slate-900">{name}</h2>
                    <button onClick={startEditing} className="p-2 text-slate-300 hover:text-primary transition opacity-0 group-hover/name:opacity-100">
                      <Pencil size={18} />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm font-medium text-slate-400 mb-6">{user.email}</p>
              
              <div className="flex items-center justify-center gap-1.5 p-2 px-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8 w-fit mx-auto">
                <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">Player ID</span>
                <span className="text-xs font-mono font-bold text-slate-600">{displayId}</span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3">
                    <span className="text-2xl">💎</span>
                  </div>
                  <span className="text-2xl font-black text-blue-900">{diamonds}</span>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Diamonds</span>
                </div>
                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex flex-col items-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 text-amber-500">
                    <Trophy size={28} strokeWidth={2.5} />
                  </div>
                  <span className="text-2xl font-black text-amber-900">{getOrdinalSuffix(userRank)}</span>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">Global Rank</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watch Ad Bonus */}
        <div className="mx-6 mb-8">
          <button 
            onClick={() => setNotification({
              isOpen: true,
              message: 'AdMob integration jald hi aa raha hai!',
              type: 'info',
              title: 'Coming Soon'
            })}
            className="w-full bg-slate-900 text-white p-6 rounded-[32px] flex items-center justify-between shadow-xl shadow-slate-900/20 active:scale-95 transition overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📺</span>
              </div>
              <div className="text-left">
                <p className="font-black text-lg">Watch & Earn</p>
                <p className="text-xs text-slate-400">Instant +2 Diamonds bonus</p>
              </div>
            </div>
            <div className="bg-primary text-white p-3 rounded-2xl shadow-lg relative z-10">
              <ChevronRight size={24} strokeWidth={3} />
            </div>
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mx-6 bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <Medal size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Leaderboard</h2>
          </div>

          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <p className="text-center text-slate-300 py-10 font-bold">No data yet...</p>
            ) : (
              leaderboard.map((lbUser, index) => (
                <div 
                  key={lbUser.id} 
                  className={`flex items-center justify-between p-4 rounded-3xl transition-colors ${
                    lbUser.id === user?.uid 
                      ? 'bg-blue-50 ring-2 ring-blue-100' 
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                      index === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30' :
                      index === 1 ? 'bg-slate-300 text-white shadow-lg shadow-slate-300/30' :
                      index === 2 ? 'bg-orange-400 text-white shadow-lg shadow-orange-400/30' :
                      'text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">
                        {lbUser.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tight">{lbUser.displayId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 px-3 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-lg leading-none">💎</span>
                    <span className="font-black text-slate-900">{lbUser.diamonds}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* App Info & Admin */}
        <div className="mx-6 space-y-4 mb-20">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-6">App Info</h3>
          
          <div className="bg-white rounded-[40px] p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Settings size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-slate-700">Admin Dashboard</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </Link>
            )}

            <Link 
              to="/privacy" 
              className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700">Privacy Policy</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </Link>

            <Link 
              to="/terms" 
              className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700">Terms of Service</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </Link>
          </div>
          
          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-4">
            LinguaMaster AI v1.0.0
          </p>
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
