import { Link } from 'react-router-dom';
import { useSite } from '../../../hooks/useSite';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { settings } = useSite();
  const year = new Date().getFullYear();

  const supportEmail = settings.support_email || 'support@bizhub.co.ke';
  const supportPhone = settings.support_phone || '+254 700 000 000';
  const address = settings.address || 'Nairobi, Kenya';
  const systemName = settings.system_name || 'BizHub';

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand + Contact */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8 text-primary-400" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path d="M8 10h6v12H8zm10-4h6v16h-6z" fill="white" />
                <circle cx="22" cy="8" r="2" fill="white" fillOpacity="0.5" />
                <circle cx="22" cy="20" r="2" fill="white" fillOpacity="0.5" />
              </svg>
              <span className="font-bold text-lg text-white">{systemName}</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Universal Business Management Suite. One platform for all your business needs.
            </p>
            
            <div className="space-y-3">
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary-400 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <Mail size={16} className="text-gray-500 group-hover:text-primary-400" />
                </span>
                <span>{supportEmail}</span>
              </a>
              <a href={`tel:${supportPhone.replace(/\D/g, '')}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary-400 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <Phone size={16} className="text-gray-500 group-hover:text-primary-400" />
                </span>
                <span>{supportPhone}</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <MapPin size={16} className="text-gray-500" />
                </span>
                <span>{address}</span>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div>
            <h4 className="font-semibold text-white mb-4">Modules</h4>
            <ul className="space-y-3">
              <li><Link to="/modules/resto" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">🍽️ RestoManagerKE</Link></li>
              <li><Link to="/modules/pharma" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">💊 PharmaSys</Link></li>
              <li><Link to="/modules/apartment" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">🏢 MyApartment</Link></li>
              <li><Link to="/modules/electro" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">🔌 ElectroStore</Link></li>
              <li><Link to="/modules/cyber" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">💻 DigitalManager</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/demo" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Request Demo</Link></li>
              <li><Link to="/faq" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">FAQs</Link></li>
              <li><Link to="/help" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {year} {systemName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Privacy</Link>
            <Link to="/refund" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}