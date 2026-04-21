import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Notification from './Notification';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  // Generate a deterministic 12-digit numeric ID from the Firebase UID
  const get12DigitId = (uid: string) => {
    const numericString = uid.split('').map(c => c.charCodeAt(0)).join('');
    const twelveDigits = numericString.substring(0, 12).padEnd(12, '0');
    return twelveDigits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayId = get12DigitId(userCredential.user.uid);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          diamonds: 0,
          displayId,
          createdAt: new Date()
        }, { merge: true });
      }
      localStorage.clear(); // Clear old user data
      window.location.href = '/'; // Force full reload to reset all states
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/invalid-credential') {
        setNotification({
          isOpen: true,
          message: 'Ghalat email ya password.',
          type: 'error',
          title: 'Login Error'
        });
      } else if (error.code === 'auth/email-already-in-use') {
        setNotification({
          isOpen: true,
          message: 'Yeh email pehle se registered hai. Kripya login karein.',
          type: 'error',
          title: 'Sign Up Error'
        });
      } else {
        setNotification({
          isOpen: true,
          message: error instanceof Error ? error.message : 'Authentication mein dikkat aayi hai.',
          type: 'error',
          title: 'Error'
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center font-display text-gray-900">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:border-primary"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email ID</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:border-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:border-primary"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white p-4 rounded-2xl font-bold mb-4 hover:bg-blue-700 transition">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center cursor-pointer text-primary font-medium" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </p>
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
