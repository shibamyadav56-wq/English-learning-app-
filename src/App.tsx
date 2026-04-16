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
import AuthPage from './components/AuthPage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
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
            window.dispatchEvent(new Event('storage'));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setDataLoaded(true);
      } else {
        setDataLoaded(false);
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
      <div className="min-h-screen flex items-center justify-center bg-warm-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          <Route path="profile" element={<Profile diamonds={diamonds} />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="word-meaning" element={<WordMeaning setDiamonds={setDiamonds} />} />
        </Route>
      </Routes>
    </Router>
  );
}

