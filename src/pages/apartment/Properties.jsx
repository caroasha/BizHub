import { useState, useEffect } from 'react';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../../api/apartment/properties';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { Plus, Edit, Trash2, Building, MapPin } from 'lucide-react';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', description: '' });
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => { setLoading(true); try { const res = await getProperties(); setProperties(res?.data || []); } catch {} finally { setLoading(false); }; };
  const openCreate = () => { setEditing(null); setForm({ name: '', location: '', description: '' }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, location: p.location || '', description: p.description || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await updateProperty(editing._id, form); success('Updated'); }
      else { await createProperty(form); success('Added'); }
      setShowModal(false); fetchData();
    } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteProperty(id); success('Deleted'); fetchData(); } catch (err) { error('Failed'); } };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1><Button onClick={openCreate}><Plus size={18} /> Add Property</Button></div>
      {properties.length === 0 ? (
        <Card className="text-center py-12"><Building size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No properties</h3><Button onClick={openCreate} className="mt-4"><Plus size={18} /> Add Property</Button></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(p => (
            <Card key={p._id} className="hover:shadow-md">
              <div className="flex justify-between items-start mb-3"><div><h3 className="font-semibold">{p.name}</h3><div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><MapPin size={12} />{p.location || 'No location'}</div></div></div>
              {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
              <div className="flex gap-2 pt-3 border-t"><Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(p._id)} className="text-red-500"><Trash2 size={14} /></Button></div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Property' : 'Add Property'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}