import { Routes, Route } from 'react-router-dom';
import { CyberLayout } from '../components/cyber/layout/CyberLayout';
import { CyberProvider } from '../context/cyber/CyberContext';
import Dashboard from '../pages/cyber/Dashboard';
import Pos from '../pages/cyber/Pos';
import Sessions from '../pages/cyber/Sessions';
import Inventory from '../pages/cyber/Inventory';
import Services from '../pages/cyber/Services';
import Packages from '../pages/cyber/Packages';
import Customers from '../pages/cyber/Customers';
import Reports from '../pages/cyber/Reports';
import Settings from '../pages/cyber/Settings';

export default function CyberApp() {
  return (
    <CyberProvider>
      <Routes>
        <Route element={<CyberLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<Pos />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="services" element={<Services />} />
          <Route path="packages" element={<Packages />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </CyberProvider>
  );
}