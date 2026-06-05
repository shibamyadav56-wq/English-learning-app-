import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Notification from './Notification';
import { LogIn, Sparkles } from 'lucide-react';

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
          message: 'Incorrect email or password.',
          type: 'error',
          title: 'Login Error'
        });
      } else if (error.code === 'auth/email-already-in-use') {
        setNotification({
          isOpen: true,
          message: 'This email is already registered. Please log in instead.',
          type: 'error',
          title: 'Sign Up Error'
        });
      } else {
        setNotification({
          isOpen: true,
          message: error instanceof Error ? error.message : 'An error occurred during authentication.',
          type: 'error',
          title: 'Error'
        });
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const displayId = get12DigitId(user.uid);
        await setDoc(userRef, {
          name: user.displayName || 'Learner',
          email: user.email || '',
          diamonds: 0,
          displayId,
          createdAt: new Date()
        }, { merge: true });
      }
      
      localStorage.clear(); // Clear old user data
      window.location.href = '/'; // Force full reload to reset all states
    } catch (error: any) {
      console.error('Google Auth error:', error);
      if (error.code === 'auth/popup-blocked') {
        setNotification({
          isOpen: true,
          message: 'The Google login popup was blocked by your browser. Please allow popups for this site or open it in a new window/tab to login.',
          type: 'error',
          title: 'Popup Blocked'
        });
      } else {
        setNotification({
          isOpen: true,
          message: error instanceof Error ? error.message : 'An error occurred during Google authentication.',
          type: 'error',
          title: 'Google Sign In Error'
        });
      }
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-warm-bg p-4 font-sans">
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

        <div className="relative my-6 select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-400 font-bold uppercase tracking-wider">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border-2 border-gray-200 text-gray-700 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition mb-6 active:scale-95 duration-150 shadow-sm"
        >
          <div className="flex items-center justify-center bg-gray-50 w-7 h-7 rounded-lg font-display text-xs font-black text-blue-600 select-none border border-gray-150 shadow-inner">
            G
          </div>
          <span>Sign In with Google</span>
        </button>

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
