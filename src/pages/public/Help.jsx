import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSite } from '../../hooks/useSite';

const helpCategories = [
  { icon: '📘', title: 'Getting Started', desc: 'Learn the basics of setting up your account', link: '/register' },
  { icon: '💳', title: 'Billing & Payments', desc: 'Understand plans, payments, and invoices', link: '/pricing' },
  { icon: '🔧', title: 'Module Guides', desc: 'How to use each business module', link: '/#modules' },
  { icon: '🔐', title: 'Account & Security', desc: 'Manage your account and security settings', link: '/login' },
  { icon: '📱', title: 'M-Pesa Integration', desc: 'Set up and use M-Pesa payments', link: '/faq' },
  { icon: '💬', title: 'Contact Support', desc: 'Get in touch with our support team', link: '/contact' },
];

export default function Help() {
  const { settings } = useSite();

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--text)]">Help Center</h1>
        <p className="text-[var(--text-muted)] mt-2">How can we help you today?</p>
      </div>

      <div className="max-w-lg mx-auto mb-12">
        <Input placeholder="Search for help..." icon="🔍" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {helpCategories.map((cat, i) => (
          <Link key={i} to={cat.link}>
            <Card hover className="h-full">
              <span className="text-3xl">{cat.icon}</span>
              <h3 className="mt-3 font-semibold text-[var(--text)]">{cat.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{cat.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center p-8 bg-[var(--surface)] rounded-xl">
        <h3 className="text-lg font-semibold text-[var(--text)]">Can't find what you're looking for?</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">Our support team is ready to help.</p>
        <div className="mt-4 space-y-2">
          {settings.support_email && <p className="text-sm text-[var(--text)]">📧 {settings.support_email}</p>}
          {settings.support_phone && <p className="text-sm text-[var(--text)]">📞 {settings.support_phone}</p>}
        </div>
        <Link to="/contact" className="mt-4 inline-block"><Button>Contact Support</Button></Link>
      </div>
    </div>
  );
}