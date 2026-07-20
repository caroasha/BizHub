import { useState, useEffect } from 'react';
import { getRepairs, createRepair, updateRepair } from '../../api/electro/repairs';
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
import { Plus, Wrench } from 'lucide-react';

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', device: '', brand: '', model: '', serialNo: '', issue: '', cost: '' });
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { setLoading(true); try { const res = await getRepairs(); setRepairs(res?.data || []); } catch {} finally { setLoading(false); }; };

  const openCreate = () => { setEditing(null); setForm({ customerName: '', customerPhone: '', device: '', brand: '', model: '', serialNo: '', issue: '', cost: '' }); setShowModal(true); };
  const handleSave = async (e) => { e.preventDefault(); setSaving(true); try { if (editing) { await updateRepair(editing._id, form); success('Updated'); } else { await createRepair(form); success('Created'); } setShowModal(false); fetchData(); } catch (err) { error('Failed'); } setSaving(false); };

  const handleStatus = async (id, status) => { try { await updateRepair(id, { status }); if (status === 'completed') await updateRepair(id, { completedDate: new Date() }); success('Updated'); fetchData(); } catch (err) { error('Failed'); } };

  const statusColors = { received: 'yellow', diagnosing: 'blue', repairing: 'purple', completed: 'green', delivered: 'gray', cancelled: 'red' };

  const columns = [
    { key: 'repairNumber', label: 'Repair #' },
    { key: 'customerName', label: 'Customer' },
    { key: 'device', label: 'Device' },
    { key: 'issue', label: 'Issue', render: (r) => <span className="text-sm truncate max-w-[150px] block">{r.issue}</span> },
    { key: 'cost', label: 'Cost', render: (r) => r.cost ? formatCurrency(r.cost) : '—' },
    { key: 'status', label: 'Status', render: (r) => <Badge color={statusColors[r.status]}>{r.status}</Badge> },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        {r.status === 'received' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'diagnosing')} className="text-blue-500">Diagnose</Button>}
        {r.status === 'diagnosing' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'repairing')} className="text-purple-500">Repair</Button>}
        {r.status === 'repairing' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'completed')} className="text-green-500">Complete</Button>}
        {r.status === 'completed' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'delivered')} className="text-gray-500">Deliver</Button>}
        {r.status !== 'delivered' && r.status !== 'cancelled' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'cancelled')} className="text-red-500">Cancel</Button>}
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repairs</h1><Button onClick={openCreate}><Plus size={18} /> New Repair</Button></div>
      {repairs.length === 0 ? <Card className="text-center py-12"><Wrench size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No repairs</h3></Card> : <Table columns={columns} data={repairs} />}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Repair" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><Input label="Customer Name *" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required /><Input label="Phone" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} /></div>
          <Input label="Device *" value={form.device} onChange={e => setForm({...form, device: e.target.value})} required />
          <div className="grid grid-cols-3 gap-4"><Input label="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /><Input label="Model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} /><Input label="Serial No" value={form.serialNo} onChange={e => setForm({...form, serialNo: e.target.value})} /></div>
          <Input label="Issue *" value={form.issue} onChange={e => setForm({...form, issue: e.target.value})} required />
          <Input label="Cost (KES)" type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Create Repair</Button></div>
        </form>
      </Modal>
    </div>
  );
}