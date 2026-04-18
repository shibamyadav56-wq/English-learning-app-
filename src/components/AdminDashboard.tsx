import { ArrowLeft, Settings, Users, Database, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const coll = collection(db, 'users');
        const snapshot = await getCountFromServer(coll);
        setUserCount(snapshot.data().count);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="bg-slate-900 min-h-screen pb-20 text-white">
      <header className="p-6 flex items-center gap-4 bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 text-slate-300 rounded-2xl active:scale-90 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            <Users size={24} className="text-primary mb-3" />
            <p className="text-3xl font-black tabular-nums">{loading ? '...' : userCount}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Users</p>
          </div>
          <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            <Layers size={24} className="text-amber-500 mb-3" />
            <p className="text-3xl font-black tabular-nums">1.0.0</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">App Version</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Management</h3>
          
          <button className="w-full flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition group text-left">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                 <Database size={24} />
               </div>
               <div>
                 <p className="font-black">Manage Vocabulary</p>
                 <p className="text-xs text-slate-500 font-bold">Add or edit word meanings</p>
               </div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl text-slate-500">
               Coming Soon
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition group text-left">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                 <Settings size={24} />
               </div>
               <div>
                 <p className="font-black">System Settings</p>
                 <p className="text-xs text-slate-500 font-bold">Manage global app variables</p>
               </div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl text-slate-500">
               Coming Soon
            </div>
          </button>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[32px]">
           <p className="text-emerald-400 text-sm font-bold leading-relaxed">
             This panel is only visible to <span className="underline italic">shibamyadav56@gmail.com</span>. You can use it to monitor your app's growth once it's on the Play Store.
           </p>
        </div>
      </div>
    </div>
  );
}
