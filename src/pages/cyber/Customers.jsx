import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../api/cyber/customers';
import { getPackages } from '../../api/cyber/packages';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', packageId: '', remainingHours: '', notes: '' });
  const { success, error } = useNotification();

  useEffect(() => { fetchCustomers(); getPackages().then(res => setPackages(res?.data || [])).catch(() => {}); }, []);

  const fetchCustomers = async () => { setLoading(true); try { const res = await getCustomers(); setCustomers(res?.data || []); } catch {} finally { setLoading(false); }; };
  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '', packageId: '', remainingHours: '', notes: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', packageId: c.packageId?._id || c.packageId || '', remainingHours: c.remainingHours || '', notes: c.notes || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, remainingHours: Number(form.remainingHours) || 0 };
      if (editing) { await updateCustomer(editing._id, data); success('Updated'); }
      else { await createCustomer(data); success('Added'); }
      setShowModal(false); fetchCustomers();
    } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteCustomer(id); success('Deleted'); fetchCustomers(); } catch (err) { error('Failed'); } };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'packageId', label: 'Package', render: (r) => r.packageId?.name || '—' },
    { key: 'remainingHours', label: 'Hours Left', render: (r) => <Badge color={r.remainingHours > 0 ? 'green' : 'red'}>{r.remainingHours || 0}</Badge> },
    { key: 'actions', label: '', render: (r) => <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)} className="text-red-500"><Trash2 size={14} /></Button></div> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1><Button onClick={openCreate}><Plus size={18} /> Add Customer</Button></div>
      {loading ? <Spinner /> : customers.length === 0 ? <Card className="text-center py-12"><Users size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No customers</h3></Card> : <Table columns={columns} data={customers} />}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4"><Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /><Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <Select label="Package" value={form.packageId} onChange={e => setForm({...form, packageId: e.target.value})} options={[{ value: '', label: 'None' }, ...packages.map(p => ({ value: p._id, label: `${p.name} (${p.hours}hrs)` }))]} />
          <Input label="Remaining Hours" type="number" value={form.remainingHours} onChange={e => setForm({...form, remainingHours: e.target.value})} />
          <Input label="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}