import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { AiProvider } from './context/AiContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { Spinner } from './components/ui/Spinner';
import Maintenance from './pages/public/Maintenance';
import api from './api/axios';

import PublicApp from './apps/PublicApp';
import RestoApp from './apps/RestoApp';
import PharmaApp from './apps/PharmaApp';
import ApartmentApp from './apps/ApartmentApp';
import ElectroApp from './apps/ElectroApp';
import CyberApp from './apps/CyberApp';

const moduleKeys = ['maintenance_platform', 'maintenance_landing', 'maintenance_resto', 'maintenance_pharma', 'maintenance_apartment', 'maintenance_electro', 'maintenance_cyber'];

function AppGate({ children }) {
  const [flags, setFlags] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/site')
      .then(res => {
        const data = res?.data || res || {};
        setFlags(data);
      })
      .catch(() => setFlags({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const path = window.location.pathname;

  // Full platform maintenance — block everything except admin
  if (flags?.maintenance_platform === 'true' && !path.startsWith('/admin')) {
    return <Maintenance module="platform" />;
  }

  // Landing page maintenance — only block public routes
  const isPublicRoute = ['/', '/pricing', '/register', '/login', '/contact', '/demo', '/faq', '/help', '/terms', '/privacy', '/refund'].some(r => path === r || path.startsWith(r + '?'));
  if (flags?.maintenance_landing === 'true' && isPublicRoute) {
    return <Maintenance module="landing" />;
  }

  // Module-specific maintenance
  const moduleCheck = {
    '/resto': 'maintenance_resto',
    '/pharma': 'maintenance_pharma',
    '/apartment': 'maintenance_apartment',
    '/electro': 'maintenance_electro',
    '/cyber': 'maintenance_cyber',
  };

  for (const [routePath, flagKey] of Object.entries(moduleCheck)) {
    if (path.startsWith(routePath) && flags?.[flagKey] === 'true') {
      const mod = flagKey.replace('maintenance_', '');
      return <Maintenance module={mod} />;
    }
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <SiteProvider>
              <AiProvider>
                <SidebarProvider>
                  <SocketProvider>
                    <AppGate>
                      <Routes>
                        <Route path="/*" element={<PublicApp />} />
                        <Route path="/resto/*" element={<RestoApp />} />
                        <Route path="/pharma/*" element={<PharmaApp />} />
                        <Route path="/apartment/*" element={<ApartmentApp />} />
                        <Route path="/electro/*" element={<ElectroApp />} />
                        <Route path="/cyber/*" element={<CyberApp />} />
                      </Routes>
                    </AppGate>
                  </SocketProvider>
                </SidebarProvider>
              </AiProvider>
            </SiteProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}