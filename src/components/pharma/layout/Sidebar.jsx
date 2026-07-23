import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSidebar } from '../../../hooks/useSidebar';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../utils/cn';
import { X, LayoutDashboard, Pill, ShoppingCart, FileText, Truck, BarChart3, Settings, DollarSign, Bot } from 'lucide-react';
import api from '../../../api/axios';

const links = [
  { key: 'dashboard', path: '/pharma', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'pos', path: '/pharma/pos', icon: ShoppingCart, label: 'POS' },
  { key: 'inventory', path: '/pharma/inventory', icon: Pill, label: 'Inventory' },
  { key: 'prescriptions', path: '/pharma/prescriptions', icon: FileText, label: 'Prescriptions' },
  { key: 'suppliers', path: '/pharma/suppliers', icon: Truck, label: 'Suppliers' },
  { key: 'accounts', path: '/pharma/accounts', icon: DollarSign, label: 'Accounts' },
  { key: 'ai', path: '/pharma/ai', icon: Bot, label: 'AI Assistant' },
  { key: 'reports', path: '/pharma/reports', icon: BarChart3, label: 'Reports' },
  { key: 'settings', path: '/pharma/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [businessName, setBusinessName] = useState(user?.businessName || 'Pharmacy');

  useEffect(() => {
    // Fetch the actual pharmacy tenant name
    api.get('/pharma/settings')
      .then(res => {
        const data = res?.data || res || {};
        const name = data?.general?.pharmacyName || user?.businessName || 'Pharmacy';
        setBusinessName(name);
      })
      .catch(() => {
        setBusinessName(user?.businessName || 'Pharmacy');
      });
  }, []);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} />}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 flex flex-col',
        'lg:translate-x-0 lg:static lg:z-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">💊 PharmaSys</h2>
              <p className="text-xs text-gray-500 mt-0.5">{businessName}</p>
            </div>
            <button onClick={close} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <Link
              key={link.key}
              to={link.path}
              onClick={close}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                location.pathname === link.path || (link.key === 'dashboard' && location.pathname === '/pharma')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <p className="text-xs text-gray-400 capitalize">{user?.role} · {user?.name}</p>
        </div>
      </aside>
    </>
  );
}