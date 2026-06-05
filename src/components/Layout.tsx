import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Map, User as UserIcon } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function Layout({ diamonds }: { diamonds: number }) {
  const location = useLocation();
  const { isNavVisible } = useNavigation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/grammar', icon: BookOpen, label: 'Grammar' },
    { path: '/learning-path', icon: Map, label: 'Path' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  if (!isNavVisible || location.pathname === '/ai-assistant') {
    return (
      <div className="min-h-[100dvh] md:py-4 bg-slate-100 flex items-center justify-center selection:bg-blue-100">
        <div className="app-container md:rounded-[40px] md:h-[90vh] md:min-h-0 md:max-h-[900px] md:shadow-[0_0_50px_-12px_rgba(0,0,0,0.15)]">
          <main className="flex-grow overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] md:py-4 bg-slate-100 flex items-center justify-center selection:bg-blue-100">
      <div className="app-container md:rounded-[40px] md:h-[90vh] md:min-h-0 md:max-h-[900px] md:shadow-[0_0_50px_-12px_rgba(0,0,0,0.15)] relative">
        <main className="flex-grow overflow-y-auto pb-36">
          <Outlet />
        </main>

        <nav className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 mb-safe md:absolute md:bottom-8 pointer-events-none">
          <div className="w-full max-w-[360px] bg-white/95 backdrop-blur-3xl rounded-3xl p-2 flex justify-between items-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center flex-1 h-14 transition-all duration-300 rounded-2xl ${
                    isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                  }`}
                >
                  <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'mb-0.5' : ''} />
                  <span 
                    className={`text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                      isActive ? 'max-h-4 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
