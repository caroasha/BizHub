import { Routes, Route } from 'react-router-dom';
import { ApartmentLayout } from '../components/apartment/layout/ApartmentLayout';
import { ApartmentProvider } from '../context/apartment/ApartmentContext';
import Dashboard from '../pages/apartment/Dashboard';
import Properties from '../pages/apartment/Properties';
import Units from '../pages/apartment/Units';
import Tenants from '../pages/apartment/Tenants';
import Leases from '../pages/apartment/Leases';
import Payments from '../pages/apartment/Payments';
import Maintenance from '../pages/apartment/Maintenance';
import Reports from '../pages/apartment/Reports';
import Settings from '../pages/apartment/Settings';

export default function ApartmentApp() {
  return (
    <ApartmentProvider>
      <Routes>
        <Route element={<ApartmentLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="units" element={<Units />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="leases" element={<Leases />} />
          <Route path="payments" element={<Payments />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </ApartmentProvider>
  );
}