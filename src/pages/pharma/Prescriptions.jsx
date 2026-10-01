import { useState, useEffect } from 'react';
import { getPrescriptions, createPrescription, updatePrescription, updatePrescriptionStatus } from '../../api/pharma/prescriptions';
import { getMedicines } from '../../api/pharma/medicines';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, Eye, Edit, CheckCircle, X, Search } from 'lucide-react';

const statusColors = { pending: 'yellow', processing: 'blue', ready: 'green', dispensed: 'gray', cancelled: 'red' };

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', doctorName: '', hospitalName: '', items: [], notes: '' });
  const { success, error } = useNotification();

  useEffect(() => {
    fetchPrescriptions();
    getMedicines({ limit: 200 }).then(res => setMedicines(res?.data || [])).catch(() => {});
  }, [page, search]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await getPrescriptions({ page, limit: 20, search });
      setPrescriptions(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch {} finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ customerName: '', customerPhone: '', doctorName: '', hospitalName: '', items: [], notes: '' }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ customerName: p.customerName, customerPhone: p.customerPhone||'', doctorName: p.doctorName||'', hospitalName: p.hospitalName||'', items: p.items||[], notes: p.notes||'' }); setShowModal(true); };
  const openView = (p) => { setViewing(p); setShowView(true); };

  const addItem = () => setForm({ ...form, items: [...form.items, { medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, value) => {
    const items = [...form.items];
    if (field === 'medicineId') {
      const med = medicines.find(m => m._id === value);
      items[i] = { ...items[i], medicineId: value, medicineName: med?.name || '', dosage: med?.dosage || '' };
    } else {
      items[i] = { ...items[i], [field]: value };
    }
    setForm({ ...form, items });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await updatePrescription(editing._id, form); success('Updated'); }
      else { await createPrescription(form); success('Created'); }
      setShowModal(false); fetchPrescriptions();
    } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleStatus = async (id, status) => {
    try { await updatePrescriptionStatus(id, status); success('Status updated'); fetchPrescriptions(); } catch (err) { error('Failed'); }
  };

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'items', label: 'Items', render: (r) => `${r.items?.length||0}` },
    { key: 'status', label: 'Status', render: (r) => <Badge color={statusColors[r.status]}>{r.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openView(r)}><Eye size={14} /></Button>
        {r.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit size={14} /></Button>}
        {r.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'processing')} className="text-blue-500"><CheckCircle size={14} /></Button>}
        {r.status === 'processing' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'ready')} className="text-green-500"><CheckCircle size={14} /></Button>}
        {r.status !== 'cancelled' && r.status !== 'dispensed' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'cancelled')} className="text-red-500"><X size={14} /></Button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
        <Button onClick={openCreate}><Plus size={18} /> New Prescription</Button>
      </div>
      <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      {loading ? <Spinner /> : prescriptions.length === 0 ? (
        <Card className="text-center py-12"><span className="text-4xl">📋</span><h3 className="text-lg font-medium mt-4">No prescriptions</h3></Card>
      ) : <><Table columns={columns} data={prescriptions} /><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Prescription' : 'New Prescription'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Customer Name" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required />
            <Input label="Phone" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} />
            <Input label="Doctor" value={form.doctorName} onChange={e => setForm({...form, doctorName: e.target.value})} />
            <Input label="Hospital" value={form.hospitalName} onChange={e => setForm({...form, hospitalName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><h4 className="font-medium text-sm">Medicines</h4><Button size="sm" variant="secondary" type="button" onClick={addItem}>+ Add</Button></div>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-end p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <select value={item.medicineId} onChange={e => updateItem(i, 'medicineId', e.target.value)} className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm px-2 py-1.5">
                  <option value="">Select</option>
                  {medicines.map(m => <option key={m._id} value={m._id}>{m.name} {m.dosage||''}</option>)}
                </select>
                <Input value={item.dosage} onChange={e => updateItem(i, 'dosage', e.target.value)} placeholder="Dosage" className="w-20" />
                <Input value={item.frequency} onChange={e => updateItem(i, 'frequency', e.target.value)} placeholder="Freq" className="w-16" />
                <Input value={item.duration} onChange={e => updateItem(i, 'duration', e.target.value)} placeholder="Dur" className="w-16" />
                <Input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-16" />
                <button type="button" onClick={() => removeItem(i)} className="text-red-500 p-1"><X size={14} /></button>
              </div>
            ))}
          </div>
          <Input label="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showView} onClose={() => setShowView(false)} title="Prescription Details" size="md">
        {viewing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm"><div><span className="text-gray-500">Customer:</span> <strong>{viewing.customerName}</strong></div><div><span className="text-gray-500">Phone:</span> {viewing.customerPhone||'—'}</div><div><span className="text-gray-500">Doctor:</span> {viewing.doctorName||'—'}</div><div><span className="text-gray-500">Hospital:</span> {viewing.hospitalName||'—'}</div></div>
            <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-1">Medicine</th><th className="text-left py-1">Dosage</th><th className="text-left py-1">Freq</th><th className="text-left py-1">Dur</th><th className="text-right py-1">Qty</th></tr></thead><tbody>{viewing.items?.map((item,i)=><tr key={i} className="border-b"><td className="py-1">{item.medicineName}</td><td className="py-1">{item.dosage}</td><td className="py-1">{item.frequency}</td><td className="py-1">{item.duration}</td><td className="text-right py-1">{item.quantity}</td></tr>)}</tbody></table>
            <p className="text-xs text-gray-500">Status: <Badge color={statusColors[viewing.status]}>{viewing.status}</Badge></p>
          </div>
        )}
      </Modal>
    </div>
  );
}