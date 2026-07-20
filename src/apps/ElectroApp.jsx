import { Routes, Route } from 'react-router-dom';
import { ElectroLayout } from '../components/electro/layout/ElectroLayout';
import { ElectroProvider } from '../context/electro/ElectroContext';
import Dashboard from '../pages/electro/Dashboard';
import Inventory from '../pages/electro/Inventory';
import Categories from '../pages/electro/Categories';
import Sales from '../pages/electro/Sales';
import Repairs from '../pages/electro/Repairs';
import Suppliers from '../pages/electro/Suppliers';
import Warranties from '../pages/electro/Warranties';
import Reports from '../pages/electro/Reports';
import Settings from '../pages/electro/Settings';

export default function ElectroApp() {
  return (
    <ElectroProvider>
      <Routes>
        <Route element={<ElectroLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sales" element={<Sales />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="warranties" element={<Warranties />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </ElectroProvider>
  );
}