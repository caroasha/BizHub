import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiDocumentText,
  HiPhone,
  HiArrowLeft,
  HiRefresh,
  HiCheckCircle,
} from 'react-icons/hi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
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

export default function Invoice() {
  const { invoiceNumber } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [payState, setPayState] = useState('idle');
  const [payError, setPayError] = useState('');

  const load = useCallback(async () => {
    if (!invoiceNumber) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/public/invoice/${invoiceNumber}`);
      const payload = res?.data?.data || res?.data || res;
      setInvoice(payload?.invoice || null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Invoice not found');
    } finally {
      setLoading(false);
    }
  }, [invoiceNumber]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePay = async () => {
    setPayError('');
    if (!phone || phone.length < 10) {
      setPayError('Enter a valid phone number');
      return;
    }
    setPayState('sending');
    try {
      const res = await api.post('/public/payment/stk', {
        invoiceNumber,
        phone,
      });
      const payload = res?.data?.data || res?.data || res;
      if (payload?.checkoutRequestId) {
        setPayState('waiting');
        setTimeout(() => {
          load();
          setPayState('idle');
        }, 15000);
      } else {
        setPayState('idle');
        setPayError('Failed to send payment request');
      }
    } catch (err) {
      setPayState('idle');
      setPayError(err?.response?.data?.message || err.message || 'Payment failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <HiDocumentText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Invoice not found
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {error || 'The invoice number may be incorrect or expired.'}
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid' || invoice.paymentState === 'paid';
  const currency = invoice.currency || 'KES';
  const items = invoice.items || [];
  const instructions = invoice.paymentInstructions || [];
  const hasStk = instructions.some((p) => p.code === 'mpesa_stk');
  const otherInstructions = instructions.filter((p) => p.code !== 'mpesa_stk');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-6"
      >
        <HiArrowLeft className="w-4 h-4" /> Back
      </Link>

      <Card>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Invoice
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Issued
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {formatDate(invoice.issuedAt || invoice.createdAt)}
            </p>
            {invoice.dueDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Due {formatDate(invoice.dueDate)}
              </p>
            )}
            <Badge
              color={isPaid ? 'green' : invoice.status === 'expired' ? 'red' : 'yellow'}
              className="mt-2"
            >
              {isPaid ? 'Paid' : invoice.status || 'Unpaid'}
            </Badge>
          </div>
        </div>

        {/* Billed to */}
        {invoice.customerSnapshot && (
          <div className="py-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Billed to
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {invoice.customerSnapshot.name || '—'}
            </p>
            {invoice.customerSnapshot.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {invoice.customerSnapshot.email}
              </p>
            )}
            {invoice.customerSnapshot.phone && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {invoice.customerSnapshot.phone}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="pb-2 text-left font-medium">Description</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-gray-900 dark:text-gray-100">
                    {item.name}
                    {item.description && (
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </span>
                    )}
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {item.qty} × {formatMoney(item.unitPrice, currency)}
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                    {formatMoney(item.subtotal, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span>{formatMoney(invoice.subtotal || invoice.total, currency)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>-{formatMoney(invoice.discount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <span>Total</span>
            <span>{formatMoney(invoice.total, currency)}</span>
          </div>
          {isPaid && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Paid</span>
              <span>{formatMoney(invoice.amountPaid, currency)}</span>
            </div>
          )}
          {!isPaid && (
            <div className="flex justify-between text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              <span>Amount due</span>
              <span>{formatMoney(invoice.amountDue, currency)}</span>
            </div>
          )}
        </div>

        {/* Pay button */}
        {!isPaid && hasStk && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
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
              <p className="text-sm text-red-600 dark:text-red-400">{payError}</p>
            )}

            <Button
              onClick={handlePay}
              loading={payState === 'sending' || payState === 'waiting'}
              className="w-full"
              size="lg"
            >
              <HiPhone className="w-4 h-4" />
              {payState === 'waiting'
                ? 'Waiting for payment...'
                : `Pay ${formatMoney(invoice.amountDue, currency)} with M-Pesa`}
            </Button>
          </div>
        )}

        {isPaid && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <HiCheckCircle className="w-5 h-5" />
              <div className="text-sm">
                <p className="font-medium">Payment confirmed</p>
                {invoice.paidAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(invoice.paidAt).toLocaleString('en-KE')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isPaid && otherInstructions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
              Other payment methods
            </p>
            <div className="space-y-2">
              {otherInstructions.map((p, i) => (
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
          </div>
        )}

        {/* Refresh */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Button variant="ghost" size="sm" onClick={load}>
            <HiRefresh className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {invoice.notes && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            {invoice.notes}
          </p>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Questions? Contact support@bizhub.co.ke
      </p>
    </div>
  );
}