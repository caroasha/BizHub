import { useState, useEffect } from 'react';
import { getUnits, createUnit, updateUnit, deleteUnit } from '../../api/apartment/units';
import { getProperties } from '../../api/apartment/properties';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/format';
import { Plus, Edit, Trash2, Home } from 'lucide-react';

export default function Units() {
  const [units, setUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ number: '', type: '', rent: '', deposit: '', propertyId: '', floor: '', bedrooms: '1' });
  const [filterProperty, setFilterProperty] = useState('');
  const { success, error } = useNotification();

  useEffect(() => {
    fetchUnits();
    getProperties().then(res => setProperties(res?.data || [])).catch(() => {});
  }, []);

  const fetchUnits = async () => { setLoading(true); try { const params = {}; if (filterProperty) params.propertyId = filterProperty; const res = await getUnits(params); setUnits(res?.data || []); } catch {} finally { setLoading(false); }; };
  useEffect(() => { fetchUnits(); }, [filterProperty]);

  const openCreate = () => { setEditing(null); setForm({ number: '', type: '', rent: '', deposit: '', propertyId: properties[0]?._id || '', floor: '', bedrooms: '1' }); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ number: u.number, type: u.type || '', rent: u.rent, deposit: u.deposit || '', propertyId: u.propertyId?._id || u.propertyId || '', floor: u.floor || '', bedrooms: u.bedrooms || '1' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, rent: Number(form.rent), deposit: Number(form.deposit), bedrooms: Number(form.bedrooms) };
      if (editing) { await updateUnit(editing._id, data); success('Updated'); }
      else { await createUnit(data); success('Added'); }
      setShowModal(false); fetchUnits();
    } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteUnit(id); success('Deleted'); fetchUnits(); } catch (err) { error('Failed'); } };

  const statusColors = { vacant: 'green', occupied: 'blue', maintenance: 'red' };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Units</h1><Button onClick={openCreate}><Plus size={18} /> Add Unit</Button></div>
      <Select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} options={[{ value: '', label: 'All Properties' }, ...properties.map(p => ({ value: p._id, label: p.name }))]} className="max-w-xs" />
      {units.length === 0 ? (
        <Card className="text-center py-12"><Home size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No units</h3></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map(u => (
            <Card key={u._id} className="hover:shadow-md">
              <div className="flex justify-between items-start mb-3"><div><h3 className="font-semibold">Unit {u.number}</h3><p className="text-xs text-gray-500">{u.type} · {u.bedrooms} bed</p><p className="text-xs text-gray-400">{u.propertyId?.name || ''}</p></div><Badge color={statusColors[u.status] || 'gray'}>{u.status}</Badge></div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3"><div><p className="text-gray-500">Rent</p><p className="font-bold">{formatCurrency(u.rent)}</p></div><div><p className="text-gray-500">Deposit</p><p className="font-bold">{formatCurrency(u.deposit)}</p></div></div>
              <div className="flex gap-2 pt-3 border-t"><Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(u._id)} className="text-red-500"><Trash2 size={14} /></Button></div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Unit' : 'Add Unit'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Select label="Property *" value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})} required options={[{ value: '', label: 'Select...' }, ...properties.map(p => ({ value: p._id, label: p.name }))]} />
          <div className="grid grid-cols-2 gap-4"><Input label="Unit Number *" value={form.number} onChange={e => setForm({...form, number: e.target.value})} required /><Input label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} placeholder="1 Bedroom" /></div>
          <div className="grid grid-cols-3 gap-4"><Input label="Rent *" type="number" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} required /><Input label="Deposit" type="number" value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} /><Input label="Beds" type="number" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} /></div>
          <Input label="Floor" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}