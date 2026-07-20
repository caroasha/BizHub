import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../../ui/ToastContainer';

export function ElectroLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"><Sidebar /></div>
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6"><Outlet /></main>
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 hidden lg:block">
          <div className="flex items-center justify-between text-xs text-gray-400"><p>© {new Date().getFullYear()} BizHub — ElectroStore v1.0.0</p><p>Built with ❤️ by BizHub Team</p></div>
        </footer>
      </div>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}