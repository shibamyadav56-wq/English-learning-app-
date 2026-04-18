import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Map, User } from 'lucide-react';

export default function Layout({ diamonds }: { diamonds: number }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/grammar', icon: BookOpen, label: 'Grammar' },
    { path: '/learning-path', icon: Map, label: 'Path' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-blue-100">
      <div className="app-container">
        <header className="sticky top-0 z-[60] glass-effect flex justify-between items-center p-4 border-b border-gray-100 px-6">
          <h1 className="font-display text-xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Smart Learner
          </h1>
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full font-black shadow-sm border border-slate-100 active:scale-95 transition">
            <span className="text-lg leading-none">💎</span>
            <span className="text-sm text-slate-800">{diamonds}</span>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto pb-32">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[40px] px-2 py-2 flex justify-between items-center border border-white nav-shadow">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center h-14 w-full transition-all duration-300 ${
                    isActive ? 'text-primary' : 'text-slate-400'
                  }`}
                >
                  <div className={`relative z-10 p-2 rounded-2xl transition-all duration-500 ${isActive ? '' : ''}`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75 h-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-1 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
