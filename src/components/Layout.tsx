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
    <div className="flex flex-col h-screen bg-warm-bg font-sans">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
        <h1 className="font-display text-xl font-bold text-gray-900">English Learner</h1>
        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full text-accent font-bold">
          <span className="text-lg leading-none">💎</span>
          <span>{diamonds}</span>
        </div>
      </header>
      <div className="flex-grow overflow-y-auto pb-28">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-between items-center bg-gray-100 rounded-3xl p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-2xl transition ${
                  isActive ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-primary'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
