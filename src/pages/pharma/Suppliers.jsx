import { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/pharma/suppliers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', alternatePhone: '', address: '', contactPerson: '', notes: '' });
  const { success, error } = useNotification();

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try { const res = await getSuppliers(); setSuppliers(res?.data || []); } catch {} finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', company: '', phone: '', email: '', alternatePhone: '', address: '', contactPerson: '', notes: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, company: s.company||'', phone: s.phone||'', email: s.email||'', alternatePhone: s.alternatePhone||'', address: s.address||'', contactPerson: s.contactPerson||'', notes: s.notes||'' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await updateSupplier(editing._id, form); success('Updated'); }
      else { await createSupplier(form); success('Created'); }
      setShowModal(false); fetchSuppliers();
    } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try { await deleteSupplier(id); success('Deleted'); fetchSuppliers(); } catch (err) { error('Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'company', label: 'Company' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)} className="text-red-500"><Trash2 size={14} /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
        <Button onClick={openCreate}><Plus size={18} /> Add Supplier</Button>
      </div>
      {loading ? <Spinner /> : suppliers.length === 0 ? (
        <Card className="text-center py-12"><span className="text-4xl">🚚</span><h3 className="text-lg font-medium mt-4">No suppliers</h3></Card>
      ) : <Table columns={columns} data={suppliers} />}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            <Input label="Alternate Phone" value={form.alternatePhone} onChange={e => setForm({...form, alternatePhone: e.target.value})} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <Input label="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Person" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} />
          </div>
          <Input label="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}