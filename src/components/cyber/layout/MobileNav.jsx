import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { LayoutDashboard, ShoppingCart, Clock, HardDrive, Printer, Package } from 'lucide-react';

const links = [
  { key: 'dashboard', path: '/cyber', icon: LayoutDashboard, label: 'Home' },
  { key: 'pos', path: '/cyber/pos', icon: ShoppingCart, label: 'POS' },
  { key: 'sessions', path: '/cyber/sessions', icon: Clock, label: 'Time' },
  { key: 'inventory', path: '/cyber/inventory', icon: HardDrive, label: 'Items' },
  { key: 'services', path: '/cyber/services', icon: Printer, label: 'Print' },
  { key: 'packages', path: '/cyber/packages', icon: Package, label: 'Bundles' },
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