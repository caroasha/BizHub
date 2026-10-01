import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiClock,
  HiCheckCircle,
  HiLogout,
  HiRefresh,
  HiDocumentText,
  HiPhone,
  HiMail,
  HiExclamation,
} from 'react-icons/hi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useSite } from '../../hooks/useSite';
import { useNotification } from '../../hooks/useNotification';
import api from '../../api/axios';

const POLL_INTERVAL = 30000;

const MODULE_ROUTES = {
  restaurant: '/resto',
  pharmacy: '/pharma',
  apartment: '/apartment',
  electronics: '/electro',
  cyber: '/cyber',
};

const formatMoney = (amount, currency = 'KES') =>
  `${currency} ${Number(amount || 0).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export default function Pending() {
  const navigate = useNavigate();
  const { user, tenant, scope, invoice, isAuthenticated, loading, logout, refreshUser } = useAuth();
  const { settings } = useSite();
  const { success, error: notifyError } = useNotification();

  const [refreshing, setRefreshing] = useState(false);
  const [checkoutState, setCheckoutState] = useState('idle');
  const [phone, setPhone] = useState(user?.phone || '');
  const [sendError, setSendError] = useState('');
  const [instructions, setInstructions] = useState([]);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const pollRef = useRef(null);

  const hasInvoice = Boolean(invoice);
  const isPaid = invoice?.status === 'paid' || invoice?.paymentState === 'paid';
  const canPay = hasInvoice && !isPaid && (invoice?.amountDue || 0) > 0;
  const currency = invoice?.currency || 'KES';
  const amountDue = invoice?.amountDue || 0;
  const invoiceNumber = invoice?.invoiceNumber || '';

  const supportEmail = settings?.support_email || 'support@bizhub.co.ke';
  const supportPhone = settings?.support_phone || '+254 700 000 000';

  const hasStk = instructions.some((m) => m.code === 'mpesa_stk');
  const otherMethods = instructions.filter((m) => m.code !== 'mpesa_stk');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (scope === 'active') {
      const route = MODULE_ROUTES[tenant?.businessType] || '/dashboard';
      navigate(route, { replace: true });
      return;
    }
    if (scope === 'expired') {
      navigate('/renewal', { replace: true });
      return;
    }
    if (scope === 'rejected' || scope === 'auto_rejected') {
      navigate('/register', { replace: true });
    }
  }, [loading, isAuthenticated, scope, navigate, tenant]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (scope !== 'pending' && scope !== 'paid_wait') return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await refreshUser();
        if (data?.scope === 'active') {
          const route = MODULE_ROUTES[data.tenant?.businessType] || '/dashboard';
          navigate(route, { replace: true });
        }
      } catch {
        /* silent */
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, scope, refreshUser, navigate]);

  const loadInstructions = useCallback(async () => {
    if (!invoiceNumber || isPaid) {
      setInstructions([]);
      return;
    }
    setInstructionsLoading(true);
    try {
      const res = await api.get(`/public/invoice/${invoiceNumber}`);
      const payload = res?.data?.data || res?.data || res;
      const inv = payload?.invoice || payload;
      setInstructions(inv?.paymentInstructions || []);
    } catch {
      setInstructions([]);
    } finally {
      setInstructionsLoading(false);
    }
  }, [invoiceNumber, isPaid]);

  useEffect(() => {
    loadInstructions();
  }, [loadInstructions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshUser();
      if (data?.scope === 'active') {
        success('Account activated!');
        const route = MODULE_ROUTES[data.tenant?.businessType] || '/dashboard';
        navigate(route, { replace: true });
        return;
      }
      if (data?.scope === 'paid_wait') {
        success('Payment received. Awaiting approval.');
      } else {
        await loadInstructions();
        success('Status checked');
      }
    } catch {
      notifyError('Failed to refresh status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStkPay = async () => {
    setSendError('');
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setSendError('Please enter a valid phone number');
      return;
    }

    setCheckoutState('sending');
    try {
      const res = await api.post('/public/payment/stk', { invoiceNumber, phone });
      const payload = res?.data?.data || res?.data || res;
      if (payload?.checkoutRequestId) {
        setCheckoutState('waiting');
        success('Payment request sent. Check your phone.');
        setTimeout(() => {
          handleRefresh();
          setCheckoutState('idle');
        }, 15000);
      } else {
        setCheckoutState('idle');
        setSendError('Failed to send payment request');
      }
    } catch (err) {
      setCheckoutState('idle');
      const msg = err?.response?.data?.message || err.message || 'Payment failed';
      setSendError(msg);
      notifyError(msg);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="mx-auto max-w-lg">
        <Card>
          <div className="text-center">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                scope === 'paid_wait' || isPaid
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}
            >
              {scope === 'paid_wait' || isPaid ? (
                <HiCheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <HiClock className="w-8 h-8 text-yellow-600" />
              )}
            </div>

            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {scope === 'paid_wait'
                ? 'Awaiting approval'
                : isPaid
                ? 'Payment received'
                : 'Complete your payment'}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {scope === 'paid_wait' || isPaid ? (
                <>
                  Thanks <strong className="text-gray-900 dark:text-gray-100">{user?.name}</strong>.
                  We've received your payment for{' '}
                  <strong className="text-gray-900 dark:text-gray-100">
                    {tenant?.businessName}
                  </strong>
                  . Your account is under review — usually takes less than 24 hours.
                </>
              ) : hasInvoice ? (
                <>
                  Thanks <strong className="text-gray-900 dark:text-gray-100">{user?.name}</strong>.
                  Pay the invoice below to activate{' '}
                  <strong className="text-gray-900 dark:text-gray-100">
                    {tenant?.businessName}
                  </strong>
                  .
                </>
              ) : (
                <>
                  Thanks <strong className="text-gray-900 dark:text-gray-100">{user?.name}</strong>.
                  Your registration is with our team for review.
                </>
              )}
            </p>
          </div>

          {hasInvoice && (
            <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm space-y-2">
              <Row label="Business" value={tenant?.businessName || '—'} />
              <Row label="Plan" value={tenant?.settings?.planName || '—'} />
              <Row label="Invoice" value={invoiceNumber || '—'} mono />
              <Row
                label="Amount"
                value={formatMoney(isPaid ? invoice?.amountPaid || amountDue : amountDue, currency)}
                bold
              />
              {invoice?.dueDate && <Row label="Due" value={formatDate(invoice.dueDate)} />}
              <Row
                label="Status"
                value={
                  isPaid ? (
                    <Badge color="green">Paid</Badge>
                  ) : scope === 'paid_wait' ? (
                    <Badge color="blue">Under review</Badge>
                  ) : (
                    <Badge color="yellow">Unpaid</Badge>
                  )
                }
              />
            </div>
          )}

          {canPay && !instructionsLoading && (
            <>
              {hasStk && (
                <div className="mt-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      M-Pesa Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="254712345678"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {sendError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{sendError}</p>
                  )}

                  <Button
                    onClick={handleStkPay}
                    loading={checkoutState === 'sending' || checkoutState === 'waiting'}
                    className="w-full"
                    size="lg"
                  >
                    <HiPhone className="w-4 h-4" />
                    {checkoutState === 'waiting'
                      ? 'Waiting for payment...'
                      : `Pay ${formatMoney(amountDue, currency)} with M-Pesa`}
                  </Button>
                </div>
              )}

              {otherMethods.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                    Other payment methods
                  </p>
                  <div className="space-y-3">
                    {otherMethods.map((m, i) => (
                      <MethodCard key={i} method={m} />
                    ))}
                  </div>
                </div>
              )}

              {!hasStk && otherMethods.length === 0 && (
                <div className="mt-6 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <div className="flex items-start gap-2">
                    <HiExclamation className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                        No payment methods available
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Contact support for assistance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-6 space-y-2">
            {hasInvoice && invoiceNumber && (
              <Link to={`/invoice/${invoiceNumber}`} className="block">
                <Button variant="secondary" className="w-full" size="lg">
                  <HiDocumentText className="w-4 h-4" />
                  View Full Invoice
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              onClick={handleRefresh}
              loading={refreshing}
              className="w-full"
            >
              <HiRefresh className="w-4 h-4" />
              Check Status
            </Button>

            <Button variant="ghost" onClick={handleLogout} className="w-full">
              <HiLogout className="w-4 h-4" />
              Log Out
            </Button>
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5">
            <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              Need help?
            </p>
            <div className="mt-2 flex flex-col items-center gap-1.5 text-xs">
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                <HiMail className="w-3 h-3" />
                {supportEmail}
              </a>
              <a
                href={`tel:${String(supportPhone).replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                <HiPhone className="w-3 h-3" />
                {supportPhone}
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MethodCard({ method }) {
  const steps = Array.isArray(method.steps) ? method.steps : [];
  const recipient = method.recipient || {};

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {method.title}
      </p>
      {method.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {method.description}
        </p>
      )}

      {recipient.phone && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
          Number: <strong>{recipient.phone}</strong>
        </p>
      )}
      {recipient.tillNumber && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
          Till: <strong>{recipient.tillNumber}</strong>
        </p>
      )}
      {recipient.paybillNumber && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
          Paybill: <strong>{recipient.paybillNumber}</strong>
          {recipient.accountNumber && (
            <>
              {' '}· Account: <strong>{recipient.accountNumber}</strong>
            </>
          )}
        </p>
      )}

      {steps.length > 0 && (
        <ol className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-decimal list-inside">
          {steps.map((s, j) => (
            <li key={j}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={[
          'text-right',
          bold
            ? 'font-semibold text-gray-900 dark:text-gray-100'
            : 'text-gray-900 dark:text-gray-100',
          mono ? 'font-mono text-xs' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </span>
    </div>
  );
}