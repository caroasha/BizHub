import { useState, useEffect } from 'react';
import { getPayments, createPayment } from '../../api/apartment/payments';
import { getLeases } from '../../api/apartment/leases';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, CreditCard } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ leaseId: '', amount: '', month: '', paymentMethod: 'cash' });
  const { success, error } = useNotification();

  useEffect(() => { fetchPayments(); getLeases().then(res => setLeases((res?.data || []).filter(l => l.status === 'active'))).catch(() => {}); }, [page]);

  const fetchPayments = async () => { setLoading(true); try { const res = await getPayments({ page, limit: 20 }); setPayments(res?.data || []); setTotalPages(res?.pagination?.totalPages || 1); } catch {} finally { setLoading(false); }; };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const lease = leases.find(l => l._id === form.leaseId);
      await createPayment({ ...form, amount: Number(form.amount), unitId: lease?.unitId, occupantId: lease?.occupantId });
      success('Payment recorded'); setShowModal(false); fetchPayments();
    } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const columns = [
    { key: 'receiptNumber', label: 'Receipt' },
    { key: 'occupantId', label: 'Tenant', render: (r) => r.occupantId?.name || 'N/A' },
    { key: 'unitId', label: 'Unit', render: (r) => r.unitId?.number || 'N/A' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'month', label: 'Month' },
    { key: 'paymentMethod', label: 'Method', render: (r) => <span className="capitalize">{r.paymentMethod}</span> },
    { key: 'paymentDate', label: 'Date', render: (r) => formatDate(r.paymentDate) },
  ];

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toLocaleString('en-KE', { month: 'long', year: 'numeric' });

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1><Button onClick={() => { setForm({ leaseId: '', amount: '', month: thisMonth, paymentMethod: 'cash' }); setShowModal(true); }}><Plus size={18} /> Record Payment</Button></div>
      {payments.length === 0 ? <Card className="text-center py-12"><CreditCard size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No payments</h3></Card> : <><Table columns={columns} data={payments} /><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Lease *" value={form.leaseId} onChange={e => setForm({...form, leaseId: e.target.value})} required options={[{ value: '', label: 'Select...' }, ...leases.map(l => ({ value: l._id, label: `${l.occupantId?.name || 'Tenant'} - Unit ${l.unitId?.number || 'N/A'}` }))]} />
          <Input label="Amount *" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          <Input label="Month" value={form.month} onChange={e => setForm({...form, month: e.target.value})} />
          <Select label="Method" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} options={[{ value: 'cash', label: 'Cash' }, { value: 'mpesa', label: 'M-Pesa' }, { value: 'bank', label: 'Bank Transfer' }]} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Record</Button></div>
        </form>
      </Modal>
    </div>
  );
}