import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { getPaymentMethods } from '../../api/public/site';
import { registerTenant } from '../../api/public/registration';
import { formatCurrency } from '../../utils/format';
import { useNotification } from '../../hooks/useNotification';
import { cn } from '../../utils/cn';

const methodLabels = {
  momo_stk: 'M-Pesa STK Push',
  momo_send: 'Send Money',
  momo_till: 'Till Number',
  momo_paybill: 'Paybill',
  stripe: 'Card (Stripe)',
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const registration = {
    businessName: searchParams.get('businessName'),
    businessType: searchParams.get('businessType'),
    owner: {
      name: searchParams.get('ownerName'),
      email: searchParams.get('email'),
      phone: searchParams.get('phone'),
    },
    contact: {
      email: searchParams.get('email'),
      phone: searchParams.get('phone'),
    },
    password: searchParams.get('password'),
  };

  const plan = {
    slug: searchParams.get('plan'),
    name: searchParams.get('planName'),
    cycle: searchParams.get('planCycle'),
    price: Number(searchParams.get('planPrice')),
  };

  const [methods, setMethods] = useState([]);
  const [requireProof, setRequireProof] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [phone, setPhone] = useState(registration?.owner?.phone || '');
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    if (!registration.businessName || !plan.slug) {
      navigate('/pricing');
      return;
    }
    getPaymentMethods()
      .then(res => {
        const data = res?.data || res || {};
        setMethods(data.methods || []);
        setRequireProof(data.requireProof || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMethod) return;

    setProcessing(true);
    try {
      const payload = {
        businessName: registration.businessName,
        businessType: registration.businessType,
        owner: registration.owner,
        contact: registration.contact,
        password: registration.password,
        isTrial: false,
        planName: plan.name,
        planAmount: plan.price,
        planCycle: plan.cycle,
        paymentMethod: selectedMethod.type,
        paymentPhone: phone,
      };
      await registerTenant(payload);
      success('Registration submitted! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      error(err.response?.data?.message || 'Something went wrong');
    }
    setProcessing(false);
  };

  if (!registration.businessName || !plan.slug) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const isManual = ['momo_send', 'momo_till', 'momo_paybill'].includes(selectedMethod?.type);
  const isStk = selectedMethod?.type === 'momo_stk';
  const showProof = isManual && requireProof;

  const getManualGuide = () => {
    if (selectedMethod?.type === 'momo_send') {
      return {
        steps: [
          'Go to M-Pesa menu on your phone',
          'Select "Send Money"',
          `Enter phone number: ${selectedMethod.number || 'N/A'}`,
          `Enter amount: KSh ${plan.price.toLocaleString()}`,
          'Enter your M-Pesa PIN',
          'Confirm and send',
          'Come back here and confirm you have paid',
        ],
        title: 'How to Pay via Send Money',
      };
    }
    if (selectedMethod?.type === 'momo_till') {
      return {
        steps: [
          'Go to M-Pesa menu on your phone',
          'Select "Lipa Na M-Pesa" then "Buy Goods"',
          `Enter Till Number: ${selectedMethod.number || 'N/A'}`,
          `Enter amount: KSh ${plan.price.toLocaleString()}`,
          'Enter your M-Pesa PIN',
          'Confirm and send',
          'Come back here and confirm you have paid',
        ],
        title: 'How to Pay via Till Number',
      };
    }
    if (selectedMethod?.type === 'momo_paybill') {
      return {
        steps: [
          'Go to M-Pesa menu on your phone',
          'Select "Lipa Na M-Pesa" then "Paybill"',
          `Enter Business Number: ${selectedMethod.business || 'N/A'}`,
          `Enter Account Number: ${selectedMethod.account || 'N/A'}`,
          `Enter amount: KSh ${plan.price.toLocaleString()}`,
          'Enter your M-Pesa PIN',
          'Confirm and send',
          'Come back here and confirm you have paid',
        ],
        title: 'How to Pay via Paybill',
      };
    }
    return null;
  };

  const manualGuide = getManualGuide();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Complete your subscription</p>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{plan.name} Plan</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(plan.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Billing</span>
            <Badge>{plan.cycle}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Business</span>
            <span className="text-gray-900 dark:text-white">{registration.businessName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Module</span>
            <span className="text-gray-900 dark:text-white">
              {registration.businessType === 'pharmacy' ? 'PharmaSys' : 
               registration.businessType === 'restaurant' ? 'RestoManagerKE' :
               registration.businessType === 'apartment' ? 'MyApartment' :
               registration.businessType === 'electronics' ? 'ElectroStore' : 'DigitalManager'}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 flex justify-between font-semibold">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(plan.price)}</span>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : methods.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No payment methods available. Please contact support.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Select Payment Method</h3>
          <div className="space-y-2 mb-6">
            {methods.map(method => (
              <Card
                key={method.type}
                hover
                onClick={() => { setSelectedMethod(method); setConfirmed(false); }}
                className={cn('cursor-pointer', selectedMethod?.type === method.type && 'ring-2 ring-primary-500')}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {methodLabels[method.type] || method.name}
                </p>
                {method.number && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Number: {method.number}</p>
                )}
                {method.business && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Business: {method.business} | Account: {method.account}
                  </p>
                )}
              </Card>
            ))}
          </div>

          {isStk && (
            <div className="mb-4">
              <Input
                label="M-Pesa Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
              />
              <p className="text-xs text-gray-400 mt-1">You will receive an M-Pesa prompt on this number</p>
            </div>
          )}

          {isManual && manualGuide && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">{manualGuide.title}</h4>
              <ol className="space-y-2">
                {manualGuide.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-blue-700 dark:text-blue-400">
                    <span className="font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {showProof && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Payment Proof (Screenshot)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setProofFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-900 dark:file:text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Upload a screenshot of your M-Pesa confirmation message</p>
            </div>
          )}

          {isManual && (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                  ⚠️ Important: Submissions without payment will be automatically rejected within 3 hours.
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  Complete the M-Pesa payment before submitting this form.
                </p>
              </div>

              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I confirm that I have completed the M-Pesa payment of <strong>KSh {plan.price.toLocaleString()}</strong> as instructed above.
                    I understand that false confirmation will lead to account rejection.
                  </span>
                </label>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
            <Button
              type="submit"
              loading={processing}
              disabled={!selectedMethod || (isManual && !confirmed)}
              className="flex-1"
            >
              {isManual ? 'Submit & Confirm Payment' : isStk ? 'Pay Now' : 'Submit Registration'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}