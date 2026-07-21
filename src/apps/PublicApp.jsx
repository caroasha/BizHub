import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../components/public/layout/PublicLayout';
import Home from '../pages/public/Home';
import Register from '../pages/public/Register';
import Login from '../pages/public/Login';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import Pricing from '../pages/public/Pricing';
import Checkout from '../pages/public/Checkout';
import Renewal from '../pages/public/Renewal';
import ModuleDetail from '../pages/public/ModuleDetail';
import Contact from '../pages/public/Contact';
import Demo from '../pages/public/Demo';
import FAQ from '../pages/public/FAQ';
import Help from '../pages/public/Help';
import Terms from '../pages/public/Terms';
import Privacy from '../pages/public/Privacy';
import Refund from '../pages/public/Refund';
import NotFound from '../pages/public/NotFound';
import Maintenance from '../pages/public/Maintenance';

export default function PublicApp() {
  const isDesktop = new URLSearchParams(window.location.search).get('desktop') === 'true';

  return (
    <Routes>
      {/* Desktop login - no layout */}
      {isDesktop && <Route path="login" element={<Login />} />}

      {/* Normal routes with layout */}
      <Route element={isDesktop ? <>{<Outlet />}</> : <PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="renewal" element={<Renewal />} />
        <Route path="modules/:slug" element={<ModuleDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="demo" element={<Demo />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="help" element={<Help />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="refund" element={<Refund />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}