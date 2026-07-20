import { useState, useEffect } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage } from '../../api/cyber/packages';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/format';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', hours: '', price: '', validityDays: '30' });
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { setLoading(true); try { const res = await getPackages(); setPackages(res?.data || []); } catch {} finally { setLoading(false); }; };
  const openCreate = () => { setEditing(null); setForm({ name: '', hours: '', price: '', validityDays: '30' }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, hours: p.hours, price: p.price, validityDays: p.validityDays }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, hours: Number(form.hours), price: Number(form.price), validityDays: Number(form.validityDays) };
      if (editing) { await updatePackage(editing._id, data); success('Updated'); }
      else { await createPackage(data); success('Added'); }
      setShowModal(false); fetchData();
    } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deletePackage(id); success('Deleted'); fetchData(); } catch (err) { error('Failed'); } };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Packages</h1><Button onClick={openCreate}><Plus size={18} /> Add Package</Button></div>
      {loading ? <Spinner /> : packages.length === 0 ? <Card className="text-center py-12"><Package size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No packages</h3></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(p => (
            <Card key={p._id}>
              <div className="flex justify-between items-start mb-3"><h3 className="font-semibold">{p.name}</h3><Badge>{p.hours} hrs</Badge></div>
              <p className="text-2xl font-extrabold text-primary-600">{formatCurrency(p.price)}</p>
              <p className="text-xs text-gray-500 mt-1">Valid for {p.validityDays} days</p>
              <div className="flex gap-2 mt-3"><Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(p._id)} className="text-red-500"><Trash2 size={14} /></Button></div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Package' : 'Add Package'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Hours *" type="number" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} required />
          <Input label="Price (KSh) *" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
          <Input label="Validity (Days)" type="number" value={form.validityDays} onChange={e => setForm({...form, validityDays: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}