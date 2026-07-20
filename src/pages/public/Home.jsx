import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Accordion } from '../../components/ui/Accordion';
import { Spinner } from '../../components/ui/Spinner';
import { CheckIcon } from '../../utils/svg';
import { useSite } from '../../hooks/useSite';
import { getPlans } from '../../api/public/plans';
import { formatCurrency, formatStorage, formatUsers } from '../../utils/format';

const modules = [
  { icon: '🍽️', name: 'RestoManagerKE', desc: 'Restaurant POS, menu, tables, kitchen', slug: 'resto' },
  { icon: '💊', name: 'PharmaSys', desc: 'Medicine stock, prescriptions, expiry', slug: 'pharma' },
  { icon: '🏢', name: 'MyApartment', desc: 'Units, tenants, leases, rent collection', slug: 'apartment' },
  { icon: '🔌', name: 'ElectroStore', desc: 'Serial tracking, sales, repairs, warranty', slug: 'electro' },
  { icon: '💻', name: 'DigitalManager', desc: 'Time billing, printing, packages', slug: 'cyber' },
];

const highlights = [
  { icon: '📱', title: 'M-Pesa Ready', desc: 'STK Push, Till, Send Money, and Paybill' },
  { icon: '📶', title: 'Offline Support', desc: 'Work without internet, sync when connected' },
  { icon: '📊', title: 'Smart Reports', desc: 'Real-time analytics and exportable reports' },
  { icon: '🔐', title: 'Role-Based Access', desc: 'Control who sees and does what' },
  { icon: '🤖', title: 'AI Assistant', desc: '24/7 smart support for your business' },
  { icon: '☁️', title: 'Auto Backups', desc: 'Daily automated backups with easy restore' },
];

const defaultFaqs = [
  { title: 'What is BizHub?', content: 'BizHub is a universal business management platform with 5 modules for restaurants, pharmacies, property management, electronics shops, and cyber cafés.' },
  { title: 'How does the free trial work?', content: '14 days free access to any module. No credit card required.' },
  { title: 'Can I use multiple modules?', content: 'Yes! Each module has its own subscription and billing.' },
  { title: 'What payment methods do you support?', content: 'M-Pesa STK Push, Send Money, Till Number, Paybill, and Stripe.' },
];

export default function Home() {
  const { settings, testimonials, faqs } = useSite();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPlans()
      .then(res => setPlans(res?.data || res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Manage Your <span className="text-primary-600 dark:text-primary-400">Entire Business</span> From One Place
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Restaurant, pharmacy, property, electronics, and cyber café — all in one powerful platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Login</Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {['Restaurant', 'Pharmacy', 'Rentals', 'Electronics', 'Cyber Café'].map(tag => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">14-day free trial • No credit card required</p>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules-section" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Five Powerful Modules</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">One platform, five specialized business tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {modules.map(mod => (
              <Link key={mod.slug} to={`/modules/${mod.slug}`}
                className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-center hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all">
                <span className="text-4xl">{mod.icon}</span>
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{mod.name}</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{mod.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section id="highlights-section" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Everything You Need</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Powerful features to run your business</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map(h => (
              <div key={h.title} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center hover:shadow-lg transition-all">
                <span className="text-4xl">{h.icon}</span>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{h.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      {plans.length > 0 && (
        <section id="pricing-section" className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Simple Pricing</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Choose the plan that fits your business</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map(plan => (
                <div key={plan._id}
                  className={`p-6 border rounded-xl text-center flex flex-col bg-white dark:bg-gray-800 ${plan.highlighted ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200 dark:border-gray-700'}`}>
                  {plan.highlighted && <Badge color="blue" className="self-center mb-2">Popular</Badge>}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{plan.cycle}</span>
                  <div className="mt-3">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                    </span>
                    {plan.cycle !== 'trial' && plan.cycle !== 'permanent' && (
                      <span className="text-sm text-gray-400 dark:text-gray-500">/{plan.cycle === 'yearly' ? 'yr' : 'mo'}</span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-2 flex-1 text-left">
                    {plan.features?.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
                    {formatUsers(plan.maxUsers)} Users • {formatStorage(plan.maxStorageMB)}
                  </p>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    className="mt-4 w-full"
                    onClick={() => navigate(`/register?plan=${plan.slug}`)}
                  >
                    {plan.cycle === 'trial' ? 'Start Free Trial' : 'Get Started'}
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/pricing" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">View full pricing →</Link>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{t.content || t.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                      {(t.name || 'U')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.role || t.business}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Frequently Asked Questions</h2>
          <Accordion items={faqs?.length > 0 ? faqs.map(f => ({ title: f.title, content: f.content })) : defaultFaqs} />
          <div className="text-center mt-8">
            <Link to="/faq" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">View all FAQs →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Business?</h2>
          <p className="mt-3 text-white/80 text-lg">Join hundreds of businesses using BizHub.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90">Start Free Trial</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}