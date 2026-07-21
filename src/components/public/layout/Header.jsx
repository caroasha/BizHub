import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../../ui/Button';

const moduleRoutes = {
  restaurant: '/resto', pharmacy: '/pharma', apartment: '/apartment',
  electronics: '/electro', cyber: '/cyber',
};

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goHome = () => {
    if (location.pathname !== '/') navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  };

  const scrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const getDashboardRoute = () => moduleRoutes[user?.businessType] || '/resto';

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <button onClick={goHome} className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M8 10h6v12H8zm10-4h6v16h-6z" fill="white" />
              <circle cx="22" cy="8" r="2" fill="white" fillOpacity="0.5" />
              <circle cx="22" cy="20" r="2" fill="white" fillOpacity="0.5" />
            </svg>
            <span>BizHub</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('modules-section')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Modules</button>
            <button onClick={() => scrollTo('highlights-section')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing-section')} className="text-sm font-medium text-primary-600 dark:text-primary-400 transition-colors">Pricing</button>
            <button onClick={() => scrollTo('downloads-section')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Downloads</button>

            <div className="relative" onMouseEnter={() => setSupportOpen(true)} onMouseLeave={() => setSupportOpen(false)}>
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Support <ChevronDown size={14} />
              </button>
              {supportOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button onClick={() => { navigate('/contact'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Contact Us</button>
                  <button onClick={() => { navigate('/faq'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">FAQs</button>
                  <button onClick={() => { navigate('/help'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Help Center</button>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <button onClick={() => { navigate('/privacy'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Privacy</button>
                  <button onClick={() => { navigate('/terms'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Terms</button>
                </div>
              )}
            </div>

            <button onClick={toggleMode} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <Link to={getDashboardRoute()}><Button>🚀 Launch App</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="outline">Login</Button></Link>
                <Link to="/pricing"><Button>Get Started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <button onClick={() => scrollTo('modules-section')} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">Modules</button>
          <button onClick={() => scrollTo('highlights-section')} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">Features</button>
          <button onClick={() => scrollTo('pricing-section')} className="block w-full text-left py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400">Pricing</button>
          <button onClick={() => scrollTo('downloads-section')} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">Downloads</button>
          <hr className="border-gray-200 dark:border-gray-700 my-1" />
          <button onClick={() => { navigate('/contact'); setMobileOpen(false); }} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">Contact</button>
          <button onClick={() => { navigate('/faq'); setMobileOpen(false); }} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">FAQs</button>
          <button onClick={() => { navigate('/help'); setMobileOpen(false); }} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">Help Center</button>
          <button onClick={() => { navigate('/privacy'); setMobileOpen(false); }} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">Privacy</button>
          <button onClick={() => { navigate('/terms'); setMobileOpen(false); }} className="block w-full text-left py-2.5 text-sm text-gray-700 dark:text-gray-300">Terms</button>
          <div className="pt-3 space-y-2">
            {isAuthenticated ? (
              <Link to={getDashboardRoute()} className="block"><Button className="w-full">🚀 Launch App</Button></Link>
            ) : (
              <>
                <Link to="/login" className="block"><Button variant="outline" className="w-full">Login</Button></Link>
                <Link to="/pricing" className="block"><Button className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export { Header };