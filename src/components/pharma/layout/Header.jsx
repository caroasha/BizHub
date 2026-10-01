import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useSidebar } from '../../../hooks/useSidebar';
import { Sun, Moon, Menu, User, Settings, Key, LogOut, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';
import { MODULES } from '../../../utils/constants';

const moduleRoutes = {
  restaurant: '/resto', pharmacy: '/pharma', apartment: '/apartment',
  electronics: '/electro', cyber: '/cyber',
};

export function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleMode } = useTheme();
  const { toggle } = useSidebar();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleLogout = () => { setDropdownOpen(false); logout(); navigate('/login'); };
  const handleProfileSettings = () => { setDropdownOpen(false); navigate('/pharma/settings'); };
  const handleChangePassword = () => { setDropdownOpen(false); navigate('/pharma/settings?tab=password'); };
  const handleModuleSwitch = (mod) => { setDropdownOpen(false); navigate(moduleRoutes[mod] || '/resto'); };

  const adminName = user?.name || 'Admin';
  const userModules = user?.modules || [];
  const currentModule = 'pharmacy';
  const otherModules = userModules.filter(m => m !== currentModule);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Menu size={20} />
        </button>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{getGreeting()}, {adminName}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(time)} · {formatTime(time)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Avatar name={adminName} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{adminName}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{adminName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                  <span className="text-xs text-primary-600 dark:text-primary-400 capitalize">{user?.role || 'Admin'}</span>
                </div>

                <button onClick={handleProfileSettings} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User size={16} /> Profile Settings
                </button>
                <button onClick={handleChangePassword} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Key size={16} /> Change Password
                </button>

                {otherModules.length > 0 && (
                  <>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <div className="px-4 py-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">Switch Module</div>
                    {otherModules.map(mod => {
                      const config = MODULES.find(m => m.type === mod);
                      return (
                        <button key={mod} onClick={() => handleModuleSwitch(mod)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <ArrowLeftRight size={16} />
                          <span>{config?.icon || '📦'} {config?.name || mod}</span>
                        </button>
                      );
                    })}
                  </>
                )}

                <hr className="border-gray-200 dark:border-gray-700" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}