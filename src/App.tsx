/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, testConnection } from './lib/firebase';
import { motion } from 'motion/react';
import Layout from './components/Layout';
import Home from './components/Home';
import Grammar from './components/Grammar';
import LearningPath from './components/LearningPath';
import Profile from './components/Profile';
import AIAssistant from './components/AIAssistant';
import WordMeaning from './components/WordMeaning';
import VoicePractice from './components/VoicePractice';
import Leaderboard from './components/Leaderboard';
import AuthPage from './components/AuthPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import AdminDashboard from './components/AdminDashboard';
import TermsOfService from './components/TermsOfService';
import { NavigationProvider } from './context/NavigationContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [diamonds, setDiamonds] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDiamonds(data.diamonds || 0);
            
            // Restore other progress from DB to local storage if it exists
            localStorage.setItem('unlockedWords', (data.unlockedWords || 10).toString());
            localStorage.setItem('completedGrammarTopics', JSON.stringify(data.completedGrammarTopics || []));
            localStorage.setItem('unlockedAvatars', JSON.stringify(data.unlockedAvatars || ['cyber_ninja']));
            localStorage.setItem('usageTime', (data.usageTime || 0).toString());
            localStorage.setItem('lastClaimed', (data.lastClaimed || 0).toString());
            localStorage.setItem('currentDay', (data.currentDay || 1).toString());
            
            // Dispatch storage event so other components update
            try {
              window.dispatchEvent(new Event('storage'));
            } catch (e) {
              const event = document.createEvent('Event');
              event.initEvent('storage', true, true);
              window.dispatchEvent(event);
            }
          } else {
            // New user, init with default values but sync to DB
            setDiamonds(0);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setIsAdmin(currentUser.email === 'shibamyadav56@gmail.com');
        setDataLoaded(true);
      } else {
        setDiamonds(0); // Reset on logout
        setDataLoaded(false);
        setIsAdmin(false);
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('diamonds', diamonds.toString());
    
    // Sync diamonds and all progress to Firestore
    if (user && dataLoaded) {
      const dataToSave = {
        diamonds: diamonds,
        unlockedWords: parseInt(localStorage.getItem('unlockedWords') || '10', 10),
        completedGrammarTopics: (() => {
          const item = localStorage.getItem('completedGrammarTopics');
          if (!item) return [];
          try {
            return JSON.parse(item);
          } catch {
            return [];
          }
        })(),
        unlockedAvatars: (() => {
          const item = localStorage.getItem('unlockedAvatars');
          if (!item) return ['cyber_ninja'];
          try {
            return JSON.parse(item);
          } catch {
            return ['cyber_ninja'];
          }
        })(),
        usageTime: parseInt(localStorage.getItem('usageTime') || '0', 10),
        lastClaimed: parseInt(localStorage.getItem('lastClaimed') || '0', 10),
        currentDay: parseInt(localStorage.getItem('currentDay') || '1', 10),
      };
      setDoc(doc(db, 'users', user.uid), dataToSave, { merge: true }).catch(err => console.error("Error saving to DB:", err));
    }
  }, [diamonds, user, dataLoaded]);

  // Global timer to track app usage time
  useEffect(() => {
    testConnection();
    const timer = setInterval(() => {
      const current = parseInt(localStorage.getItem('usageTime') || '0', 10);
      localStorage.setItem('usageTime', (current + 1).toString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 overflow-hidden relative">
        {/* Background ambient glow effect */}
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4" />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-[140px] mb-8 z-10"
        >
           <motion.div
              animate={{ 
                boxShadow: ['0px 0px 0px 0px rgba(59, 130, 246, 0)', '0px 0px 50px 15px rgba(59, 130, 246, 0.4)', '0px 0px 0px 0px rgba(59, 130, 246, 0)']
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-[35px]"
           >
             <img src="/icon.png" alt="LinguaMaster Logo" className="w-full h-auto drop-shadow-2xl rounded-[35px] border border-blue-500/20" />
           </motion.div>
        </motion.div>
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.6 }}
           className="flex flex-col items-center z-10"
        >
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-3">LinguaMaster<span className="text-blue-500 font-bold">.AI</span></h1>
          <div className="flex gap-1.5">
             {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
             ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <NavigationProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Layout diamonds={diamonds} /> : <Navigate to="/auth" />}>
            <Route index element={<Home diamonds={diamonds} setDiamonds={setDiamonds} />} />
            <Route path="grammar" element={<Grammar diamonds={diamonds} setDiamonds={setDiamonds} />} />
            <Route path="learning-path" element={<LearningPath diamonds={diamonds} setDiamonds={setDiamonds} />} />
            <Route path="profile" element={<Profile diamonds={diamonds} setDiamonds={setDiamonds} isAdmin={isAdmin} />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="word-meaning" element={<WordMeaning setDiamonds={setDiamonds} />} />
            <Route path="voice-practice" element={<VoicePractice setDiamonds={setDiamonds} />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </NavigationProvider>
  );
}

