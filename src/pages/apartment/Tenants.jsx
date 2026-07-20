import { useState, useEffect } from 'react';
import { getTenants, createTenant, updateTenant, deleteTenant } from '../../api/apartment/tenants';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { Plus, Edit, Trash2, Users, Search, Phone, Mail } from 'lucide-react';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', idNumber: '', occupation: '', emergencyName: '', emergencyPhone: '', notes: '' });
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); }, [search]);

  const fetchData = async () => { setLoading(true); try { const res = await getTenants({ search }); setTenants(res?.data || []); } catch {} finally { setLoading(false); }; };
  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '', idNumber: '', occupation: '', emergencyName: '', emergencyPhone: '', notes: '' }); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, email: t.email || '', phone: t.phone || '', idNumber: t.idNumber || '', occupation: t.occupation || '', emergencyName: t.emergencyContact?.name || '', emergencyPhone: t.emergencyContact?.phone || '', notes: t.notes || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone } };
      if (editing) { await updateTenant(editing._id, data); success('Updated'); }
      else { await createTenant(data); success('Added'); }
      setShowModal(false); fetchData();
    } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteTenant(id); success('Deleted'); fetchData(); } catch (err) { error('Failed'); } };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'actions', label: '', render: (r) => <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)} className="text-red-500"><Trash2 size={14} /></Button></div> },
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1><Button onClick={openCreate}><Plus size={18} /> Add Tenant</Button></div>
      <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      {tenants.length === 0 ? <Card className="text-center py-12"><Users size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No tenants</h3></Card> : <Table columns={columns} data={tenants} />}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Tenant' : 'Add Tenant'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4"><Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /><Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="ID Number" value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} /><Input label="Occupation" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Emergency Contact" value={form.emergencyName} onChange={e => setForm({...form, emergencyName: e.target.value})} /><Input label="Emergency Phone" value={form.emergencyPhone} onChange={e => setForm({...form, emergencyPhone: e.target.value})} /></div>
          <Input label="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}