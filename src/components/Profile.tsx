import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where, getCountFromServer, updateDoc, increment } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon, Trophy, Medal, Pencil, Check, X, ChevronRight, ShieldCheck, FileText, Settings, Sparkles, Upload, ArrowLeft } from 'lucide-react';
import Notification from './Notification';
import { motion, AnimatePresence } from 'motion/react';

// Cool gamified avatars inspired by Subway Surfers and Free Fire art styles
import avatarCyberNinja from '../assets/images/cyber_ninja_1780547309392.png';
import avatarNeonSkater from '../assets/images/neon_skater_1780547328033.png';
import avatarDiamondKing from '../assets/images/diamond_king_new_1780555041820.png';
import avatarHackerKid from '../assets/images/hacker_kid_1780547359191.png';
import avatarGalaxyBoy from '../assets/images/galaxy_boy_1780547375965.png';
import avatarRoboWarrior from '../assets/images/robo_warrior_1780547394120.png';
import avatarGoldenGamer from '../assets/images/golden_gamer_1780547409144.png';
import avatarShadowKnight from '../assets/images/shadow_knight_new_1780555060997.png';
import avatarGraffitiArtist from '../assets/images/graffiti_artist_1780547437506.png';
import avatarTimeTraveler from '../assets/images/time_traveler_1780547454675.png';
import avatarModernDayGirl from '../assets/images/modern_day_girl_1780646150306.png';
import avatarShrineMaiden from '../assets/images/shrine_maiden_1780646169917.png';
import avatarMartialArt from '../assets/images/martial_art_1780646186505.png';
import avatarNeonDrummer from '../assets/images/neon_drummer_1780646200626.png';

const GAME_AVATARS = [
  { id: 'cyber_ninja', name: 'Cyber Ninja', tag: 'Neon Green', url: avatarCyberNinja, accent: 'from-green-500 to-emerald-700 bg-emerald-500/10 text-green-500 border-green-500/30', price: 0 },
  { id: 'neon_skater', name: 'Neon Skater', tag: 'Street Cap', url: avatarNeonSkater, accent: 'from-pink-500 to-purple-700 bg-pink-500/10 text-pink-500 border-pink-500/30', price: 300 },
  { id: 'shadow_knight', name: 'Shadow Knight', tag: 'Blue Aura', url: avatarShadowKnight, accent: 'from-slate-700 to-indigo-950 bg-slate-500/10 text-slate-400 border-slate-500/30', price: 500 },
  { id: 'hacker_kid', name: 'Hacker Kid', tag: 'VR Glasses', url: avatarHackerKid, accent: 'from-purple-500 to-indigo-700 bg-purple-500/10 text-purple-500 border-purple-500/30', price: 700 },
  { id: 'galaxy_boy', name: 'Galaxy Boy', tag: 'Cosmic Star', url: avatarGalaxyBoy, accent: 'from-indigo-600 to-deep-purple bg-indigo-500/10 text-indigo-500 border-indigo-500/30', price: 1000 },
  { id: 'robo_warrior', name: 'Robo Warrior', tag: 'Bionic Eye', url: avatarRoboWarrior, accent: 'from-sky-500 to-indigo-600 bg-sky-500/10 text-sky-500 border-sky-500/30', price: 1250 },
  { id: 'modern_day_girl', name: 'Modern Girl', tag: 'City Life', url: avatarModernDayGirl, accent: 'from-pink-500 to-rose-600 bg-pink-500/10 text-pink-500 border-pink-500/30', price: 1400 },
  { id: 'golden_gamer', name: 'Golden Gamer', tag: 'Gold Audio', url: avatarGoldenGamer, accent: 'from-amber-400 to-yellow-600 bg-amber-500/10 text-amber-500 border-amber-500/30', price: 1500 },
  { id: 'graffiti_artist', name: 'Graffiti Pro', tag: 'Skull Mask', url: avatarGraffitiArtist, accent: 'from-rose-500 to-red-700 bg-rose-500/10 text-rose-500 border-rose-500/30', price: 1700 },
  { id: 'time_traveler', name: 'Time Traveler', tag: 'Holo Goggles', url: avatarTimeTraveler, accent: 'from-teal-400 to-indigo-800 bg-teal-500/10 text-teal-500 border-teal-500/30', price: 1850 },
  { id: 'shrine_maiden', name: 'Shrine Maiden', tag: 'Miko', url: avatarShrineMaiden, accent: 'from-red-500 to-rose-700 bg-red-500/10 text-red-500 border-red-500/30', price: 2000 },
  { id: 'martial_art', name: 'Martial Artist', tag: 'Black Belt', url: avatarMartialArt, accent: 'from-orange-500 to-red-600 bg-orange-500/10 text-orange-500 border-orange-500/30', price: 2500 },
  { id: 'neon_drummer', name: 'Neon Drummer', tag: 'Cyber Beat', url: avatarNeonDrummer, accent: 'from-cyan-400 to-blue-600 bg-cyan-500/10 text-cyan-500 border-cyan-500/30', price: 3000 },
  { id: 'diamond_king', name: 'Diamond King', tag: 'Onyx Mask', url: avatarDiamondKing, accent: 'from-cyan-400 to-blue-600 bg-cyan-500/10 text-cyan-500 border-cyan-500/30', price: 5000 },
];

interface ProfileProps {
  diamonds: number;
  setDiamonds: (d: number | ((prev: number) => number)) => void;
  isAdmin: boolean;
}

interface LeaderboardUser {
  id: string;
  name: string;
  diamonds: number;
  displayId: string;
  photoURL?: string | null;
}

export default function Profile({ diamonds, setDiamonds, isAdmin }: ProfileProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAdSimulating, setIsAdSimulating] = useState(false);

  const handleWatchAd = async () => {
    // 1. Try Native Android Bridge first
    if (typeof (window as any).Android !== 'undefined' && (window as any).Android.showRewardedAd) {
      // Set up global callback if not already set
      if (!(window as any).onRewardedAdSuccess) {
        (window as any).onRewardedAdSuccess = async () => {
          setDiamonds((prev: number) => prev + 2);
          if (auth.currentUser) {
            try {
              const userRef = doc(db, 'users', auth.currentUser.uid);
              await updateDoc(userRef, { diamonds: increment(2) });
            } catch (e) {
              console.error('Error updating DB', e);
            }
          }
          setNotification({
            isOpen: true,
            message: 'You watched the ad and earned +2 Diamonds!',
            type: 'success',
            title: 'Reward Granted! 💎'
          });
        };
      }
      (window as any).Android.showRewardedAd();
      return;
    }

    // 2. Web Fallback (Simulated Ad for Web Preview)
    setNotification({
      isOpen: true,
      message: 'Running in Web Preview: Native AdMob ads only display on mobile devices. Simulating a 4-second video ad...',
      type: 'info',
      title: 'Web Simulation'
    });
    
    setIsAdSimulating(true);
    setTimeout(async () => {
      setIsAdSimulating(false);
      setDiamonds((prev: number) => prev + 2);
      if (auth.currentUser) {
         try {
           const userRef = doc(db, 'users', auth.currentUser.uid);
           await updateDoc(userRef, { diamonds: increment(2) });
         } catch (e) {
           console.error('Error updating DB', e);
         }
      }
      setNotification({
        isOpen: true,
        message: 'You finished the simulated web ad and earned +2 Diamonds!',
        type: 'success',
        title: 'Reward Granted! 💎'
      });
    }, 4000); // Simulate 4s ad
  };

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlockedAvatars');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['cyber_ninja'];
      }
    }
    return ['cyber_ninja'];
  });
  const [avatarToBuy, setAvatarToBuy] = useState<any | null>(null);

  const handleSelectPredefinedAvatar = async (avatarUrl: string, avatarName: string) => {
    if (!user || isUpdating) return;
    
    setIsUpdating(true);
    try {
      setPhotoURL(avatarUrl);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: avatarUrl
      });

      const { updateProfile } = await import('firebase/auth');
      await updateProfile(user, {
        photoURL: avatarUrl
      });

      setNotification({
        isOpen: true,
        message: `${avatarName} profile avatar set successfully! ✨`,
        type: 'success',
        title: 'Avatar Updated'
      });
      setIsAvatarModalOpen(false);
    } catch (error) {
      console.error("Error setting game avatar:", error);
      setNotification({
        isOpen: true,
        message: 'Failed to update avatar. Please try again.',
        type: 'error',
        title: 'Error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const buyAvatar = async (avatar: any) => {
    if (!user || isUpdating) return;
    if (diamonds < avatar.price) {
      setNotification({
        isOpen: true,
        message: `You need ${avatar.price - diamonds} more 💎 to unlock this character!`,
        type: 'error',
        title: 'Not Enough Diamonds!'
      });
      setAvatarToBuy(null);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUnlocked = [...unlockedAvatars, avatar.id];

      // Update in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        diamonds: diamonds - avatar.price,
        unlockedAvatars: updatedUnlocked,
        photoURL: avatar.url
      });

      // Update in Firebase Auth
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(user, {
        photoURL: avatar.url
      });

      // Update local React states
      setDiamonds(prev => prev - avatar.price);
      setUnlockedAvatars(updatedUnlocked);
      localStorage.setItem('unlockedAvatars', JSON.stringify(updatedUnlocked));
      setPhotoURL(avatar.url);

      setNotification({
        isOpen: true,
        message: `Congratulations! You have unlocked ${avatar.name} character for 💎 ${avatar.price}! 🎉`,
        type: 'success',
        title: 'Unlock Successful!'
      });

      setIsAvatarModalOpen(false);
      setAvatarToBuy(null);
    } catch (error) {
      console.error("Error purchasing character:", error);
      setNotification({
        isOpen: true,
        message: 'An error occurred during purchase. Please try again.',
        type: 'error',
        title: 'Error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
            const data = docSnap.data();
            setName(data.name || user.displayName || 'User');
            setPhotoURL(data.photoURL || user.photoURL || null);
            if (data.unlockedAvatars && Array.isArray(data.unlockedAvatars)) {
              setUnlockedAvatars(data.unlockedAvatars);
              localStorage.setItem('unlockedAvatars', JSON.stringify(data.unlockedAvatars));
            }
          } else {
            setName(user.displayName || 'User');
            setPhotoURL(user.photoURL || null);
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
            displayId: get12DigitId(doc.id),
            photoURL: data.photoURL || null
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

  const compressImage = (file: File, maxWidth: number = 150, maxHeight: number = 150): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const width = img.width;
          const height = img.height;

          // Crop to square
          const size = Math.min(width, height);
          canvas.width = maxWidth;
          canvas.height = maxHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          const sourceX = (width - size) / 2;
          const sourceY = (height - size) / 2;

          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            size,
            size, // source square coordinates
            0,
            0,
            maxWidth,
            maxHeight // target scaled square
          );

          // Convert to JPEG with 0.8 quality for superb performance and small payload (~10KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check size limit (allow up to 5MB file on selection, it will be compressed down on client)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        isOpen: true,
        message: 'Image size must be less than 5MB.',
        type: 'error',
        title: 'File Too Large'
      });
      return;
    }

    setIsUpdating(true);

    try {
      // 1. Compress image to neat light-weight 150x150 JPEG
      const compressedBase64 = await compressImage(file, 150, 150);
      
      // Instant Local Preview
      setPhotoURL(compressedBase64);

      // 2. Real Database Persistence: Save light base64 string to Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: compressedBase64
      });

      // 3. Prevent setting base64 in Firebase Auth profile (leads to 'Photo URL too long' error)
      // We rely on Firestore 'users' collection photoURL for custom uploaded pictures.

      /* 
      ========================================================================
      MOCK/PRODUCTION FIREBASE STORAGE SET-UP DIRECTIVE:
      If you prefer uploading to Firebase Storage rather than base64 strings:
      
      1. Import Storage configuration in your `/src/lib/firebase.ts` file:
         import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
         export const storage = getStorage(app);
      
      2. Replace the local base64 update code here with:
         const storageRef = ref(storage, `users/${user.uid}/avatar.png`);
         await uploadBytes(storageRef, file);
         const downloadURL = await getDownloadURL(storageRef);
         
         await updateDoc(userRef, { photoURL: downloadURL });
         await updateProfile(user, { photoURL: downloadURL });
      ========================================================================
      */

      setNotification({
        isOpen: true,
        message: 'Profile picture updated! ✨',
        type: 'success',
        title: 'Success'
      });
    } catch (error) {
      console.error("Error updating image in Firestore:", error);
      setNotification({
        isOpen: true,
        message: 'Failed to save profile picture. Please try again.',
        type: 'error',
        title: 'Error'
      });
    } finally {
      setIsUpdating(false);
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
        message: 'Failed to update name. Please try again.',
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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              aria-label="Go back to Home"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Profile</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 bg-red-100/50 text-red-600 rounded-2xl hover:bg-red-100 transition active:scale-90"
          >
            <LogOut size={24} />
          </button>
        </header>

        {/* Profile Card */}
        <div className="mx-6 bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative mb-8 group">
          <div className="h-32 bg-gradient-to-br from-indigo-500 via-primary to-purple-600 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]" />
          </div>
          
          <div className="px-6 pb-10 relative">
            {/* Centered Circular Avatar Container */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 select-none z-20">
              <button 
                type="button"
                id="user-avatar-container" 
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative w-32 h-32 bg-white rounded-full p-1 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group/avatar cursor-pointer block outline-none focus:ring-4 focus:ring-indigo-100"
              >
                {/* Circular image or first-letter fallback */}
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 via-primary to-purple-600 flex items-center justify-center relative shadow-inner border border-slate-100">
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-5xl font-black text-white font-sans tracking-tight">
                      {firstLetter}
                    </span>
                  )}

                  {/* Loading/Updating Overlay Spinner */}
                  {isUpdating && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center rounded-full">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Edit Button overlay positioning - Neat bottom right of avatar */}
                <div 
                  id="avatar-edit-label"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAvatarModalOpen(true);
                  }}
                  className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer flex items-center justify-center hover:rotate-6"
                  title="Profile Picture Badlein"
                >
                  <Pencil size={15} strokeWidth={3} className="text-white" />
                </div>

                {/* Hidden File Picker Input */}
                <input 
                  type="file" 
                  id="profile-avatar-upload" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </button>
            </div>

            <div className="pt-20 text-center">
              <div className="flex items-center justify-center gap-2 mb-1 group/name">
                {isEditing ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-1 px-3 rounded-2xl border-2 border-slate-200">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xl font-bold bg-transparent outline-none w-40 text-center text-slate-800"
                      autoFocus
                    />
                    <button 
                      onClick={handleUpdateName} 
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Bachayein"
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Cancel"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">{name}</h2>
                    <button 
                      onClick={startEditing} 
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition md:opacity-0 group-hover/name:opacity-100 flex items-center justify-center"
                      title="Naam Badlein"
                    >
                      <Pencil size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-400 mb-5">{user.email}</p>
              
              <div className="flex items-center justify-center gap-1.5 p-1.5 px-3.5 bg-slate-100 rounded-2xl mb-8 w-fit mx-auto border border-slate-200/50">
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Player ID</span>
                <span className="text-xs font-mono font-black text-slate-600">{displayId}</span>
              </div>

              {/* Gamified Duolingo-inspired Stats Section */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                
                {/* Diamonds Card */}
                <div id="stats-diamonds-card" className="bg-white border-2 border-b-4 border-orange-200 hover:border-orange-300 rounded-[28px] p-5 flex flex-col items-center transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:border-b-2 cursor-default group/stat">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center shadow-md shadow-orange-100 border border-orange-100 mb-3 transition-transform duration-300 group-hover/stat:scale-110">
                    <span className="text-3xl filter drop-shadow">💎</span>
                  </div>
                  <span className="text-3xl font-black text-orange-950 tracking-tight leading-none">
                    {diamonds}
                  </span>
                  <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mt-2 select-none">
                    Total Diamonds
                  </span>
                </div>

                {/* Leaderboard Rank Card */}
                <div id="stats-leaderboard-card" className="bg-white border-2 border-b-4 border-yellow-200 hover:border-yellow-300 rounded-[28px] p-5 flex flex-col items-center transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:border-b-2 cursor-default group/stat">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl flex items-center justify-center shadow-md shadow-yellow-100 border border-yellow-100 mb-3 transition-transform duration-300 group-hover/stat:scale-110 text-yellow-600">
                    <Trophy size={32} strokeWidth={2.5} className="text-yellow-500 fill-yellow-200" />
                  </div>
                  <span className="text-3xl font-black text-yellow-950 tracking-tight leading-none">
                    {getOrdinalSuffix(userRank)}
                  </span>
                  <span className="text-[10px] font-extrabold text-yellow-500 uppercase tracking-widest mt-2 select-none">
                    Leaderboard Rank
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Watch Ad Bonus */}
        <div className="mx-6 mb-8">
          <button 
            onClick={handleWatchAd}
            disabled={isAdSimulating}
            className={`w-full ${isAdSimulating ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900 active:scale-95 hover:bg-slate-800'} text-white p-6 rounded-[32px] flex items-center justify-between shadow-xl shadow-slate-900/20 transition overflow-hidden relative`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10 pointer-events-none">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <span className="text-3xl">{isAdSimulating ? '⏳' : '📺'}</span>
              </div>
              <div className="text-left">
                <p className="font-black text-lg">{isAdSimulating ? 'Loading Ad...' : 'Watch & Earn'}</p>
                <p className="text-xs text-slate-400">Instant +2 Diamonds bonus</p>
              </div>
            </div>
            <div className={`text-white p-3 rounded-2xl shadow-lg relative z-10 ${isAdSimulating ? 'bg-slate-600' : 'bg-primary'}`}>
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
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black flex-shrink-0 ${
                      index === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30' :
                      index === 1 ? 'bg-slate-300 text-white shadow-lg shadow-slate-300/30' :
                      index === 2 ? 'bg-orange-400 text-white shadow-lg shadow-orange-400/30' :
                      'text-slate-400'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Circular custom gamified avatar picture container */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                      {lbUser.photoURL ? (
                        <img 
                          src={lbUser.photoURL} 
                          alt={lbUser.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                          {lbUser.name.substring(0, 1).toUpperCase()}
                        </div>
                      )}
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

      {/* Gamified Cool Avatar Selection Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute inset-0 bg-slate-950 backdrop-blur-md cursor-pointer"
            />
            
            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white/95 border-2 border-slate-200/60 rounded-[35px] shadow-2xl overflow-hidden max-w-lg w-full z-10 flex flex-col relative max-h-[85vh] select-none"
            >
              {/* Top Stylized Game Title Frame closer to Subway Surfer/Free Fire vibrant vibe */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 via-primary to-purple-700 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl z-0" />
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/45 text-white/90 hover:text-white rounded-full transition active:scale-90 z-20"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
                
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2.5 bg-white/15 rounded-2xl">
                    <Sparkles size={24} className="text-yellow-300 fill-yellow-200 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xl tracking-tight leading-none uppercase">Select Cool Avatar</h3>
                    <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mt-1.5 font-mono">
                      Gamified Character Bundles & Heroes
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Avatars Area */}
              <div className="p-6 overflow-y-auto space-y-4 max-h-[50vh] bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4 pb-2">
                  {GAME_AVATARS.map((avatar) => {
                    const isSelected = photoURL === avatar.url;
                    const isUnlocked = avatar.price === 0 || unlockedAvatars.includes(avatar.id);
                    return (
                      <button
                        type="button"
                        key={avatar.id}
                        onClick={() => {
                          if (isUnlocked) {
                            handleSelectPredefinedAvatar(avatar.url, avatar.name);
                          } else {
                            setAvatarToBuy(avatar);
                          }
                        }}
                        className={`flex flex-col items-center gap-2 p-3.5 bg-white rounded-3xl border-2 transition-all duration-300 relative group/card cursor-pointer hover:-translate-y-1 active:translate-y-0 outline-none ${
                          isSelected 
                            ? 'border-indigo-600 shadow-indigo-100 ring-4 ring-indigo-50/70' 
                            : 'border-slate-100 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100'
                        }`}
                      >
                        {/* Circle Avatar inside card */}
                        <div className="relative w-18 h-18 rounded-full p-0.5 bg-slate-100 transition-transform duration-300 group-hover/card:scale-110">
                          <div className="w-full h-full rounded-full overflow-hidden border border-slate-200/50 relative">
                            <img 
                              src={avatar.url} 
                              alt={avatar.name} 
                              className={`w-full h-full object-cover rounded-full ${!isUnlocked ? 'opacity-40 grayscale-[30%]' : ''}`}
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center rounded-full">
                                <span className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-0.5 border border-white">
                                  <Check size={8} strokeWidth={4} />
                                </span>
                              </div>
                            )}
                            {!isUnlocked && (
                              <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center rounded-full">
                                <span className="text-xs">🔒</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-center w-full">
                          <span className="block text-xs font-black text-slate-800 tracking-tight leading-tight group-hover/card:text-indigo-600 transition-colors">
                            {avatar.name}
                          </span>
                          {isUnlocked ? (
                            <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border mt-1 select-none ${avatar.accent}`}>
                              {isSelected ? 'Equipped' : 'Unlocked'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                              💎 {avatar.price}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Standard Image File Uploader option */}
              <div className="p-6 border-t border-slate-100 bg-white flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('profile-avatar-upload')?.click();
                  }}
                  className="w-full py-4 px-5 bg-slate-900 border-2 border-slate-850 text-white rounded-2xl hover:bg-slate-800 font-extrabold text-xs flex items-center justify-center gap-2.5 transition active:scale-95 shadow-md shadow-slate-900/10"
                >
                  <Upload size={16} strokeWidth={3} className="text-slate-300" />
                  <span>Choose Custom Device Photo</span>
                </button>
                <p className="text-[10px] text-slate-400 font-bold mt-2.5 text-center leading-normal">
                  You can upload standard JPEG, JPG or PNG images any time!
                </p>
              </div>

              {/* Transaction confirmation sub-modal inside game avatar picker */}
              <AnimatePresence>
                {avatarToBuy && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 25 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 25 }}
                      className="bg-white rounded-[32px] p-6 max-w-sm w-full border-2 border-slate-100 shadow-2xl flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100 shadow-xl mb-4 relative p-1 bg-white">
                        <img 
                          src={avatarToBuy.url} 
                          alt={avatarToBuy.name} 
                          className="w-full h-full object-cover rounded-full" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <h4 className="text-lg font-black text-slate-850 tracking-tight mb-1">
                        Unlock {avatarToBuy.name}?
                      </h4>
                      <p className="text-[11px] text-slate-400 font-bold mb-5 leading-relaxed">
                        Do you want to unlock this character for {avatarToBuy.price} diamonds?
                      </p>

                      <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 p-2 px-4 rounded-xl mb-6">
                        <span className="text-base">💎</span>
                        <span className="font-mono text-xs font-black text-orange-950">
                          {avatarToBuy.price} Diamonds Cost
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                          type="button"
                          onClick={() => setAvatarToBuy(null)}
                          className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs transition border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => buyAvatar(avatarToBuy)}
                          className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-indigo-650/20 animate-pulse"
                        >
                          Yes, Unlock!
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
