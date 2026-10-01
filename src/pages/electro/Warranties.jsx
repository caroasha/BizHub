import { useState, useEffect } from 'react';
import { getWarranties, createWarranty, updateWarranty } from '../../api/electro/warranties';
import { getProducts } from '../../api/electro/products';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, Shield } from 'lucide-react';

export default function Warranties() {
  const [warranties, setWarranties] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', productName: '', serialNo: '', warrantyPeriod: '', startDate: '', endDate: '' });
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); getProducts({ limit: 200 }).then(res => setProducts(res?.data || [])).catch(() => {}); }, []);
  const fetchData = async () => { setLoading(true); try { const res = await getWarranties(); setWarranties(res?.data || []); } catch {} finally { setLoading(false); }; };

  const handleSave = async (e) => { e.preventDefault(); setSaving(true); try { await createWarranty(form); success('Created'); setShowModal(false); fetchData(); } catch (err) { error('Failed'); } setSaving(false); };

  const statusColors = { active: 'green', expired: 'red', claimed: 'yellow' };

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'productName', label: 'Product' },
    { key: 'serialNo', label: 'Serial' },
    { key: 'startDate', label: 'Start', render: (r) => formatDate(r.startDate) },
    { key: 'endDate', label: 'End', render: (r) => formatDate(r.endDate) },
    { key: 'status', label: 'Status', render: (r) => <Badge color={statusColors[r.status]}>{r.status}</Badge> },
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warranties</h1><Button onClick={() => { setForm({ customerName: '', customerPhone: '', productName: '', serialNo: '', warrantyPeriod: '', startDate: '', endDate: '' }); setShowModal(true); }}><Plus size={18} /> Add Warranty</Button></div>
      {warranties.length === 0 ? <Card className="text-center py-12"><Shield size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No warranties</h3></Card> : <Table columns={columns} data={warranties} />}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Warranty" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><Input label="Customer Name *" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required /><Input label="Phone" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} /></div>
          <Input label="Product Name *" value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4"><Input label="Serial No" value={form.serialNo} onChange={e => setForm({...form, serialNo: e.target.value})} /><Input label="Warranty Period" value={form.warrantyPeriod} onChange={e => setForm({...form, warrantyPeriod: e.target.value})} placeholder="12 months" /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Start Date *" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /><Input label="End Date *" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}