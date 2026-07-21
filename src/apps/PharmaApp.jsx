import { Routes, Route } from 'react-router-dom';
import { PharmaLayout } from '../components/pharma/layout/PharmaLayout';
import { PharmaProvider } from '../context/pharma/PharmaContext';
import Dashboard from '../pages/pharma/Dashboard';
import Inventory from '../pages/pharma/Inventory';
import Sales from '../pages/pharma/Sales';
import Prescriptions from '../pages/pharma/Prescriptions';
import Suppliers from '../pages/pharma/Suppliers';
import Reports from '../pages/pharma/Reports';
import Settings from '../pages/pharma/Settings';
import Accounts from '../pages/pharma/Accounts';
import Ai from '../pages/pharma/Ai';

export default function PharmaApp() {
  return (
    <PharmaProvider>
      <Routes>
        <Route element={<PharmaLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="ai" element={<Ai />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </PharmaProvider>
  );
}