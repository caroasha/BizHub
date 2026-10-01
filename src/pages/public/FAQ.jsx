import { Accordion } from '../../components/ui/Accordion';
import { useSite } from '../../hooks/useSite';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const defaultFaqs = [
  { title: 'What is BizHub?', content: 'BizHub is a universal business management platform with 5 modules for restaurants, pharmacies, property management, electronics shops, and cyber cafés.' },
  { title: 'How does the free trial work?', content: 'You get 14 days free access to any module. No credit card required. Cancel anytime.' },
  { title: 'Can I switch plans?', content: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
  { title: 'Is M-Pesa supported?', content: 'Yes! BizHub fully integrates with M-Pesa for seamless payments via STK Push, Till Number, Send Money, and Paybill.' },
  { title: 'Can I have multiple modules?', content: 'Yes! You can subscribe to multiple modules. Each module has its own subscription.' },
  { title: 'What payment methods are available?', content: 'We support M-Pesa STK Push, Send Money, Till Number, Paybill, and Stripe card payments.' },
  { title: 'Is my data secure?', content: 'Yes. We use encryption, secure databases, and regular backups to protect your data.' },
  { title: 'How do I get support?', content: 'You can reach us via email, phone, live chat, or the AI assistant. Business and Enterprise plans get priority support.' },
];

export default function FAQ() {
  const { faqs } = useSite();
  const items = faqs?.length > 0 ? faqs.map(f => ({ title: f.title, content: f.content })) : defaultFaqs;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--text)]">Frequently Asked Questions</h1>
        <p className="text-[var(--text-muted)] mt-2">Everything you need to know about BizHub</p>
      </div>
      <Accordion items={items} />
      <div className="text-center mt-12 p-8 bg-[var(--surface)] rounded-xl">
        <h3 className="text-lg font-semibold text-[var(--text)]">Still have questions?</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">We're here to help.</p>
        <div className="flex gap-4 justify-center mt-4">
          <Link to="/contact"><Button variant="outline">Contact Us</Button></Link>
          <Link to="/help"><Button>Visit Help Center</Button></Link>
        </div>
      </div>
    </div>
  );
}