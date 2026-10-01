import { Routes, Route } from 'react-router-dom';
import { RestoLayout } from '../components/resto/layout/RestoLayout';
import { RestoProvider } from '../context/resto/RestoContext';
import Dashboard from '../pages/resto/Dashboard';
import Menu from '../pages/resto/Menu';
import Orders from '../pages/resto/Orders';
import Reservations from '../pages/resto/Reservations';
import Transactions from '../pages/resto/Transactions';
import Expenses from '../pages/resto/Expenses';
import Customers from '../pages/resto/Customers';
import Employees from '../pages/resto/Employees';
import Payroll from '../pages/resto/Payroll';
import Stock from '../pages/resto/Stock';
import Suppliers from '../pages/resto/Suppliers';
import Reports from '../pages/resto/Reports';
import Settings from '../pages/resto/Settings';

export default function RestoApp() {
  return (
    <RestoProvider>
      <Routes>
        <Route element={<RestoLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<Menu />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="customers" element={<Customers />} />
          <Route path="employees" element={<Employees />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="stock" element={<Stock />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </RestoProvider>
  );
}