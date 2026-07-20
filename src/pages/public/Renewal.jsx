import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { getPlans } from '../../api/public/plans';
import { getPaymentMethods } from '../../api/public/site';
import { formatCurrency } from '../../utils/format';
import { useNotification } from '../../hooks/useNotification';
import api from '../../api/axios';
import { cn } from '../../utils/cn';

const methodLabels = {
  momo_stk: 'M-Pesa STK Push',
  momo_send: 'Send Money',
  momo_till: 'Till Number',
  momo_paybill: 'Paybill',
  stripe: 'Card (Stripe)',
};

const moduleDisplayNames = {
  restaurant: 'RestoManagerKE',
  pharmacy: 'PharmaSys',
  apartment: 'MyApartment',
  electronics: 'ElectroStore',
  cyber: 'DigitalManager',
};

export default function Renewal() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant');
  const module = searchParams.get('module');
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const [plans, setPlans] = useState([]);
  const [methods, setMethods] = useState([]);
  const [requireProof, setRequireProof] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [phone, setPhone] = useState('');

  const user = (() => { try { return JSON.parse(localStorage.getItem('bizhub_user') || '{}'); } catch { return {}; } })();
  const tenant = {
    businessName: user?.businessName || 'Your Business',
    status: 'expired',
  };

  useEffect(() => {
    if (!tenantId || !module) { navigate('/login'); return; }
    const fetchData = async () => {
      try {
        const [plansRes, methodsRes] = await Promise.all([getPlans(), getPaymentMethods()]);
        setPlans((plansRes?.data || plansRes || []).filter(p => p.cycle !== 'trial'));
        const methodsData = methodsRes?.data || methodsRes || {};
        setMethods(methodsData.methods || []);
        setRequireProof(methodsData.requireProof || false);
        setPhone(user?.phone || '');
      } catch (err) { error('Failed to load data'); }
      setLoading(false);
    };
    fetchData();
  }, [tenantId, module]);

  const getNewExpiryDate = () => {
    if (!selectedPlan) return '';
    const now = new Date();
    switch (selectedPlan.cycle) {
      case 'monthly': now.setMonth(now.getMonth() + 1); break;
      case 'yearly': now.setFullYear(now.getFullYear() + 1); break;
      case 'permanent': return 'Never (Permanent)';
    }
    return now.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !selectedMethod) return;
    const isManual = ['momo_send', 'momo_till', 'momo_paybill'].includes(selectedMethod.type);
    if (isManual && !confirmed) return;
    setProcessing(true);
    try {
      await api.post('/public/renewal', {
        tenantId, plan: selectedPlan.slug, planName: selectedPlan.name,
        planAmount: selectedPlan.price, planCycle: selectedPlan.cycle,
        paymentMethod: selectedMethod.type, paymentPhone: phone,
      });
      success('Subscription renewed! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { error(err.response?.data?.message || 'Renewal failed'); }
    setProcessing(false);
  };

  const getManualGuide = () => {
    if (selectedMethod?.type === 'momo_send') return { steps: ['Go to M-Pesa → Send Money', `Enter: ${selectedMethod.number||'N/A'}`, `Amount: KSh ${selectedPlan?.price?.toLocaleString()||0}`, 'Enter PIN and send', 'Confirm below'], title: 'Send Money' };
    if (selectedMethod?.type === 'momo_till') return { steps: ['Go to M-Pesa → Lipa Na M-Pesa → Buy Goods', `Till: ${selectedMethod.number||'N/A'}`, `Amount: KSh ${selectedPlan?.price?.toLocaleString()||0}`, 'Enter PIN and send', 'Confirm below'], title: 'Till Number' };
    if (selectedMethod?.type === 'momo_paybill') return { steps: ['Go to M-Pesa → Lipa Na M-Pesa → Paybill', `Business: ${selectedMethod.business||'N/A'}`, `Account: ${selectedMethod.account||'N/A'}`, `Amount: KSh ${selectedPlan?.price?.toLocaleString()||0}`, 'Enter PIN and send', 'Confirm below'], title: 'Paybill' };
    return null;
  };

  const manualGuide = getManualGuide();
  const isManual = ['momo_send', 'momo_till', 'momo_paybill'].includes(selectedMethod?.type);
  const isStk = selectedMethod?.type === 'momo_stk';

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Renew Subscription</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{moduleDisplayNames[module] || module} — {tenant.businessName}</p>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Subscription Status</h3>
        <Badge color="red">Expired</Badge>
        <p className="text-sm text-gray-500 mt-2">Your subscription has expired. Choose a new plan below to reactivate.</p>
      </Card>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Choose New Plan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {plans.map(plan => (
          <Card key={plan._id} hover onClick={() => { setSelectedPlan(plan); setSelectedMethod(null); setConfirmed(false); }}
            className={cn('cursor-pointer text-center', selectedPlan?.slug === plan.slug && 'ring-2 ring-primary-500')}>
            <h4 className="font-bold text-gray-900 dark:text-white">{plan.name}</h4>
            <Badge className="mt-1 capitalize">{plan.cycle}</Badge>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">{formatCurrency(plan.price)}</p>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Method</h3>
          <div className="space-y-2 mb-6">
            {methods.map(method => (
              <Card key={method.type} hover onClick={() => { setSelectedMethod(method); setConfirmed(false); }}
                className={cn('cursor-pointer', selectedMethod?.type === method.type && 'ring-2 ring-primary-500')}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{methodLabels[method.type] || method.name}</p>
                {method.number && <p className="text-xs text-gray-500 mt-1">Number: {method.number}</p>}
                {method.business && <p className="text-xs text-gray-500 mt-1">Business: {method.business} | Acc: {method.account}</p>}
              </Card>
            ))}
          </div>
        </>
      )}

      {selectedMethod && (
        <form onSubmit={handleSubmit}>
          {isStk && <div className="mb-4"><Input label="M-Pesa Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="2547XXXXXXXX" /></div>}
          {isManual && manualGuide && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">{manualGuide.title}</h4>
              <ol className="space-y-2">{manualGuide.steps.map((step, i) => <li key={i} className="flex gap-3 text-sm text-blue-700 dark:text-blue-400"><span className="font-bold">{i+1}.</span><span>{step}</span></li>)}</ol>
            </div>
          )}
          {isManual && (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">⚠️ Complete payment before submitting.</p>
              </div>
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I confirm payment of <strong>KSh {selectedPlan?.price?.toLocaleString()}</strong>.</span>
                </label>
              </div>
            </>
          )}
          {selectedPlan && (
            <Card className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
              <div className="text-sm space-y-1">
                <p className="text-gray-500">New Plan: <strong className="text-gray-900 dark:text-white">{selectedPlan.name}</strong></p>
                <p className="text-gray-500">Amount: <strong className="text-gray-900 dark:text-white">{formatCurrency(selectedPlan.price)}</strong></p>
                <p className="text-gray-500">New Expiry: <strong className="text-gray-900 dark:text-white">{getNewExpiryDate()}</strong></p>
              </div>
            </Card>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/login')}>Cancel</Button>
            <Button type="submit" loading={processing} disabled={!selectedMethod || (isManual && !confirmed)} className="flex-1">Renew Now</Button>
          </div>
        </form>
      )}
    </div>
  );
}