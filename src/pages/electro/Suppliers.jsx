import { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/electro/suppliers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', address: '', contactPerson: '' });
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { setLoading(true); try { const res = await getSuppliers(); setSuppliers(res?.data || []); } catch {} finally { setLoading(false); }; };
  const openCreate = () => { setEditing(null); setForm({ name: '', company: '', phone: '', email: '', address: '', contactPerson: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, company: s.company||'', phone: s.phone||'', email: s.email||'', address: s.address||'', contactPerson: s.contactPerson||'' }); setShowModal(true); };

  const handleSave = async (e) => { e.preventDefault(); setSaving(true); try { if (editing) { await updateSupplier(editing._id, form); success('Updated'); } else { await createSupplier(form); success('Added'); } setShowModal(false); fetchData(); } catch (err) { error('Failed'); } setSaving(false); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteSupplier(id); success('Deleted'); fetchData(); } catch (err) { error('Failed'); } };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'company', label: 'Company' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'actions', label: '', render: (r) => <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)} className="text-red-500"><Trash2 size={14} /></Button></div> },
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1><Button onClick={openCreate}><Plus size={18} /> Add Supplier</Button></div>
      {suppliers.length === 0 ? <Card className="text-center py-12"><Truck size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No suppliers</h3></Card> : <Table columns={columns} data={suppliers} />}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><Input label="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /><Input label="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Phone *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /><Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <Input label="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <Input label="Contact Person" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}