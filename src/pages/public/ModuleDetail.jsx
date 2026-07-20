import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MODULES } from '../../utils/constants';

export default function ModuleDetail() {
  const { slug } = useParams();
  const module = MODULES.find(m => m.slug === slug);

  if (!module) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-6xl">🔍</span>
        <h1 className="text-2xl font-bold text-[var(--text)] mt-4">Module Not Found</h1>
        <Link to="/" className="mt-6 inline-block"><Button>Back to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-6xl">{module.icon}</span>
        <h1 className="text-4xl font-bold text-[var(--text)] mt-4">{module.name}</h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-2xl mx-auto">
          Complete {module.name.toLowerCase()} management solution. Track everything, automate tasks, and grow your business.
        </p>
        <Link to="/register" className="mt-6 inline-block"><Button size="lg">Start Free Trial</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Point of Sale', 'Inventory Management', 'Reports & Analytics', 'M-Pesa Integration', 'Staff Management', 'Customer Tracking'].map((f, i) => (
          <Card key={i}><span className="text-[var(--success)] mr-2">✓</span> {f}</Card>
        ))}
      </div>
    </div>
  );
}