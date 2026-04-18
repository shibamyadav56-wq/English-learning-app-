/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Layout from './components/Layout';
import Home from './components/Home';
import Grammar from './components/Grammar';
import LearningPath from './components/LearningPath';
import Profile from './components/Profile';
import AIAssistant from './components/AIAssistant';
import WordMeaning from './components/WordMeaning';
import Leaderboard from './components/Leaderboard';
import AuthPage from './components/AuthPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import AdminDashboard from './components/AdminDashboard';
import TermsOfService from './components/TermsOfService';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [diamonds, setDiamonds] = useState(() => {
    const savedDiamonds = localStorage.getItem('diamonds');
    return savedDiamonds ? parseInt(savedDiamonds, 10) : 0;
  });

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
            if (data.unlockedWords !== undefined) localStorage.setItem('unlockedWords', data.unlockedWords.toString());
            if (data.completedGrammarTopics !== undefined) localStorage.setItem('completedGrammarTopics', JSON.stringify(data.completedGrammarTopics));
            if (data.usageTime !== undefined) localStorage.setItem('usageTime', data.usageTime.toString());
            if (data.lastClaimed !== undefined) localStorage.setItem('lastClaimed', data.lastClaimed.toString());
            if (data.currentDay !== undefined) localStorage.setItem('currentDay', data.currentDay.toString());
            
            // Dispatch storage event so other components update
            try {
              window.dispatchEvent(new Event('storage'));
            } catch (e) {
              const event = document.createEvent('Event');
              event.initEvent('storage', true, true);
              window.dispatchEvent(event);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setIsAdmin(currentUser.email === 'shibamyadav56@gmail.com');
        setDataLoaded(true);
      } else {
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
        completedGrammarTopics: JSON.parse(localStorage.getItem('completedGrammarTopics') || '[]'),
        usageTime: parseInt(localStorage.getItem('usageTime') || '0', 10),
        lastClaimed: parseInt(localStorage.getItem('lastClaimed') || '0', 10),
        currentDay: parseInt(localStorage.getItem('currentDay') || '1', 10),
      };
      setDoc(doc(db, 'users', user.uid), dataToSave, { merge: true }).catch(err => console.error("Error saving to DB:", err));
    }
  }, [diamonds, user, dataLoaded]);

  // Global timer to track app usage time
  useEffect(() => {
    const timer = setInterval(() => {
      const current = parseInt(localStorage.getItem('usageTime') || '0', 10);
      localStorage.setItem('usageTime', (current + 1).toString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
        </div>
        <p className="mt-4 font-black text-slate-400 tracking-widest text-xs animate-pulse uppercase">LinguaMaster AI</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Layout diamonds={diamonds} /> : <Navigate to="/auth" />}>
          <Route index element={<Home diamonds={diamonds} setDiamonds={setDiamonds} />} />
          <Route path="grammar" element={<Grammar diamonds={diamonds} setDiamonds={setDiamonds} />} />
          <Route path="learning-path" element={<LearningPath setDiamonds={setDiamonds} />} />
          <Route path="profile" element={<Profile diamonds={diamonds} isAdmin={isAdmin} />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="word-meaning" element={<WordMeaning setDiamonds={setDiamonds} />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

