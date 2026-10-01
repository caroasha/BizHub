import { useState, useEffect } from 'react';
import { getComputers, createComputer, updateComputer, deleteComputer } from '../../api/cyber/computers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotification } from '../../hooks/useNotification';
import { Plus, Edit, Trash2, Search, HardDrive, Monitor, Printer, Router, Smartphone, Wifi } from 'lucide-react';

const typeIcons = {
  computer: Monitor, printer: Printer, router: Router, phone: Smartphone, wifi: Wifi, other: HardDrive,
};

const typeOptions = [
  { value: 'computer', label: '💻 Computer' },
  { value: 'printer', label: '🖨️ Printer' },
  { value: 'router', label: '📡 Router' },
  { value: 'phone', label: '📱 Phone' },
  { value: 'wifi', label: '📶 WiFi Device' },
  { value: 'other', label: '📦 Other' },
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'computer', specs: '', serialNo: '', status: 'available', notes: '' });
  const { success, error } = useNotification();

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await getComputers(); setItems(res?.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', type: 'computer', specs: '', serialNo: '', status: 'available', notes: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, type: item.type || 'computer', specs: item.specs || '', serialNo: item.serialNo || '', status: item.status || 'available', notes: item.notes || '' }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) { await updateComputer(editing._id, form); success('Updated'); }
      else { await createComputer(form); success('Added'); }
      setModalOpen(false); fetchItems();
    } catch (err) { error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await deleteComputer(id); success('Deleted'); fetchItems(); } catch (err) { error('Failed'); }
  };

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.specs?.toLowerCase().includes(search.toLowerCase()) || i.serialNo?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || i.type === typeFilter;
    return matchSearch && matchType;
  });

  const statusColors = { available: 'green', 'in-use': 'blue', maintenance: 'red' };
  const totalItems = items.length;
  const availableItems = items.filter(i => i.status === 'available').length;
  const inUseItems = items.filter(i => i.status === 'in-use').length;

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <Button onClick={openCreate}><Plus size={18} /> Add Item</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center"><p className="text-3xl font-extrabold text-primary-600">{totalItems}</p><p className="text-xs text-gray-500 mt-1">Total Items</p></Card>
        <Card className="text-center"><p className="text-3xl font-extrabold text-green-500">{availableItems}</p><p className="text-xs text-gray-500 mt-1">Available</p></Card>
        <Card className="text-center"><p className="text-3xl font-extrabold text-blue-500">{inUseItems}</p><p className="text-xs text-gray-500 mt-1">In Use</p></Card>
        <Card className="text-center"><p className="text-3xl font-extrabold text-red-500">{totalItems - availableItems - inUseItems}</p><p className="text-xs text-gray-500 mt-1">Maintenance</p></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search by name, specs, or serial..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={[{ value: '', label: 'All Types' }, ...typeOptions]} className="w-full sm:w-48" />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <HardDrive size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No items found</h3>
          <p className="text-sm text-gray-500 mt-1">{search || typeFilter ? 'Try a different search.' : 'Add your first item.'}</p>
          {!search && !typeFilter && <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Add Item</Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const Icon = typeIcons[item.type] || HardDrive;
            return (
              <Card key={item._id} className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Icon size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{item.type || 'computer'}</p>
                    </div>
                  </div>
                  <Badge color={statusColors[item.status] || 'gray'}>{item.status}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  {item.specs && <p className="text-gray-500"><span className="text-gray-400">Specs:</span> {item.specs}</p>}
                  {item.serialNo && <p className="text-gray-500"><span className="text-gray-400">Serial:</span> {item.serialNo}</p>}
                  {item.notes && <p className="text-gray-400 text-xs mt-2">{item.notes}</p>}
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit size={14} /> Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item._id)} className="text-red-500"><Trash2 size={14} /> Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Item'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Item Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. HP Laptop, Canon Printer" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={typeOptions} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[{ value: 'available', label: 'Available' }, { value: 'in-use', label: 'In Use' }, { value: 'maintenance', label: 'Maintenance' }]} />
          </div>
          <Input label="Specifications" value={form.specs} onChange={e => setForm({ ...form, specs: e.target.value })} placeholder="e.g. Core i7, 16GB RAM, 512GB SSD" />
          <Input label="Serial Number" value={form.serialNo} onChange={e => setForm({ ...form, serialNo: e.target.value })} placeholder="e.g. SN-123456" />
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 resize-y" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add Item'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}