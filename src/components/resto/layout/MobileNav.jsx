import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { LayoutDashboard, Utensils, ShoppingCart, Calendar, Package, Settings } from 'lucide-react';

const links = [
  { key: 'dashboard', path: '/resto', icon: LayoutDashboard, label: 'Home' },
  { key: 'menu', path: '/resto/menu', icon: Utensils, label: 'Menu' },
  { key: 'orders', path: '/resto/orders', icon: ShoppingCart, label: 'Orders' },
  { key: 'reservations', path: '/resto/reservations', icon: Calendar, label: 'Bookings' },
  { key: 'stock', path: '/resto/stock', icon: Package, label: 'Stock' },
  { key: 'settings', path: '/resto/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 lg:hidden">
      <div className="flex items-center justify-around h-14">
        {links.map(link => (
          <Link
            key={link.key}
            to={link.path}
            className={cn(
              'flex flex-col items-center gap-0.5 text-xs',
              location.pathname === link.path
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}