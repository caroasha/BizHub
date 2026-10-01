import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { LayoutDashboard, Building, Home, Users, FileText, CreditCard } from 'lucide-react';

const links = [
  { key: 'dashboard', path: '/apartment', icon: LayoutDashboard, label: 'Home' },
  { key: 'properties', path: '/apartment/properties', icon: Building, label: 'Props' },
  { key: 'units', path: '/apartment/units', icon: Home, label: 'Units' },
  { key: 'tenants', path: '/apartment/tenants', icon: Users, label: 'Tenants' },
  { key: 'leases', path: '/apartment/leases', icon: FileText, label: 'Leases' },
  { key: 'payments', path: '/apartment/payments', icon: CreditCard, label: 'Pay' },
];

export function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 lg:hidden">
      <div className="flex items-center justify-around h-14">
        {links.map(link => (
          <Link key={link.key} to={link.path} className={cn('flex flex-col items-center gap-0.5 text-xs', location.pathname === link.path ? 'text-primary-600' : 'text-gray-400')}><link.icon size={18} />{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}