import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { LayoutDashboard, Pill, ShoppingCart, FileText, Truck, BarChart3 } from 'lucide-react';

const links = [
  { key: 'dashboard', path: '/pharma', icon: LayoutDashboard, label: 'Home' },
  { key: 'inventory', path: '/pharma/inventory', icon: Pill, label: 'Stock' },
  { key: 'sales', path: '/pharma/sales', icon: ShoppingCart, label: 'Sales' },
  { key: 'prescriptions', path: '/pharma/prescriptions', icon: FileText, label: 'Rx' },
  { key: 'suppliers', path: '/pharma/suppliers', icon: Truck, label: 'Suppliers' },
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