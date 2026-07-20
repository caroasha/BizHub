import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { CheckIcon } from '../../utils/svg';
import { getPlans } from '../../api/public/plans';
import { formatCurrency, formatStorage, formatUsers } from '../../utils/format';
import { MODULES } from '../../utils/constants';
import { cn } from '../../utils/cn';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModules, setShowModules] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPlans()
      .then(res => setPlans(res?.data || res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
    setSelectedModule(null);
    setShowModules(true);
  };

  const handleModuleSelect = (mod) => {
    setSelectedModule(mod.type);
  };

  const handleContinue = () => {
    if (!selectedPlan || !selectedModule) return;
    setShowModules(false);
    navigate(`/register?plan=${selectedPlan.slug}&module=${selectedModule}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">14-day free trial on all plans. No credit card required.</p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">No plans available yet.</div>
      ) : (
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
                {plan.cycle === 'permanent' && (
                  <span className="text-sm text-gray-400 dark:text-gray-500"> forever</span>
                )}
              </div>
              <ul className="mt-6 space-y-2 flex-1 text-left">
                {plan.features?.map((f, i) => (
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
                onClick={() => handlePlanClick(plan)}
              >
                {plan.cycle === 'trial' ? 'Start Free Trial' : 'Get Started'}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/contact" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
          Need a custom plan? Contact us
        </Link>
      </div>

      {/* Module Selection Modal */}
      <Modal isOpen={showModules} onClose={() => setShowModules(false)} title="Choose Your Module" size="lg">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select the business module you want for the <strong>{selectedPlan?.name}</strong> plan.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODULES.map(mod => (
            <div key={mod.type}
              onClick={() => handleModuleSelect(mod)}
              className={cn(
                'p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl text-center cursor-pointer hover:shadow-md transition-all',
                selectedModule === mod.type ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200 dark:border-gray-700'
              )}>
              <span className="text-3xl">{mod.icon}</span>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{mod.name}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowModules(false)}>Cancel</Button>
          <Button onClick={handleContinue} disabled={!selectedModule}>
            Continue to Registration
          </Button>
        </div>
      </Modal>
    </div>
  );
}