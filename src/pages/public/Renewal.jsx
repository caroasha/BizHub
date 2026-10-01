import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiClock,
  HiCheckCircle,
  HiRefresh,
  HiArrowLeft,
  HiPhone,
  HiExclamationCircle,
} from 'react-icons/hi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import api from '../../api/axios';

const formatMoney = (amount, currency = 'KES') =>
  `${currency} ${Number(amount || 0).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

export default function Renewal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, tenant, scope, invoice, isAuthenticated, loading, refreshUser } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [payState, setPayState] = useState('idle');
  const [payError, setPayError] = useState('');

  const tenantIdFromUrl = searchParams.get('tenant');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (scope === 'active') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (scope === 'pending' || scope === 'paid_wait') {
      navigate('/pending', { replace: true });
    }
  }, [loading, isAuthenticated, scope, navigate]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await refreshUser();
      if (data?.scope === 'active') {
        success('Account renewed!');
        navigate('/dashboard', { replace: true });
      } else if (data?.scope === 'paid_wait') {
        success('Payment received. Awaiting approval.');
        navigate('/pending', { replace: true });
      }
    } catch {
      notifyError('Failed to refresh status');
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, navigate, success, notifyError]);

  const createRenewalInvoice = async () => {
    setCreating(true);
    try {
      await api.post('/public/renewal', {
        tenantId: tenantIdFromUrl || tenant?._id || tenant?.id,
        plan: tenant?.settings?.planName || 'Standard',
        planName: tenant?.settings?.planName || 'Standard',
        planAmount: tenant?.settings?.planAmount || 0,
        planCycle: tenant?.settings?.planCycle || 'monthly',
        paymentMethod: 'momo_stk',
        paymentPhone: phone,
      });
      success('Renewal invoice created');
      await refresh();
    } catch (err) {
      notifyError(err?.response?.data?.message || 'Failed to create renewal');
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async () => {
    setPayError('');
    if (!phone || phone.length < 10) {
      setPayError('Enter a valid phone number');
      return;
    }
    if (!invoice?.invoiceNumber) {
      setPayError('No invoice found');
      return;
    }

    setPayState('sending');
    try {
      const res = await api.post('/public/payment/stk', {
        invoiceNumber: invoice.invoiceNumber,
        phone,
      });
      const payload = res?.data?.data || res?.data || res;
      if (payload?.checkoutRequestId) {
        setPayState('waiting');
        success('Payment request sent. Check your phone.');
        setTimeout(() => {
          refresh();
          setPayState('idle');
        }, 15000);
      } else {
        setPayState('idle');
        setPayError('Failed to send payment request');
      }
    } catch (err) {
      setPayState('idle');
      const msg = err?.response?.data?.message || err.message || 'Payment failed';
      setPayError(msg);
      notifyError(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const invoiceIsPaid = invoice?.status === 'paid' || invoice?.paymentState === 'paid';
  const hasPendingInvoice = invoice && !invoiceIsPaid && scope === 'expired';
  const isLifetime =
    !tenant?.settings?.planCycle || tenant?.settings?.planCycle === 'permanent';
  const hasActiveSubscription = scope === 'active' && !hasPendingInvoice;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-6"
        >
          <HiArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Renew Subscription
        </h1>

        {/* ACTIVE — You're all set */}
        {hasActiveSubscription && (
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                You're All Set!
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>
                  Plan: <strong>{tenant?.settings?.planName || 'Standard'}</strong>
                </p>
                {tenant?.settings?.planCycle && (
                  <p>
                    Cycle: <strong>{tenant.settings.planCycle}</strong>
                  </p>
                )}
              </div>
              <Button className="mt-6" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </Card>
        )}

        {/* LIFETIME — No renewal needed */}
        {isLifetime && !hasActiveSubscription && !hasPendingInvoice && (
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Lifetime Plan
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Your plan is lifetime. No renewal needed.
              </p>
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </Card>
        )}

        {/* PENDING INVOICE — Pay now */}
        {hasPendingInvoice && (
          <>
            <Card className="mb-6">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl mb-4">
                <HiClock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    Renewal in progress
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Pay the invoice below to reactivate your account.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <Row label="Business" value={tenant?.businessName || '—'} />
                <Row label="Plan" value={tenant?.settings?.planName || 'Standard'} />
                <Row label="Invoice" value={invoice.invoiceNumber} mono />
                <Row
                  label="Amount"
                  value={formatMoney(invoice.amountDue, invoice.currency || 'KES')}
                  bold
                />
                {invoice.dueDate && <Row label="Due" value={formatDate(invoice.dueDate)} />}
              </div>

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

              {payError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{payError}</p>
              )}

              <Button
                onClick={handlePay}
                loading={payState === 'sending' || payState === 'waiting'}
                className="w-full mt-4"
                size="lg"
              >
                <HiPhone className="w-4 h-4" />
                {payState === 'waiting'
                  ? 'Waiting for payment...'
                  : `Pay ${formatMoney(invoice.amountDue, invoice.currency || 'KES')} with M-Pesa`}
              </Button>

              <Button
                variant="ghost"
                onClick={refresh}
                loading={refreshing}
                className="w-full mt-2"
              >
                <HiRefresh className="w-4 h-4" /> Check Status
              </Button>
            </Card>

            {Array.isArray(invoice.paymentInstructions) &&
              invoice.paymentInstructions.filter((p) => p.code !== 'mpesa_stk').length > 0 && (
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                    Other payment methods
                  </p>
                  <div className="space-y-2">
                    {invoice.paymentInstructions
                      .filter((p) => p.code !== 'mpesa_stk')
                      .map((p, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {p.title}
                          </p>
                          {p.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {p.description}
                            </p>
                          )}
                          {Array.isArray(p.steps) && p.steps.length > 0 && (
                            <ol className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-decimal list-inside">
                              {p.steps.map((s, j) => (
                                <li key={j}>{s}</li>
                              ))}
                            </ol>
                          )}
                        </div>
                      ))}
                  </div>
                </Card>
              )}
          </>
        )}

        {/* EXPIRED, NO INVOICE — Create renewal */}
        {!hasActiveSubscription && !isLifetime && !hasPendingInvoice && (
          <Card>
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
              <HiExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  Your subscription has expired
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Renew to regain access to your account.
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Row label="Business" value={tenant?.businessName || '—'} />
              <Row label="Plan" value={tenant?.settings?.planName || 'Standard'} />
              <Row
                label="Amount"
                value={formatMoney(tenant?.settings?.planAmount || 0)}
                bold
              />
            </div>

            <Button
              onClick={createRenewalInvoice}
              loading={creating}
              className="w-full mt-6"
              size="lg"
            >
              <HiRefresh className="w-4 h-4" /> Create Renewal Invoice
            </Button>

            <p className="text-xs text-gray-400 text-center mt-3">
              You'll be able to pay by M-Pesa on the next step.
            </p>
          </Card>
        )}
      </div>
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