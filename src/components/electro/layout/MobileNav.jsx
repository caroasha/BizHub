import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { LayoutDashboard, Package, ShoppingCart, Wrench, Truck, Shield } from 'lucide-react';

const links = [
  { key: 'dashboard', path: '/electro', icon: LayoutDashboard, label: 'Home' },
  { key: 'inventory', path: '/electro/inventory', icon: Package, label: 'Stock' },
  { key: 'sales', path: '/electro/sales', icon: ShoppingCart, label: 'Sales' },
  { key: 'repairs', path: '/electro/repairs', icon: Wrench, label: 'Repair' },
  { key: 'suppliers', path: '/electro/suppliers', icon: Truck, label: 'Suppliers' },
  { key: 'warranties', path: '/electro/warranties', icon: Shield, label: 'Warranty' },
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