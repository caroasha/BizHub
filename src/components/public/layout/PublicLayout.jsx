import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AiChatWidget } from '../app/AiChatWidget';
import { ToastContainer } from '../../ui/ToastContainer';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AiChatWidget />
      <ToastContainer />
    </div>
  );
}