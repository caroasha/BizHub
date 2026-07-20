import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useSidebar } from '../../../hooks/useSidebar';
import { Sun, Moon, Menu, User, Settings, Key, LogOut, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';
import { MODULES } from '../../../utils/constants';

const moduleRoutes = { restaurant: '/resto', pharmacy: '/pharma', apartment: '/apartment', electronics: '/electro', cyber: '/cyber' };

export function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleMode } = useTheme();
  const { toggle } = useSidebar();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const getGreeting = () => { const h = time.getHours(); if (h < 12) return 'Good Morning'; if (h < 17) return 'Good Afternoon'; return 'Good Evening'; };
  const fmtDate = (d) => d.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime = (d) => d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleLogout = () => { setDropdownOpen(false); logout(); navigate('/login'); };
  const handleProfile = () => { setDropdownOpen(false); navigate('/resto/settings'); };
  const handlePassword = () => { setDropdownOpen(false); navigate('/resto/settings?tab=password'); };
  const handleSwitch = (mod) => { setDropdownOpen(false); navigate(moduleRoutes[mod] || '/resto'); };

  const adminName = user?.name || 'Admin';
  const userModules = user?.modules || [];
  const otherModules = userModules.filter(m => m !== 'restaurant');

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600"><Menu size={20} /></button>
        <div><p className="text-xs text-gray-500 dark:text-gray-400">{getGreeting()}, {adminName}</p><p className="text-xs text-gray-400 dark:text-gray-500">{fmtDate(time)} · {fmtTime(time)}</p></div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Avatar name={adminName} size="sm" /><span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{adminName}</span><ChevronDown size={14} className="text-gray-400" />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700"><p className="text-sm font-medium">{adminName}</p><p className="text-xs text-gray-500">{user?.email}</p><span className="text-xs text-primary-600 capitalize">{user?.role}</span></div>
                <button onClick={handleProfile} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><User size={16} /> Profile</button>
                <button onClick={handlePassword} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><Key size={16} /> Password</button>
                {otherModules.length > 0 && <><hr className="border-gray-200 dark:border-gray-700" /><div className="px-4 py-1.5 text-xs text-gray-400">Switch Module</div>{otherModules.map(mod => { const cfg = MODULES.find(m => m.type === mod); return <button key={mod} onClick={() => handleSwitch(mod)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><ArrowLeftRight size={16} /><span>{cfg?.icon} {cfg?.name}</span></button>; })}</>}
                <hr className="border-gray-200 dark:border-gray-700" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"><LogOut size={16} /> Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}