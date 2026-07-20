import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { registerTenant } from '../../api/public/registration';
import { getPlans } from '../../api/public/plans';
import { useNotification } from '../../hooks/useNotification';
import { MODULES } from '../../utils/constants';
import { cn } from '../../utils/cn';

export default function Register() {
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get('plan');
  const moduleType = searchParams.get('module');
  const navigate = useNavigate();

  const [businessType, setBusinessType] = useState(moduleType || '');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { error: notifyError } = useNotification();
  const { register, handleSubmit, formState: { errors } } = useForm();

useEffect(() => {
  if (!planSlug) {
    setPlanLoading(false);
    return;
  }

  getPlans()
    .then(res => {
      const plans = res?.data || [];
      const plan = plans.find(p => p.slug === planSlug);
      setSelectedPlan(plan || null);
      setPlanLoading(false);
    })
    .catch(() => {
      setPlanLoading(false);
    });
}, [planSlug]);

  const onSubmit = async (data) => {
    setSubmitError('');

    if (!selectedPlan) {
      setSubmitError('No plan selected');
      return;
    }

    if (!moduleType && !businessType) {
      setSubmitError('Please select a business type');
      return;
    }

    if (!agreed) {
      setSubmitError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    const finalBusinessType = moduleType || businessType;
    const payload = {
      businessName: data.businessName,
      businessType: finalBusinessType,
      owner: { name: data.ownerName, email: data.email, phone: data.phone },
      contact: { email: data.email, phone: data.phone },
      password: data.password,
      isTrial: selectedPlan.cycle === 'trial',
    };

    if (selectedPlan.cycle === 'trial') {
      setLoading(true);
      try {
        const res = await registerTenant(payload);
        const msg = res?.message || 'Your free trial is active!';
        setSuccessMessage(msg);
        setShowSuccess(true);
      } catch (err) {
        const msg = err.response?.data?.message || 'Registration failed';
        setSubmitError(msg);
        notifyError(msg);
      }
      setLoading(false);
      return;
    }

    const checkoutParams = new URLSearchParams();
    checkoutParams.set('plan', selectedPlan.slug);
    checkoutParams.set('planName', selectedPlan.name);
    checkoutParams.set('planCycle', selectedPlan.cycle);
    checkoutParams.set('planPrice', selectedPlan.price);
    checkoutParams.set('businessName', data.businessName);
    checkoutParams.set('businessType', finalBusinessType);
    checkoutParams.set('ownerName', data.ownerName);
    checkoutParams.set('email', data.email);
    checkoutParams.set('phone', data.phone);
    checkoutParams.set('password', data.password);

    navigate(`/checkout?${checkoutParams.toString()}`);
  };

  if (planLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">Plan not found. Please choose a plan first.</p>
        <Link to="/pricing" className="mt-4 inline-block"><Button>View Plans</Button></Link>
      </div>
    );
  }

  const isTrial = selectedPlan.cycle === 'trial';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isTrial ? 'Start Free Trial' : 'Create Account'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Plan: <strong>{selectedPlan.name}</strong> {isTrial ? '(Free - 14 days)' : `(KSh ${selectedPlan.price.toLocaleString()})`}
        </p>
        {(moduleType || businessType) && (
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
            Module: {MODULES.find(m => m.type === (moduleType || businessType))?.name || (moduleType || businessType)}
          </p>
        )}
      </div>

      <Card>
        {!moduleType && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Choose Your Business Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {MODULES.map(mod => (
                <div key={mod.type} onClick={() => setBusinessType(mod.type)}
                  className={cn(
                    'p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-center cursor-pointer hover:shadow-md transition-all',
                    businessType === mod.type ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200 dark:border-gray-700'
                  )}>
                  <span className="text-2xl">{mod.icon}</span>
                  <p className="mt-1 text-xs font-medium text-gray-900 dark:text-white">{mod.name}</p>
                </div>
              ))}
            </div>
            {!businessType && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Please select a module to continue</p>}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Business Name" {...register('businessName', { required: 'Business name is required' })} error={errors.businessName?.message} />
          <Input label="Owner Name" {...register('ownerName', { required: 'Owner name is required' })} error={errors.ownerName?.message} />
          <Input label="Email" type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} error={errors.email?.message} />
          <Input label="Phone (2547XXXXXXXX)" {...register('phone', { required: 'Phone is required' })} error={errors.phone?.message} />
          <Input label="Password" type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} error={errors.password?.message} />

          <div className="flex items-start gap-2">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" target="_blank" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
            </span>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {submitError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/pricing')}>Back</Button>
            <Button type="submit" loading={loading} className="flex-1">
              {isTrial ? 'Start Free Trial' : 'Continue to Payment'}
            </Button>
          </div>
        </form>
      </Card>

      <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Login</Link>
      </p>

      {isTrial && (
        <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); navigate('/login'); }}
          title="Trial Activated!" size="sm">
          <div className="text-center py-4">
            <span className="text-6xl">🚀</span>
            <p className="text-gray-900 dark:text-white mt-4 font-medium">{successMessage}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Your 14-day free trial is active. Start exploring now!</p>
            <Button className="mt-6 w-full" onClick={() => { setShowSuccess(false); navigate('/login'); }}>
              Go to Login
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}