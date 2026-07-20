import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../hooks/useSidebar';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../utils/cn';
import { X, LayoutDashboard, Building, Home, Users, FileText, CreditCard, Wrench, BarChart3, Settings } from 'lucide-react';

const links = [
  { key: 'dashboard', path: '/apartment', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'properties', path: '/apartment/properties', icon: Building, label: 'Properties' },
  { key: 'units', path: '/apartment/units', icon: Home, label: 'Units' },
  { key: 'tenants', path: '/apartment/tenants', icon: Users, label: 'Tenants' },
  { key: 'leases', path: '/apartment/leases', icon: FileText, label: 'Leases' },
  { key: 'payments', path: '/apartment/payments', icon: CreditCard, label: 'Payments' },
  { key: 'maintenance', path: '/apartment/maintenance', icon: Wrench, label: 'Maintenance' },
  { key: 'reports', path: '/apartment/reports', icon: BarChart3, label: 'Reports' },
  { key: 'settings', path: '/apartment/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const businessName = user?.businessName || 'My Property';

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} />}
      <aside className={cn('fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 lg:translate-x-0 flex flex-col', isOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0"><div className="flex items-center justify-between"><div><h2 className="font-bold text-gray-900 dark:text-white">🏢 MyApartment</h2><p className="text-xs text-gray-500 mt-0.5">{businessName}</p></div><button onClick={close} className="lg:hidden text-gray-500"><X size={20} /></button></div></div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <Link key={link.key} to={link.path} onClick={close} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', location.pathname === link.path ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')}><link.icon size={18} />{link.label}</Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0"><p className="text-xs text-gray-400 capitalize">{user?.role} · {user?.name}</p></div>
      </aside>
    </>
  );
}